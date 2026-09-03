import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Award, CheckCircle2, X, Printer, Sparkles, ShieldCheck, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function CertificateModal({ scorer, month, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!scorer) return null;

  const handlePrint = () => {
    const oldTitle = document.title;
    const cleanName = (scorer.studentName || 'Student').trim().replace(/\s+/g, '_');
    const cleanClass = (scorer.className || 'Topper').trim().replace(/\s+/g, '_');
    document.title = `Certificate_${cleanName}_Class_${cleanClass}`;
    window.print();
    setTimeout(() => {
      document.title = oldTitle;
    }, 1000);
  };

  const handleDownloadImage = async () => {
    const certElement = document.getElementById('certificate-print-area');
    if (!certElement) return;

    const cleanName = (scorer.studentName || 'Student').trim().replace(/\s+/g, '_');
    const cleanClass = (scorer.className || 'Topper').trim().replace(/\s+/g, '_');
    const fileName = `Certificate_${cleanName}_Class_${cleanClass}.png`;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(certElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PNG Download Error:', err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  // Convert month e.g. "2026-08" to "August 2026"
  const getMonthTitle = () => {
    if (!month) return 'Current Month';
    try {
      const [year, m] = month.split('-');
      const date = new Date(year, parseInt(m, 10) - 1, 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
      return month;
    }
  };

  const monthFormatted = getMonthTitle();
  const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return createPortal(
    <div className="certificate-modal-wrapper fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Modal Container (Screen View) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[95vh] overflow-y-auto relative">
        
        {/* Sticky Screen Header Controls */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 pt-2 print-hidden print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">Class Topper Certificate of Excellence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official Monthly Merit Certificate for Class {scorer.className}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating HD...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>📥 Download HD Image</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
              title="Close Certificate"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame (Always Light Mode & Prestige Parchment Styling) */}
        <div id="certificate-print-area" className="certificate-print-area relative bg-white p-6 sm:p-10 rounded-2xl border-4 border-amber-600 shadow-2xl text-slate-900 overflow-hidden">
          
          {/* Academy Name Background Watermark */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden opacity-[0.05] print:opacity-[0.07]">
            <Trophy className="w-80 h-80 text-amber-900" />
            <span className="text-3xl sm:text-5xl font-black tracking-widest text-indigo-950 uppercase font-serif text-center -rotate-12 whitespace-nowrap mt-4">
              AL-ZIA SCIENCE ACADEMY
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-900 uppercase font-sans mt-2 -rotate-12">
              Official Merit & Excellence Award
            </span>
          </div>

          {/* Decorative Inner Border Frame */}
          <div className="border-2 border-amber-600/70 p-6 sm:p-10 pb-10 sm:pb-12 rounded-xl relative z-10 space-y-6 text-center bg-amber-50/20">
            
            {/* Corner Ornate Badges */}
            <div className="absolute top-2.5 left-3 text-amber-700 text-xs font-serif font-bold opacity-90 pointer-events-none">❖ AL-ZIA ❖</div>
            <div className="absolute top-2.5 right-3 text-amber-700 text-xs font-serif font-bold opacity-90 pointer-events-none">❖ ACADEMY ❖</div>
            <div className="absolute bottom-2.5 left-3 text-amber-700 text-xs font-serif font-bold opacity-90 pointer-events-none">❖ EXCELLENCE ❖</div>
            <div className="absolute bottom-2.5 right-3 text-amber-700 text-xs font-serif font-bold opacity-90 pointer-events-none">❖ MERIT ❖</div>

            {/* Top Emblem & Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-10 h-10 text-amber-600" />
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-amber-700 font-serif uppercase">
                  Al-Zia Science Academy
                </h1>
                <Trophy className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm font-bold tracking-widest text-indigo-900 uppercase font-sans">
                Center for Science, Computer & Modern Academic Learning
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto rounded-full mt-2" />
            </div>

            {/* Certificate Title */}
            <div className="py-2">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-amber-100 via-amber-200/80 to-amber-100 text-amber-900 border border-amber-400 rounded-full font-serif text-lg sm:text-2xl font-bold uppercase tracking-widest shadow-xs">
                📜 Certificate of Excellence 📜
              </span>
              <p className="text-xs font-serif italic text-slate-600 mt-2">
                This prestigious certificate is proudly presented to
              </p>
            </div>

            {/* Recipient Name Box */}
            <div className="py-2 border-b-2 border-amber-500/60 w-3/4 mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wide font-serif">
                {scorer.studentName}
              </h2>
              <p className="text-sm font-semibold text-amber-800 mt-1">
                Son / Daughter of: <span className="text-slate-900 font-bold">{scorer.fname || 'N/A'}</span>
              </p>
            </div>

            {/* Academic Details & Citation */}
            <div className="max-w-2xl mx-auto space-y-3 text-sm text-slate-700 font-sans leading-relaxed">
              <p>
                In recognition of outstanding academic dedication and achieving <strong className="text-amber-800 font-bold">1st Position (Class Topper)</strong> in <strong className="text-indigo-900 font-bold">Class {scorer.className}</strong> for the entire month of <strong className="text-slate-900 font-bold">{monthFormatted}</strong>.
              </p>
              
              <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-amber-50/90 border-2 border-amber-300 px-6 py-2.5 rounded-2xl font-mono text-slate-900 shadow-xs">
                <div>
                  <span className="text-xs text-slate-600 block">Roll Number:</span>
                  <strong className="text-indigo-800 text-base">#{scorer.rollNo}</strong>
                </div>
                <div className="w-px h-6 bg-amber-300" />
                <div>
                  <span className="text-xs text-slate-600 block">Overall Monthly Marks:</span>
                  <strong className="text-emerald-700 text-base">{scorer.obtainedMarks} / {scorer.maxMarks}</strong>
                </div>
                <div className="w-px h-6 bg-amber-300" />
                <div>
                  <span className="text-xs text-slate-600 block">Aggregate Percentage:</span>
                  <strong className="text-amber-800 text-base">{scorer.percentage}%</strong>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Seal Grid */}
            <div className="pt-6 flex items-end justify-between text-left text-xs text-slate-700">
              
              {/* QR Verification Seal */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-amber-400 p-1.5 bg-white flex flex-col items-center justify-center text-slate-900 shrink-0 shadow-sm">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm3 3h3v3h-3v-3zm-3 3h3v3h-3v-3zm5 0h3v3h-3v-3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Verified
                  </div>
                  <div className="text-[10px] font-mono text-slate-600">Issued: {issueDate}</div>
                  <div className="text-[9px] font-mono text-slate-500">Al-Zia Merit Reg #AZ-{scorer.rollNo}-{scorer.classId}</div>
                </div>
              </div>

              {/* Gold Ribbon Seal Emblem */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 border-2 border-amber-600 shadow-md flex items-center justify-center text-amber-950 font-black text-center text-[10px] p-1">
                  🏆 TOPPER 1ST POS
                </div>
                <span className="text-[10px] font-mono text-amber-800 mt-1 font-bold">MERIT SEAL</span>
              </div>

              {/* Director Signature Line */}
              <div className="text-center space-y-1">
                <div className="w-40 border-b-2 border-slate-900 font-serif italic text-base text-indigo-900 font-bold pb-1">
                  Administrator
                </div>
                <div className="text-[11px] font-bold text-slate-900">Academy Director</div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">Al-Zia Science Academy</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS Styles (Always Crisp Light A4 Landscape) */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Hide EVERYTHING in body except the certificate modal wrapper */
          body > *:not(.certificate-modal-wrapper) {
            display: none !important;
          }

          .print-hidden, 
          .print\\:hidden, 
          header, 
          nav, 
          footer, 
          button {
            display: none !important;
          }

          .certificate-modal-wrapper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            z-index: 999999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .certificate-print-area {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            border: 10px double #d97706 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
