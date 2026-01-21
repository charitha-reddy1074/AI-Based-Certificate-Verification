// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {

    struct Certificate {
        string studentName;
        string course;
        string ipfsHash;
        uint256 issuedAt;
        bool isValid;
        address issuer;
    }

    address public university;
    mapping(string => Certificate) public certificates;
    mapping(address => bool) public authorizedIssuers;

    event CertificateIssued(
        string certId,
        string studentName,
        string course,
        string ipfsHash,
        address issuer
    );

    event CertificateRevoked(string certId, address revoker);

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender] || msg.sender == university, "Not authorized");
        _;
    }

    modifier onlyUniversity() {
        require(msg.sender == university, "Only university can perform this action");
        _;
    }

    constructor() {
        university = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    function addAuthorizedIssuer(address issuer) public onlyUniversity {
        authorizedIssuers[issuer] = true;
    }

    function removeAuthorizedIssuer(address issuer) public onlyUniversity {
        authorizedIssuers[issuer] = false;
    }

    function issueCertificate(
        string memory certId,
        string memory studentName,
        string memory course,
        string memory ipfsHash
    ) public onlyAuthorized {
        require(bytes(certificates[certId].studentName).length == 0, "Certificate already exists");

        certificates[certId] = Certificate(
            studentName,
            course,
            ipfsHash,
            block.timestamp,
            true,
            msg.sender
        );

        emit CertificateIssued(certId, studentName, course, ipfsHash, msg.sender);
    }

    function revokeCertificate(string memory certId) public onlyAuthorized {
        require(bytes(certificates[certId].studentName).length > 0, "Certificate does not exist");
        require(certificates[certId].isValid, "Certificate already revoked");

        certificates[certId].isValid = false;
        emit CertificateRevoked(certId, msg.sender);
    }

    function verifyCertificate(string memory certId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            bool,
            address
        )
    {
        Certificate memory cert = certificates[certId];
        return (
            cert.studentName,
            cert.course,
            cert.ipfsHash,
            cert.issuedAt,
            cert.isValid,
            cert.issuer
        );
    }

    function getCertificate(string memory certId)
        public
        view
        returns (Certificate memory)
    {
        return certificates[certId];
    }

    function isCertificateValid(string memory certId) public view returns (bool) {
        return certificates[certId].isValid;
    }
}