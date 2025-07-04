// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationContract
 * @dev Smart contract for managing user reputation scores
 */
contract ReputationContract is Ownable {
    
    struct UserReputation {
        uint256 score;
        uint256 donationsCount;
        uint256 requestsCreated;
        uint256 requestsFulfilled;
        uint256 verificationsPerformed;
        uint256 votesParticipated;
        bool isVerified;
        uint256 lastUpdated;
    }
    
    // Mappings
    mapping(address => UserReputation) public userReputations;
    mapping(address => bool) public authorizedContracts;
    
    // Reputation scoring weights
    uint256 public constant DONATION_POINTS = 1;
    uint256 public constant REQUEST_CREATION_POINTS = 5;
    uint256 public constant REQUEST_FULFILLMENT_POINTS = 10;
    uint256 public constant VERIFICATION_POINTS = 3;
    uint256 public constant VOTE_PARTICIPATION_POINTS = 1;
    
    // Events
    event ReputationUpdated(address indexed user, uint256 newScore);
    event UserVerified(address indexed user);
    event ContractAuthorized(address indexed contractAddress);
    
    // Modifiers
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() {}
    
    /**
     * @dev Authorize a contract to update reputation
     */
    function authorizeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = true;
        emit ContractAuthorized(_contract);
    }
    
    /**
     * @dev Remove contract authorization
     */
    function removeContractAuthorization(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
    }
    
    /**
     * @dev Update reputation for donation
     */
    function updateForDonation(address _user, uint256 _amount) external onlyAuthorized {
        UserReputation storage reputation = userReputations[_user];
        reputation.donationsCount++;
        reputation.score += DONATION_POINTS;
        
        // Bonus points for large donations
        if (_amount >= 1 ether) {
            reputation.score += 2;
        }
        
        reputation.lastUpdated = block.timestamp;
        emit ReputationUpdated(_user, reputation.score);
    }
    
    /**
     * @dev Update reputation for request creation
     */
    function updateForRequestCreation(address _user) external onlyAuthorized {
        UserReputation storage reputation = userReputations[_user];
        reputation.requestsCreated++;
        reputation.score += REQUEST_CREATION_POINTS;
        reputation.lastUpdated = block.timestamp;
        emit ReputationUpdated(_user, reputation.score);
    }
    
    /**
     * @dev Update reputation for request fulfillment
     */
    function updateForRequestFulfillment(address _user) external onlyAuthorized {
        UserReputation storage reputation = userReputations[_user];
        reputation.requestsFulfilled++;
        reputation.score += REQUEST_FULFILLMENT_POINTS;
        reputation.lastUpdated = block.timestamp;
        emit ReputationUpdated(_user, reputation.score);
    }
    
    /**
     * @dev Update reputation for verification
     */
    function updateForVerification(address _user) external onlyAuthorized {
        UserReputation storage reputation = userReputations[_user];
        reputation.verificationsPerformed++;
        reputation.score += VERIFICATION_POINTS;
        reputation.lastUpdated = block.timestamp;
        emit ReputationUpdated(_user, reputation.score);
    }
    
    /**
     * @dev Update reputation for vote participation
     */
    function updateForVoteParticipation(address _user) external onlyAuthorized {
        UserReputation storage reputation = userReputations[_user];
        reputation.votesParticipated++;
        reputation.score += VOTE_PARTICIPATION_POINTS;
        reputation.lastUpdated = block.timestamp;
        emit ReputationUpdated(_user, reputation.score);
    }
    
    /**
     * @dev Verify a user (only owner)
     */
    function verifyUser(address _user) external onlyOwner {
        userReputations[_user].isVerified = true;
        userReputations[_user].score += 20; // Bonus for verification
        userReputations[_user].lastUpdated = block.timestamp;
        emit UserVerified(_user);
        emit ReputationUpdated(_user, userReputations[_user].score);
    }
    
    /**
     * @dev Get user reputation
     */
    function getUserReputation(address _user) external view returns (UserReputation memory) {
        return userReputations[_user];
    }
    
    /**
     * @dev Get user reputation score
     */
    function getUserScore(address _user) external view returns (uint256) {
        return userReputations[_user].score;
    }
    
    /**
     * @dev Check if user is verified
     */
    function isUserVerified(address _user) external view returns (bool) {
        return userReputations[_user].isVerified;
    }
    
    /**
     * @dev Get reputation level based on score
     */
    function getReputationLevel(address _user) external view returns (string memory) {
        uint256 score = userReputations[_user].score;
        
        if (score >= 100) return "Expert";
        if (score >= 50) return "Advanced";
        if (score >= 20) return "Intermediate";
        if (score >= 5) return "Beginner";
        return "New";
    }
}