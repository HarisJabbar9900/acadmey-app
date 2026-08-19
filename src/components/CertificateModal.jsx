import React, { useState } from 'react';
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
        scale: 2.0,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#0f172a'
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

  // Generate QR verification link
  const qrData = encodeURIComponent(
    `AL-ZIA SCIENCE ACADEMY CERTIFICATE OF EXCELLENCE\nStudent: ${scorer.studentName}\nRoll #: ${scorer.rollNo}\nClass: ${scorer.className}\nPosition: 1st (Class Topper)\nOverall Score: ${scorer.obtainedMarks}/${scorer.maxMarks} (${scorer.percentage}%)\nMonth: ${monthFormatted}`
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;

  return (
    <div className="certificate-modal-wrapper fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Modal Container (Screen View) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[95vh] overflow-y-auto print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white relative">
        
        {/* Sticky Screen Header Controls */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 pt-2 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">Class Topper Certificate of Excellence</h3>
              <p className="text-xs text-slate-400">Official Monthly Merit Certificate for Class {scorer.className}</p>
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
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Close Certificate"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame */}
        <div id="certificate-print-area" className="certificate-print-area relative bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 p-6 sm:p-10 rounded-2xl border-4 border-amber-500/80 shadow-2xl text-slate-100">
          
          {/* Decorative Inner Border Frame */}
          <div className="border-2 border-amber-500/50 p-6 sm:p-8 rounded-xl relative space-y-6 text-center">
            
            {/* Corner Ornate Badges */}
            <div className="absolute top-2 left-2 text-amber-400 text-xs font-serif font-bold opacity-80">❖ AL-ZIA ❖</div>
            <div className="absolute top-2 right-2 text-amber-400 text-xs font-serif font-bold opacity-80">❖ ACADEMY ❖</div>
            <div className="absolute bottom-2 left-2 text-amber-400 text-xs font-serif font-bold opacity-80">❖ EXCELLENCE ❖</div>
            <div className="absolute bottom-2 right-2 text-amber-400 text-xs font-serif font-bold opacity-80">❖ MERIT ❖</div>

            {/* Top Emblem & Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-10 h-10 text-amber-400" />
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-amber-400 font-serif uppercase">
                  Al-Zia Science Academy
                </h1>
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <p className="text-xs sm:text-sm font-semibold tracking-widest text-indigo-300 uppercase font-sans">
                Center for Science, Computer & Modern Academic Learning
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full mt-2" />
            </div>

            {/* Certificate Title */}
            <div className="py-2">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-serif text-lg sm:text-2xl font-bold uppercase tracking-widest">
                📜 Certificate of Excellence 📜
              </span>
              <p className="text-xs font-serif italic text-slate-300 mt-2">
                This prestigious certificate is proudly presented to
              </p>
            </div>

            {/* Recipient Name Box */}
            <div className="py-2 border-b-2 border-amber-500/40 w-3/4 mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide font-serif">
                {scorer.studentName}
              </h2>
              <p className="text-sm font-semibold text-amber-300 mt-1">
                Son / Daughter of: <span className="text-white font-bold">{scorer.fname || 'N/A'}</span>
              </p>
            </div>

            {/* Academic Details & Citation */}
            <div className="max-w-2xl mx-auto space-y-3 text-sm text-slate-200 font-sans leading-relaxed">
              <p>
                In recognition of outstanding academic dedication and achieving <strong className="text-amber-400 font-bold">1st Position (Class Topper)</strong> in <strong className="text-indigo-300 font-bold">Class {scorer.className}</strong> for the entire month of <strong className="text-white font-bold">{monthFormatted}</strong>.
              </p>
              
              <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-950/90 border border-amber-500/40 px-6 py-2.5 rounded-2xl font-mono">
                <div>
                  <span className="text-xs text-slate-400 block">Roll Number:</span>
                  <strong className="text-indigo-400 text-base">#{scorer.rollNo}</strong>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div>
                  <span className="text-xs text-slate-400 block">Overall Monthly Marks:</span>
                  <strong className="text-emerald-400 text-base">{scorer.obtainedMarks} / {scorer.maxMarks}</strong>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div>
                  <span className="text-xs text-slate-400 block">Aggregate Percentage:</span>
                  <strong className="text-amber-400 text-base">{scorer.percentage}%</strong>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Seal Grid */}
            <div className="pt-8 flex items-end justify-between text-left text-xs text-slate-300">
              
              {/* QR Verification Seal */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-amber-500/50 p-1.5 bg-white flex flex-col items-center justify-center text-slate-900 shrink-0 shadow-lg">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm-5 0h3v3h-3v-3zm3 3h3v3h-3v-3zm-3 3h3v3h-3v-3zm5 0h3v3h-3v-3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Verified
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Issued: {issueDate}</div>
                  <div className="text-[9px] font-mono text-slate-500">Al-Zia Merit Reg #AZ-{scorer.rollNo}-{scorer.classId}</div>
                </div>
              </div>

              {/* Gold Ribbon Seal Emblem */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-bold text-center text-[10px] p-1">
                  🏆 TOPPER 1ST POS
                </div>
                <span className="text-[10px] font-mono text-amber-400 mt-1 font-bold">MERIT SEAL</span>
              </div>

              {/* Director Signature Line */}
              <div className="text-center space-y-1">
                <div className="w-40 border-b-2 border-amber-400 font-serif italic text-sm text-indigo-300 font-bold pb-1">
                  Haris Jabbar / Admin
                </div>
                <div className="text-[11px] font-bold text-white">Academy Director</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">Al-Zia Science Academy</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS Styles (Rich Dark & Gold Colorful A4 Landscape - 297mm x 210mm) */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            overflow: hidden !important;
          }
          
          /* Hide non-print containers */
          nav, 
          footer, 
          header, 
          .print-hidden, 
          .print\\:hidden, 
          .pointer-events-none {
            display: none !important;
          }
          
          /* Make certificate print area & all its children visible */
          body * {
            visibility: hidden !important;
          }
          
          #certificate-print-area, 
          #certificate-print-area * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .certificate-modal-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #0f172a !important;
            z-index: 99999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .certificate-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 10mm !important;
            background-color: #0f172a !important;
            color: #ffffff !important;
            border: 8px double #f59e0b !important;
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
    </div>
  );
}
