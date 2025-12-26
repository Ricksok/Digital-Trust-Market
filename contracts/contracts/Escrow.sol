// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Escrow
 * @dev Smart contract for escrow functionality in the Digital Trust Marketplace
 */
contract Escrow is Ownable, ReentrancyGuard {
    enum EscrowStatus {
        PENDING,
        ACTIVE,
        RELEASED,
        REFUNDED,
        DISPUTED
    }

    struct EscrowDetails {
        address investor;
        address fundraiser;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 releasedAt;
        uint256 refundedAt;
        string releaseConditions;
        bool investorApproved;
        bool fundraiserApproved;
    }

    mapping(bytes32 => EscrowDetails) public escrows;
    mapping(address => bytes32[]) public investorEscrows;
    mapping(address => bytes32[]) public fundraiserEscrows;

    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed investor,
        address indexed fundraiser,
        uint256 amount
    );

    event EscrowActivated(bytes32 indexed escrowId);
    event EscrowReleased(bytes32 indexed escrowId, address indexed recipient);
    event EscrowRefunded(bytes32 indexed escrowId, address indexed investor);
    event DisputeCreated(bytes32 indexed escrowId, address indexed initiator);
    event ApprovalGiven(bytes32 indexed escrowId, address indexed approver);

    modifier onlyParticipant(bytes32 escrowId) {
        EscrowDetails memory escrow = escrows[escrowId];
        require(
            msg.sender == escrow.investor || msg.sender == escrow.fundraiser,
            "Not a participant"
        );
        _;
    }

    modifier validEscrow(bytes32 escrowId) {
        require(escrows[escrowId].investor != address(0), "Escrow does not exist");
        _;
    }

    /**
     * @dev Create a new escrow
     */
    function createEscrow(
        address fundraiser,
        string memory releaseConditions
    ) external payable returns (bytes32) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(fundraiser != address(0), "Invalid fundraiser address");
        require(fundraiser != msg.sender, "Cannot escrow to yourself");

        bytes32 escrowId = keccak256(
            abi.encodePacked(msg.sender, fundraiser, msg.value, block.timestamp)
        );

        escrows[escrowId] = EscrowDetails({
            investor: msg.sender,
            fundraiser: fundraiser,
            amount: msg.value,
            status: EscrowStatus.PENDING,
            createdAt: block.timestamp,
            releasedAt: 0,
            refundedAt: 0,
            releaseConditions: releaseConditions,
            investorApproved: false,
            fundraiserApproved: false
        });

        investorEscrows[msg.sender].push(escrowId);
        fundraiserEscrows[fundraiser].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, fundraiser, msg.value);

        return escrowId;
    }

    /**
     * @dev Activate escrow (both parties must approve)
     */
    function activateEscrow(bytes32 escrowId) external validEscrow(escrowId) {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.PENDING, "Escrow not pending");

        if (msg.sender == escrow.investor) {
            escrow.investorApproved = true;
        } else if (msg.sender == escrow.fundraiser) {
            escrow.fundraiserApproved = true;
        } else {
            revert("Not a participant");
        }

        if (escrow.investorApproved && escrow.fundraiserApproved) {
            escrow.status = EscrowStatus.ACTIVE;
            emit EscrowActivated(escrowId);
        } else {
            emit ApprovalGiven(escrowId, msg.sender);
        }
    }

    /**
     * @dev Release funds to fundraiser
     */
    function releaseEscrow(bytes32 escrowId) external validEscrow(escrowId) nonReentrant {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        require(
            msg.sender == escrow.fundraiser || msg.sender == owner(),
            "Not authorized to release"
        );

        escrow.status = EscrowStatus.RELEASED;
        escrow.releasedAt = block.timestamp;

        (bool success, ) = escrow.fundraiser.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit EscrowReleased(escrowId, escrow.fundraiser);
    }

    /**
     * @dev Refund funds to investor
     */
    function refundEscrow(bytes32 escrowId) external validEscrow(escrowId) nonReentrant {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow not active");
        require(
            msg.sender == escrow.investor || msg.sender == owner(),
            "Not authorized to refund"
        );

        escrow.status = EscrowStatus.REFUNDED;
        escrow.refundedAt = block.timestamp;

        (bool success, ) = escrow.investor.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit EscrowRefunded(escrowId, escrow.investor);
    }

    /**
     * @dev Create a dispute
     */
    function createDispute(bytes32 escrowId) external validEscrow(escrowId) onlyParticipant(escrowId) {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.ACTIVE, "Escrow must be active");

        escrow.status = EscrowStatus.DISPUTED;
        emit DisputeCreated(escrowId, msg.sender);
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(bytes32 escrowId) external view returns (EscrowDetails memory) {
        return escrows[escrowId];
    }

    /**
     * @dev Get all escrows for an investor
     */
    function getInvestorEscrows(address investor) external view returns (bytes32[] memory) {
        return investorEscrows[investor];
    }

    /**
     * @dev Get all escrows for a fundraiser
     */
    function getFundraiserEscrows(address fundraiser) external view returns (bytes32[] memory) {
        return fundraiserEscrows[fundraiser];
    }

    /**
     * @dev Admin function to resolve disputes
     */
    function resolveDispute(
        bytes32 escrowId,
        bool releaseToFundraiser
    ) external onlyOwner validEscrow(escrowId) {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.DISPUTED, "Escrow not in dispute");

        if (releaseToFundraiser) {
            escrow.status = EscrowStatus.RELEASED;
            escrow.releasedAt = block.timestamp;
            (bool success, ) = escrow.fundraiser.call{value: escrow.amount}("");
            require(success, "Transfer failed");
            emit EscrowReleased(escrowId, escrow.fundraiser);
        } else {
            escrow.status = EscrowStatus.REFUNDED;
            escrow.refundedAt = block.timestamp;
            (bool success, ) = escrow.investor.call{value: escrow.amount}("");
            require(success, "Transfer failed");
            emit EscrowRefunded(escrowId, escrow.investor);
        }
    }
}

