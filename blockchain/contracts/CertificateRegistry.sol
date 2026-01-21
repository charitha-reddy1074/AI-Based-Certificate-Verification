// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateVerification {
    address public admin;

    struct Certificate {
        string ipfsHash;
        bool isValid;
    }

    mapping(string => Certificate) private certificates;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function issueCertificate(string memory certId, string memory ipfsHash) public onlyAdmin {
        certificates[certId] = Certificate(ipfsHash, true);
    }

    function revokeCertificate(string memory certId) public onlyAdmin {
        certificates[certId].isValid = false;
    }

    function verifyCertificate(string memory certId) public view returns (string memory, bool) {
        Certificate memory cert = certificates[certId];
        return (cert.ipfsHash, cert.isValid);
    }
}
