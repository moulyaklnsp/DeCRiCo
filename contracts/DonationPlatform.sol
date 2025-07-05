// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DonationPlatform is ReentrancyGuard, Ownable, Pausable {
    struct Request {
        uint256 id;
        address requester;
        string title;
        string description;
        uint256 amountNeeded;
        uint256 amountRaised;
        bool isActive;
        bool isApproved;
        uint256 createdAt;
    }

    struct Donation {
        uint256 requestId;
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Request) public requests;
    mapping(uint256 => Donation[]) public requestDonations;
    mapping(address => uint256[]) public userRequests;
    mapping(address => uint256[]) public userDonations;
    mapping(address => bool) public verifiers;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => uint256) public approvalVotes;
    mapping(uint256 => uint256) public rejectionVotes;

    uint256 public nextRequestId = 1;
    uint256 public constant MINIMUM_VOTES = 3;
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max fee

    event RequestCreated(
        uint256 indexed requestId,
        address indexed requester,
        string title,
        uint256 amountNeeded
    );

    event DonationMade(
        uint256 indexed requestId,
        address indexed donor,
        uint256 amount
    );

    event RequestApproved(uint256 indexed requestId);
    event RequestRejected(uint256 indexed requestId);
    event FundsWithdrawn(uint256 indexed requestId, uint256 amount);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not a verifier");
        _;
    }

    modifier onlyRequester(uint256 _requestId) {
        require(requests[_requestId].requester == msg.sender, "Not the requester");
        _;
    }

    modifier requestExists(uint256 _requestId) {
        require(_requestId > 0 && _requestId < nextRequestId, "Request does not exist");
        _;
    }

    constructor() {
        // Add contract deployer as first verifier
        verifiers[msg.sender] = true;
    }

    function createRequest(
        string memory _title,
        string memory _description,
        uint256 _amountNeeded
    ) external whenNotPaused {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_amountNeeded > 0, "Amount needed must be greater than 0");

        uint256 requestId = nextRequestId++;
        
        requests[requestId] = Request({
            id: requestId,
            requester: msg.sender,
            title: _title,
            description: _description,
            amountNeeded: _amountNeeded,
            amountRaised: 0,
            isActive: true,
            isApproved: false,
            createdAt: block.timestamp
        });

        userRequests[msg.sender].push(requestId);

        emit RequestCreated(requestId, msg.sender, _title, _amountNeeded);
    }

    function voteOnRequest(uint256 _requestId, bool _approve) 
        external 
        onlyVerifier 
        requestExists(_requestId) 
        whenNotPaused 
    {
        require(!hasVoted[_requestId][msg.sender], "Already voted on this request");
        require(requests[_requestId].isActive, "Request is not active");
        require(!requests[_requestId].isApproved, "Request already approved");

        hasVoted[_requestId][msg.sender] = true;

        if (_approve) {
            approvalVotes[_requestId]++;
        } else {
            rejectionVotes[_requestId]++;
        }

        // Check if we have enough votes to make a decision
        uint256 totalVotes = approvalVotes[_requestId] + rejectionVotes[_requestId];
        
        if (totalVotes >= MINIMUM_VOTES) {
            if (approvalVotes[_requestId] > rejectionVotes[_requestId]) {
                requests[_requestId].isApproved = true;
                emit RequestApproved(_requestId);
            } else {
                requests[_requestId].isActive = false;
                emit RequestRejected(_requestId);
            }
        }
    }

    function donate(uint256 _requestId) 
        external 
        payable 
        requestExists(_requestId) 
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(requests[_requestId].isActive, "Request is not active");
        require(requests[_requestId].isApproved, "Request not approved");
        require(
            requests[_requestId].amountRaised < requests[_requestId].amountNeeded,
            "Request already fully funded"
        );

        uint256 donationAmount = msg.value;
        uint256 fee = (donationAmount * platformFee) / 10000;
        uint256 netDonation = donationAmount - fee;

        requests[_requestId].amountRaised += netDonation;

        requestDonations[_requestId].push(Donation({
            requestId: _requestId,
            donor: msg.sender,
            amount: netDonation,
            timestamp: block.timestamp
        }));

        userDonations[msg.sender].push(_requestId);

        // Transfer fee to contract owner
        if (fee > 0) {
            payable(owner()).transfer(fee);
        }

        emit DonationMade(_requestId, msg.sender, netDonation);

        // If request is fully funded, mark as completed
        if (requests[_requestId].amountRaised >= requests[_requestId].amountNeeded) {
            requests[_requestId].isActive = false;
        }
    }

    function withdrawFunds(uint256 _requestId) 
        external 
        onlyRequester(_requestId) 
        requestExists(_requestId) 
        nonReentrant 
        whenNotPaused 
    {
        require(requests[_requestId].isApproved, "Request not approved");
        require(requests[_requestId].amountRaised > 0, "No funds to withdraw");

        uint256 amount = requests[_requestId].amountRaised;
        requests[_requestId].amountRaised = 0;

        payable(msg.sender).transfer(amount);

        emit FundsWithdrawn(_requestId, amount);
    }

    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        require(!verifiers[_verifier], "Already a verifier");

        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    function removeVerifier(address _verifier) external onlyOwner {
        require(verifiers[_verifier], "Not a verifier");
        require(_verifier != owner(), "Cannot remove owner");

        verifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_PLATFORM_FEE, "Fee exceeds maximum");
        platformFee = _fee;
    }

    function pauseContract() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }

    function getRequest(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId) 
        returns (Request memory) 
    {
        return requests[_requestId];
    }

    function getRequestDonations(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId) 
        returns (Donation[] memory) 
    {
        return requestDonations[_requestId];
    }

    function getUserRequests(address _user) external view returns (uint256[] memory) {
        return userRequests[_user];
    }

    function getUserDonations(address _user) external view returns (uint256[] memory) {
        return userDonations[_user];
    }

    function getRequestVotes(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId) 
        returns (uint256 approvals, uint256 rejections) 
    {
        return (approvalVotes[_requestId], rejectionVotes[_requestId]);
    }

    function isVerifier(address _address) external view returns (bool) {
        return verifiers[_address];
    }

    function hasUserVoted(uint256 _requestId, address _user) external view returns (bool) {
        return hasVoted[_requestId][_user];
    }

    // Emergency function to withdraw contract balance (only owner)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // Function to get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}