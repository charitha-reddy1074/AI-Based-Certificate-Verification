const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let CertificateRegistry;
  let certificateRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    [owner, addr1, addr2] = await ethers.getSigners();
    certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await certificateRegistry.university()).to.equal(owner.address);
    });

    it("Should set owner as authorized issuer", async function () {
      expect(await certificateRegistry.authorizedIssuers(owner.address)).to.equal(true);
    });
  });

  describe("Issuing Certificates", function () {
    it("Should issue a certificate successfully", async function () {
      const certId = "CERT001";
      const studentName = "John Doe";
      const course = "Computer Science";
      const ipfsHash = "QmTest123";

      await expect(certificateRegistry.issueCertificate(certId, studentName, course, ipfsHash))
        .to.emit(certificateRegistry, "CertificateIssued")
        .withArgs(certId, studentName, course, ipfsHash, owner.address);

      const cert = await certificateRegistry.getCertificate(certId);
      expect(cert.studentName).to.equal(studentName);
      expect(cert.course).to.equal(course);
      expect(cert.ipfsHash).to.equal(ipfsHash);
      expect(cert.isValid).to.equal(true);
      expect(cert.issuer).to.equal(owner.address);
    });

    it("Should not allow issuing duplicate certificates", async function () {
      const certId = "CERT001";
      const studentName = "John Doe";
      const course = "Computer Science";
      const ipfsHash = "QmTest123";

      await certificateRegistry.issueCertificate(certId, studentName, course, ipfsHash);

      await expect(
        certificateRegistry.issueCertificate(certId, "Jane Doe", "Math", "QmTest456")
      ).to.be.revertedWith("Certificate already exists");
    });

    it("Should not allow unauthorized users to issue certificates", async function () {
      const certId = "CERT001";
      const studentName = "John Doe";
      const course = "Computer Science";
      const ipfsHash = "QmTest123";

      await expect(
        certificateRegistry.connect(addr1).issueCertificate(certId, studentName, course, ipfsHash)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Verifying Certificates", function () {
    beforeEach(async function () {
      const certId = "CERT001";
      const studentName = "John Doe";
      const course = "Computer Science";
      const ipfsHash = "QmTest123";

      await certificateRegistry.issueCertificate(certId, studentName, course, ipfsHash);
    });

    it("Should verify a valid certificate", async function () {
      const result = await certificateRegistry.verifyCertificate("CERT001");

      expect(result[0]).to.equal("John Doe"); // studentName
      expect(result[1]).to.equal("Computer Science"); // course
      expect(result[2]).to.equal("QmTest123"); // ipfsHash
      expect(result[4]).to.equal(true); // isValid
      expect(result[5]).to.equal(owner.address); // issuer
    });

    it("Should return empty data for non-existent certificate", async function () {
      const result = await certificateRegistry.verifyCertificate("NONEXISTENT");

      expect(result[0]).to.equal(""); // studentName
      expect(result[1]).to.equal(""); // course
      expect(result[2]).to.equal(""); // ipfsHash
      expect(result[4]).to.equal(false); // isValid
    });
  });

  describe("Authorized Issuers", function () {
    it("Should allow university to add authorized issuers", async function () {
      await certificateRegistry.addAuthorizedIssuer(addr1.address);
      expect(await certificateRegistry.authorizedIssuers(addr1.address)).to.equal(true);
    });

    it("Should allow authorized issuers to issue certificates", async function () {
      await certificateRegistry.addAuthorizedIssuer(addr1.address);

      const certId = "CERT001";
      const studentName = "John Doe";
      const course = "Computer Science";
      const ipfsHash = "QmTest123";

      await expect(
        certificateRegistry.connect(addr1).issueCertificate(certId, studentName, course, ipfsHash)
      ).to.not.be.reverted;
    });

    it("Should not allow non-university to add authorized issuers", async function () {
      await expect(
        certificateRegistry.connect(addr1).addAuthorizedIssuer(addr2.address)
      ).to.be.revertedWith("Only university can perform this action");
    });
  });

  describe("Revoking Certificates", function () {
    beforeEach(async function () {
      const certId = "CERT001";
      const studentName = "John Doe";
      const course = "Computer Science";
      const ipfsHash = "QmTest123";

      await certificateRegistry.issueCertificate(certId, studentName, course, ipfsHash);
    });

    it("Should revoke a certificate successfully", async function () {
      await expect(certificateRegistry.revokeCertificate("CERT001"))
        .to.emit(certificateRegistry, "CertificateRevoked")
        .withArgs("CERT001", owner.address);

      expect(await certificateRegistry.isCertificateValid("CERT001")).to.equal(false);
    });

    it("Should not allow revoking non-existent certificates", async function () {
      await expect(
        certificateRegistry.revokeCertificate("NONEXISTENT")
      ).to.be.revertedWith("Certificate does not exist");
    });

    it("Should not allow revoking already revoked certificates", async function () {
      await certificateRegistry.revokeCertificate("CERT001");

      await expect(
        certificateRegistry.revokeCertificate("CERT001")
      ).to.be.revertedWith("Certificate already revoked");
    });
  });
});