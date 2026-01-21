// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address public admin;
    // Map RollNumber to IPFS CID
    mapping(string => string) private certificates;

    constructor() { admin = msg.sender; }

    function issueCertificate(string memory _rollNumber, string memory _ipfsCid) public {
        require(msg.sender == admin, "Only admin can issue");
        certificates[_rollNumber] = _ipfsCid;
    }

    function verifyCertificate(string memory _rollNumber) public view returns (string memory) {
        return certificates[_rollNumber];
    }
}
