import { forwardRef } from "react";
import type { Certificate } from "@shared/schema";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";

interface CertificateCardProps {
  certificate: Certificate;
  variant?: "preview" | "full";
}

export const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(
  ({ certificate, variant = "full" }, ref) => {
    const downloadPdf = async () => {
      const element = document.getElementById(`cert-${certificate.id}`);
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${certificate.rollNumber}.pdf`);
    };

    if (variant === "preview") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-card/50 to-background border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-primary">
                {certificate.university}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Certificate ID: {certificate.id}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Student:</span>
              <span className="font-mono bg-input px-3 py-1 rounded blur-sm hover:blur-none transition-all text-foreground">
                {certificate.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Roll No:</span>
              <span className="font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded">{certificate.rollNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Branch:</span>
              <span className="text-foreground font-medium">{certificate.branch}</span>
            </div>
            <div className="pt-2 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
              <span>{certificate.joiningYear} - {certificate.passingYear}</span>
              <span className="text-green-500 font-semibold">✓ Verified</span>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="relative group"
      >
        <div
          id={`cert-${certificate.id}`}
          className="relative bg-gradient-to-br from-background via-background to-muted text-foreground p-12 rounded-lg shadow-2xl border-[16px] border-double border-primary/20 overflow-hidden aspect-[1.414/1] flex flex-col items-center justify-between hover:border-primary/40 transition-all duration-300 min-h-[600px]"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
          
          {/* Decorative Corner */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-secondary/40 rounded-tl-3xl m-4" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-secondary/40 rounded-br-3xl m-4" />

          {/* Header */}
          <div className="text-center z-10 w-full">
            <h1 className="text-4xl font-black font-display tracking-widest uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {certificate.university}
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-primary to-secondary mx-auto mb-8" />
            <h2 className="text-2xl font-display text-primary/90 italic">
              Certificate of Completion
            </h2>
          </div>

          {/* Content */}
          <div className="text-center space-y-6 z-10 max-w-2xl">
            <p className="text-lg text-muted-foreground font-light">
              This is to certify that
            </p>
            <p className="text-4xl font-bold font-display text-primary border-b-2 border-dashed border-secondary/40 pb-2 inline-block px-12">
              {certificate.name}
            </p>
            <p className="text-lg text-foreground">
              Roll No: <span className="font-mono font-bold text-secondary">{certificate.rollNumber}</span>
            </p>
            <p className="text-lg leading-relaxed text-foreground">
              has successfully completed the course in{" "}
              <span className="font-bold text-primary">{certificate.branch}</span>
              <br />
              for the academic years{" "}
              <span className="font-bold text-secondary">
                {certificate.joiningYear} - {certificate.passingYear}
              </span>
              .
            </p>
          </div>

          {/* Footer */}
          <div className="w-full flex justify-between items-end mt-12 z-10">
            <div className="text-left">
              <div className="bg-background p-2 rounded border border-border inline-block mb-2">
                <QRCodeSVG
                  value={`${window.location.origin}/verify/${certificate.id}`}
                  size={80}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground max-w-[200px] break-all">
                ID: {certificate.id}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-2 rounded-full border-4 border-gradient-to-r from-primary to-secondary flex items-center justify-center text-secondary">
                <ShieldCheck className="w-16 h-16" />
              </div>
              <span className="font-display font-bold text-secondary uppercase tracking-wider text-sm">
                Verified On Chain
              </span>
            </div>

            <div className="text-right">
              <div className="w-48 border-b-2 border-gradient-to-r from-primary to-secondary mb-2" />
              <p className="font-display font-bold text-foreground">University Dean</p>
              <p className="text-sm text-muted-foreground">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Action Bar (Not captured in PDF) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute -top-4 -right-4 hidden group-hover:flex transition-all z-20 gap-2"
        >
          <Button onClick={downloadPdf} size="icon" className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-background">
            <Download className="w-6 h-6" />
          </Button>
          <Button size="icon" className="h-12 w-12 rounded-full shadow-lg bg-secondary/20 border border-secondary hover:bg-secondary/30 text-secondary">
            <ExternalLink className="w-6 h-6" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }
);
CertificateCard.displayName = "CertificateCard";
