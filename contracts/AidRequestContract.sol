// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AidRequestContract
 * @dev Smart contract for managing disaster relief aid requests
 */
contract AidRequestContract is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _requestIds;
    
    enum RequestStatus { Active, Completed, Cancelled }
    enum Category { Emergency, Medical, Housing, Food, Education, Infrastructure }
    
    struct AidRequest {
        uint256 id;
        string title;
        string description;
        Category category;
        string location;
        uint256 targetAmount;
        uint256 raisedAmount;
        address payable creator;
        uint256 deadline;
        RequestStatus status;
        bool urgent;
        bool verified;
        uint256 createdAt;
        string ipfsHash; // For storing additional documents
    }
    
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
    }
    
    // Mappings
    mapping(uint256 => AidRequest) public aidRequests;
    mapping(uint256 => Donation[]) public requestDonations;
    mapping(address => uint256[]) public userRequests;
    mapping(address => uint256[]) public userDonations;
    mapping(address => bool) public verifiers;
    mapping(address => uint256) public userReputation;
    
    // Events
    event RequestCreated(
        uint256 indexed requestId,
        address indexed creator,
        string title,
        uint256 targetAmount,
        Category category
    );
    
    event DonationMade(
        uint256 indexed requestId,
        address indexed donor,
        uint256 amount,
        string message
    );
    
    event RequestCompleted(uint256 indexed requestId, uint256 totalRaised);
    event RequestVerified(uint256 indexed requestId, address indexed verifier);
    event FundsWithdrawn(uint256 indexed requestId, address indexed creator, uint256 amount);
    
    // Modifiers
    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not authorized to verify");
        _;
    }
    
    modifier requestExists(uint256 _requestId) {
        require(_requestId > 0 && _requestId <= _requestIds.current(), "Request does not exist");
        _;
    }
    
    modifier onlyRequestCreator(uint256 _requestId) {
        require(aidRequests[_requestId].creator == msg.sender, "Not the request creator");
        _;
    }
    
    constructor() {
        // Add contract deployer as initial verifier
        verifiers[msg.sender] = true;
    }
    
    /**
     * @dev Create a new aid request
     */
    function createRequest(
        string memory _title,
        string memory _description,
        Category _category,
        string memory _location,
        uint256 _targetAmount,
        uint256 _durationDays,
        bool _urgent,
        string memory _ipfsHash
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_durationDays > 0, "Duration must be greater than 0");
        
        _requestIds.increment();
        uint256 newRequestId = _requestIds.current();
        
        aidRequests[newRequestId] = AidRequest({
            id: newRequestId,
            title: _title,
            description: _description,
            category: _category,
            location: _location,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            creator: payable(msg.sender),
            deadline: block.timestamp + (_durationDays * 1 days),
            status: RequestStatus.Active,
            urgent: _urgent,
            verified: false,
            createdAt: block.timestamp,
            ipfsHash: _ipfsHash
        });
        
        userRequests[msg.sender].push(newRequestId);
        
        emit RequestCreated(newRequestId, msg.sender, _title, _targetAmount, _category);
        
        return newRequestId;
    }
    
    /**
     * @dev Donate to an aid request
     */
    function donateToRequest(uint256 _requestId, string memory _message) 
        external 
        payable 
        nonReentrant 
        requestExists(_requestId) 
    {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        AidRequest storage request = aidRequests[_requestId];
        require(request.status == RequestStatus.Active, "Request is not active");
        require(block.timestamp <= request.deadline, "Request deadline has passed");
        
        request.raisedAmount += msg.value;
        
        // Record donation
        requestDonations[_requestId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: _message
        }));
        
        userDonations[msg.sender].push(_requestId);
        
        // Update donor reputation
        userReputation[msg.sender] += 1;
        
        emit DonationMade(_requestId, msg.sender, msg.value, _message);
        
        // Auto-complete if target reached
        if (request.raisedAmount >= request.targetAmount) {
            request.status = RequestStatus.Completed;
            emit RequestCompleted(_requestId, request.raisedAmount);
        }
    }
    
    /**
     * @dev Withdraw funds from a request (only creator)
     */
    function withdrawFunds(uint256 _requestId) 
        external 
        nonReentrant 
        requestExists(_requestId) 
        onlyRequestCreator(_requestId) 
    {
        AidRequest storage request = aidRequests[_requestId];
        require(request.raisedAmount > 0, "No funds to withdraw");
        require(request.verified, "Request must be verified to withdraw funds");
        
        uint256 amount = request.raisedAmount;
        request.raisedAmount = 0;
        
        // Update creator reputation
        userReputation[msg.sender] += 5;
        
        request.creator.transfer(amount);
        
        emit FundsWithdrawn(_requestId, msg.sender, amount);
    }
    
    /**
     * @dev Verify a request (only verifiers)
     */
    function verifyRequest(uint256 _requestId) 
        external 
        onlyVerifier 
        requestExists(_requestId) 
    {
        AidRequest storage request = aidRequests[_requestId];
        require(!request.verified, "Request already verified");
        
        request.verified = true;
        
        // Update verifier reputation
        userReputation[msg.sender] += 3;
        
        emit RequestVerified(_requestId, msg.sender);
    }
    
    /**
     * @dev Cancel a request (only creator, before any donations)
     */
    function cancelRequest(uint256 _requestId) 
        external 
        requestExists(_requestId) 
        onlyRequestCreator(_requestId) 
    {
        AidRequest storage request = aidRequests[_requestId];
        require(request.status == RequestStatus.Active, "Request is not active");
        require(request.raisedAmount == 0, "Cannot cancel request with donations");
        
        request.status = RequestStatus.Cancelled;
    }
    
    /**
     * @dev Add a verifier (only owner)
     */
    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
    }
    
    /**
     * @dev Remove a verifier (only owner)
     */
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
    }
    
    /**
     * @dev Get request details
     */
    function getRequest(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId) 
        returns (AidRequest memory) 
    {
        return aidRequests[_requestId];
    }
    
    /**
     * @dev Get donations for a request
     */
    function getRequestDonations(uint256 _requestId) 
        external 
        view 
        requestExists(_requestId) 
        returns (Donation[] memory) 
    {
        return requestDonations[_requestId];
    }
    
    /**
     * @dev Get user's requests
     */
    function getUserRequests(address _user) external view returns (uint256[] memory) {
        return userRequests[_user];
    }
    
    /**
     * @dev Get user's donations
     */
    function getUserDonations(address _user) external view returns (uint256[] memory) {
        return userDonations[_user];
    }
    
    /**
     * @dev Get total number of requests
     */
    function getTotalRequests() external view returns (uint256) {
        return _requestIds.current();
    }
    
    /**
     * @dev Get active requests (paginated)
     */
    function getActiveRequests(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (AidRequest[] memory) 
    {
        uint256 totalRequests = _requestIds.current();
        require(_offset < totalRequests, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > totalRequests) {
            end = totalRequests;
        }
        
        uint256 activeCount = 0;
        for (uint256 i = _offset + 1; i <= end; i++) {
            if (aidRequests[i].status == RequestStatus.Active) {
                activeCount++;
            }
        }
        
        AidRequest[] memory activeRequests = new AidRequest[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = _offset + 1; i <= end; i++) {
            if (aidRequests[i].status == RequestStatus.Active) {
                activeRequests[index] = aidRequests[i];
                index++;
            }
        }
        
        return activeRequests;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}