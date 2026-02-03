import { forwardRef } from "react";
import type { Certificate } from "@shared/schema";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Download } from "lucide-react";
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

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
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
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.2)" }}
          className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl hover:border-indigo-500 transition-all duration-300 group cursor-pointer shadow-md hover:shadow-2xl"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {certificate.university}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Certificate ID: {String(certificate.id).substring(0, 12)}...</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Student</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{certificate.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Roll No</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{certificate.rollNumber}</span>
            </div>
            {certificate.blockHash && (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Block</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">{certificate.blockHash.substring(0, 16)}...</span>
              </div>
            )}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Branch</span>
              <span className="text-slate-900 dark:text-slate-100 font-medium">{certificate.branch}</span>
            </div>
            {certificate.cgpa && (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">CGPA</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{certificate.cgpa}</span>
              </div>
            )}
            <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium">{certificate.joiningYear} - {certificate.passingYear}</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold flex items-center gap-1">
                <span className="text-lg">✓</span> Verified
              </span>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative group"
      >
        <div
          id={`cert-${certificate.id}`}
          className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-slate-100 p-16 rounded-2xl shadow-2xl border-4 border-indigo-200 dark:border-indigo-900 overflow-hidden aspect-[1.414/1] flex flex-col items-center justify-between hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-300 min-h-[650px] relative"
        >
          {/* Premium background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 to-blue-100/20 dark:from-indigo-900/20 dark:to-blue-900/10 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-blue-200/20 dark:from-indigo-800/20 dark:to-blue-800/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-indigo-200/10 dark:from-blue-800/10 dark:to-indigo-800/5 rounded-full blur-3xl" />
          
          {/* Decorative Corners */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t-3 border-l-3 border-indigo-400 dark:border-indigo-600 rounded-tl-2xl" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t-3 border-r-3 border-indigo-400 dark:border-indigo-600 rounded-tr-2xl" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-3 border-l-3 border-indigo-400 dark:border-indigo-600 rounded-bl-2xl" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-3 border-r-3 border-indigo-400 dark:border-indigo-600 rounded-br-2xl" />

          {/* Premium Header */}
          <div className="text-center z-10 w-full space-y-3">
            <div className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase letter-spacing-wide">Certified Achievement</div>
            <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text tracking-tight">
              {certificate.university}
            </h1>
            <div className="h-1.5 w-48 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 mx-auto rounded-full" />
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 italic font-serif">
              Certificate of Excellence
            </h2>
          </div>

          {/* Premium Content */}
          <div className="text-center space-y-8 z-10 max-w-3xl">
            <p className="text-lg text-slate-600 dark:text-slate-300 font-light tracking-wide">
              This is Proudly Presented To
            </p>
            <div className="relative">
              <p className="text-5xl font-black font-serif text-indigo-700 dark:text-indigo-300 border-b-4 border-dashed border-indigo-400 dark:border-indigo-600 pb-4 px-8">
                {certificate.name}
              </p>
            </div>
            <div className="space-y-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <p className="text-base text-slate-700 dark:text-slate-300 font-medium">
                For Successfully Completing the Academic Program in
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {certificate.branch}
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                During {certificate.joiningYear} - {certificate.passingYear}
              </p>
              {certificate.cgpa && (
                <div className="pt-4 border-t border-indigo-300 dark:border-indigo-700 mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Cumulative GPA</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{certificate.cgpa}</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Footer */}
          <div className="w-full flex justify-between items-end mt-8 z-10 gap-8">
            {/* QR Code Section */}
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg mb-3">
                <QRCodeSVG
                  value={`${window.location.origin}/verify/${certificate.id}`}
                  size={100}
                  level="H"
                  includeMargin={true}
                  fgColor="#4f46e5"
                  bgColor="#ffffff"
                />
              </div>
              <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 max-w-[140px] text-center break-all font-bold">ID: {String(certificate.id).substring(0, 16)}</p>
              {certificate.blockHash && (
                <p className="text-[9px] font-mono text-blue-600 dark:text-blue-400 max-w-[140px] text-center break-all mt-1 font-bold">Block: {certificate.blockHash.substring(0, 12)}...</p>
              )}
            </div>

            {/* Center - Seal/Badge */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-28 h-28 mb-3 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 dark:from-indigo-600 dark:to-blue-600 flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-900 transform hover:scale-105 transition-transform">
                <ShieldCheck className="w-16 h-16 text-white" />
              </div>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-xs">Blockchain</p>
              <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest text-xs">Verified</p>
            </div>

            {/* Signature Section */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-3 tracking-widest">Authorized By</p>
              <div className="w-48 border-b-2 border-slate-400 dark:border-slate-600 mb-3" />
              <p className="font-serif font-bold text-lg text-indigo-700 dark:text-indigo-300">University Authority</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Official Seal</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-6 right-8 flex gap-3 z-20"
        >
          <Button 
            onClick={downloadPdf} 
            size="lg"
            className="h-14 px-6 rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-indigo-500/50" 
            title="Download Premium PDF"
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </Button>
        </motion.div>
      </motion.div>
    );
  }
);
CertificateCard.displayName = "CertificateCard";
