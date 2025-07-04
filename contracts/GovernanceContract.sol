// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GovernanceContract
 * @dev Smart contract for community governance and voting
 */
contract GovernanceContract is Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _proposalIds;
    
    enum ProposalStatus { Active, Passed, Rejected, Executed }
    enum ProposalCategory { Governance, Funding, Economics, Technical, Community }
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        string rationale;
        string implementation;
        string timeline;
        ProposalCategory category;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        ProposalStatus status;
        uint256 createdAt;
        bool executed;
    }
    
    struct Vote {
        address voter;
        bool support; // true for yes, false for no
        uint256 timestamp;
        string reason;
    }
    
    // Mappings
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote[]) public proposalVotes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256[]) public userProposals;
    mapping(address => uint256[]) public userVotes;
    mapping(address => bool) public proposers; // Authorized proposers
    
    // Governance parameters
    uint256 public votingDuration = 30 days;
    uint256 public minimumVotesRequired = 100;
    uint256 public passingThreshold = 60; // 60% required to pass
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalCategory category
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        string reason
    );
    
    event ProposalStatusChanged(
        uint256 indexed proposalId,
        ProposalStatus newStatus
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    
    // Modifiers
    modifier onlyProposer() {
        require(proposers[msg.sender] || msg.sender == owner(), "Not authorized to create proposals");
        _;
    }
    
    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= _proposalIds.current(), "Proposal does not exist");
        _;
    }
    
    modifier votingActive(uint256 _proposalId) {
        require(proposals[_proposalId].status == ProposalStatus.Active, "Voting not active");
        require(block.timestamp <= proposals[_proposalId].deadline, "Voting period ended");
        _;
    }
    
    constructor() {
        // Add contract deployer as initial proposer
        proposers[msg.sender] = true;
    }
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        string memory _rationale,
        string memory _implementation,
        string memory _timeline,
        ProposalCategory _category
    ) external onlyProposer returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        _proposalIds.increment();
        uint256 newProposalId = _proposalIds.current();
        
        proposals[newProposalId] = Proposal({
            id: newProposalId,
            title: _title,
            description: _description,
            rationale: _rationale,
            implementation: _implementation,
            timeline: _timeline,
            category: _category,
            proposer: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + votingDuration,
            status: ProposalStatus.Active,
            createdAt: block.timestamp,
            executed: false
        });
        
        userProposals[msg.sender].push(newProposalId);
        
        emit ProposalCreated(newProposalId, msg.sender, _title, _category);
        
        return newProposalId;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(
        uint256 _proposalId,
        bool _support,
        string memory _reason
    ) external proposalExists(_proposalId) votingActive(_proposalId) {
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");
        
        Proposal storage proposal = proposals[_proposalId];
        
        if (_support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        hasVoted[_proposalId][msg.sender] = true;
        
        proposalVotes[_proposalId].push(Vote({
            voter: msg.sender,
            support: _support,
            timestamp: block.timestamp,
            reason: _reason
        }));
        
        userVotes[msg.sender].push(_proposalId);
        
        emit VoteCast(_proposalId, msg.sender, _support, _reason);
    }
    
    /**
     * @dev Finalize a proposal after voting period
     */
    function finalizeProposal(uint256 _proposalId) external proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp > proposal.deadline, "Voting period not ended");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        require(totalVotes >= minimumVotesRequired, "Not enough votes");
        
        uint256 supportPercentage = (proposal.votesFor * 100) / totalVotes;
        
        if (supportPercentage >= passingThreshold) {
            proposal.status = ProposalStatus.Passed;
        } else {
            proposal.status = ProposalStatus.Rejected;
        }
        
        emit ProposalStatusChanged(_proposalId, proposal.status);
    }
    
    /**
     * @dev Execute a passed proposal (only owner)
     */
    function executeProposal(uint256 _proposalId) external onlyOwner proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Passed, "Proposal not passed");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;
        
        emit ProposalExecuted(_proposalId);
        emit ProposalStatusChanged(_proposalId, ProposalStatus.Executed);
    }
    
    /**
     * @dev Add a proposer (only owner)
     */
    function addProposer(address _proposer) external onlyOwner {
        proposers[_proposer] = true;
    }
    
    /**
     * @dev Remove a proposer (only owner)
     */
    function removeProposer(address _proposer) external onlyOwner {
        proposers[_proposer] = false;
    }
    
    /**
     * @dev Update governance parameters (only owner)
     */
    function updateGovernanceParams(
        uint256 _votingDuration,
        uint256 _minimumVotes,
        uint256 _passingThreshold
    ) external onlyOwner {
        require(_passingThreshold > 50 && _passingThreshold <= 100, "Invalid threshold");
        
        votingDuration = _votingDuration;
        minimumVotesRequired = _minimumVotes;
        passingThreshold = _passingThreshold;
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (Proposal memory) 
    {
        return proposals[_proposalId];
    }
    
    /**
     * @dev Get votes for a proposal
     */
    function getProposalVotes(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (Vote[] memory) 
    {
        return proposalVotes[_proposalId];
    }
    
    /**
     * @dev Get user's proposals
     */
    function getUserProposals(address _user) external view returns (uint256[] memory) {
        return userProposals[_user];
    }
    
    /**
     * @dev Get user's votes
     */
    function getUserVotes(address _user) external view returns (uint256[] memory) {
        return userVotes[_user];
    }
    
    /**
     * @dev Get total number of proposals
     */
    function getTotalProposals() external view returns (uint256) {
        return _proposalIds.current();
    }
    
    /**
     * @dev Get active proposals
     */
    function getActiveProposals() external view returns (Proposal[] memory) {
        uint256 totalProposals = _proposalIds.current();
        uint256 activeCount = 0;
        
        // Count active proposals
        for (uint256 i = 1; i <= totalProposals; i++) {
            if (proposals[i].status == ProposalStatus.Active && 
                block.timestamp <= proposals[i].deadline) {
                activeCount++;
            }
        }
        
        // Create array of active proposals
        Proposal[] memory activeProposals = new Proposal[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalProposals; i++) {
            if (proposals[i].status == ProposalStatus.Active && 
                block.timestamp <= proposals[i].deadline) {
                activeProposals[index] = proposals[i];
                index++;
            }
        }
        
        return activeProposals;
    }
}