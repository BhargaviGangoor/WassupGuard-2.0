import React, { useState } from 'react';
import { Upload, FileWarning, CheckCircle, Loader2 } from 'lucide-react';
import { scanFileWithVirusTotal } from '../services/scannerService';
import { ScanLog, ThreatLevel } from '../types';

interface ScannerProps {
  apiKey: string;
  onScanComplete: (log: ScanLog) => void;
}

const Scanner: React.FC<ScannerProps> = ({ apiKey, onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsScanning(true);
      try {
        const result = await scanFileWithVirusTotal(file, apiKey);
        onScanComplete(result);
      } catch (error) {
        console.error("Scan failed", error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative group">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isScanning}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl transition-all cursor-pointer
            ${isScanning 
              ? 'border-emerald-500/50 bg-emerald-500/10' 
              : 'border-slate-700 bg-slate-900 hover:border-emerald-500 hover:bg-slate-800'
            }`}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-2" />
              <span className="text-sm text-emerald-400 font-medium">Scanning with VirusTotal...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-emerald-400 transition-colors" />
              <span className="text-sm text-slate-400 group-hover:text-white font-medium">
                Tap to Scan WhatsApp File
              </span>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default Scanner;