import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@shared/routes';

interface UploadResult {
  success: boolean;
  uploadedCount: number;
  failedCount: number;
  errors: Array<{ row: number; error: string }>;
}

export function BulkUploadDialog({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);

  const downloadSampleCsv = () => {
    const csvSample = `studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa
1,John Doe,2023001,Computer Science,XYZ University,2019,2023,3.8
2,Jane Smith,2023002,Computer Science,XYZ University,2019,2023,3.9
3,Bob Johnson,2023003,Electrical Engineering,XYZ University,2019,2023,3.7
4,Alice Brown,2023004,Mechanical Engineering,XYZ University,2019,2023,3.6`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvSample));
    element.setAttribute('download', 'sample_certificates.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    try {
      const text = await file.text();
      setCsvContent(text);
      setError(null);
    } catch (err) {
      setError('Failed to read CSV file');
    }
  };

  const handleUpload = async () => {
    if (!csvContent) {
      setError('No CSV file selected');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadResult(null);

    try {
      // Convert CSV content to base64 using btoa (client-side compatible)
      const csvBase64 = btoa(unescape(encodeURIComponent(csvContent)));
      
      const response = await fetch(api.admin.bulkUpload.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvBase64 }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);

      if (result.uploadedCount > 0) {
        setCsvContent(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onUploadSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload certificates');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Bulk Upload (CSV)
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Upload className="w-5 h-5 text-emerald-600" />
            Bulk Upload Certificates
          </DialogTitle>
          <DialogDescription>
            Upload multiple certificates at once using a CSV file. Download the sample format below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sample Download Section */}
          <motion.div 
            className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-3">CSV Format Required:</h3>
            <div className="text-xs text-blue-800 dark:text-blue-300 bg-white dark:bg-slate-900 p-3 rounded font-mono overflow-x-auto mb-3">
              <div>studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa</div>
              <div className="text-blue-600 dark:text-blue-400 mt-2">1,John Doe,2023001,Computer Science,XYZ University,2019,2023,3.8</div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadSampleCsv}
              className="border-blue-300 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample CSV
            </Button>
          </motion.div>

          {/* File Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select CSV File
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to select a CSV file or drag and drop
              </p>
              {csvContent && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                  ✓ File selected
                </p>
              )}
            </div>
          </motion.div>

          {/* Error Messages */}
          {error && (
            <motion.div
              className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-100 text-sm">Error</h4>
                <p className="text-xs text-red-800 dark:text-red-300 mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`p-4 rounded-lg border ${
                uploadResult.uploadedCount > 0 
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    uploadResult.uploadedCount > 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${
                      uploadResult.uploadedCount > 0 
                        ? 'text-emerald-900 dark:text-emerald-100' 
                        : 'text-amber-900 dark:text-amber-100'
                    }`}>
                      Upload Complete
                    </h4>
                    <p className={`text-xs mt-1 ${
                      uploadResult.uploadedCount > 0 
                        ? 'text-emerald-800 dark:text-emerald-300' 
                        : 'text-amber-800 dark:text-amber-300'
                    }`}>
                      Successfully uploaded: <span className="font-bold">{uploadResult.uploadedCount}</span> certificates
                    </p>
                    {uploadResult.failedCount > 0 && (
                      <p className="text-xs mt-1 text-red-700 dark:text-red-400">
                        Failed: <span className="font-bold">{uploadResult.failedCount}</span> rows
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {uploadResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 text-sm mb-3">Failed Rows:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadResult.errors.map((err: { row: number; error: string }, idx: number) => (
                      <div key={idx} className="text-xs text-red-700 dark:text-red-300 p-2 bg-white dark:bg-slate-900 rounded border border-red-100 dark:border-red-800">
                        <span className="font-semibold">Row {err.row}:</span> {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setCsvContent(null);
                setUploadResult(null);
                setError(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Close
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!csvContent || isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Certificates
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
