import React from 'react';
import { Trophy, Award, CheckCircle2, X, Printer, Sparkles, ShieldCheck } from 'lucide-react';

export default function CertificateModal({ scorer, month, onClose }) {
  if (!scorer) return null;

  const handlePrint = () => {
    window.print();
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Modal Container (Screen View) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[95vh] overflow-y-auto print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white">
        
        {/* Screen Header Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Class Topper Certificate of Excellence</h3>
              <p className="text-xs text-slate-400">Official Monthly Academic Merit Certificate for Class {scorer.className}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Certificate (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame */}
        <div className="certificate-print-area relative bg-gradient-to-br from-amber-50/20 via-slate-900 to-indigo-950/40 p-6 sm:p-10 rounded-2xl border-4 border-amber-500/60 shadow-2xl text-slate-900 print:bg-white print:text-black print:p-8 print:border-8 print:border-amber-600 print:rounded-none">
          
          {/* Decorative Inner Border Frame */}
          <div className="border-2 border-amber-500/40 p-6 sm:p-8 rounded-xl relative space-y-6 text-center print:border-2 print:border-amber-700">
            
            {/* Corner Ornate Badges */}
            <div className="absolute top-2 left-2 text-amber-500 text-xs font-serif font-bold opacity-70 print:text-amber-700">❖ AL-ZIA ❖</div>
            <div className="absolute top-2 right-2 text-amber-500 text-xs font-serif font-bold opacity-70 print:text-amber-700">❖ ACADEMY ❖</div>
            <div className="absolute bottom-2 left-2 text-amber-500 text-xs font-serif font-bold opacity-70 print:text-amber-700">❖ EXCELLENCE ❖</div>
            <div className="absolute bottom-2 right-2 text-amber-500 text-xs font-serif font-bold opacity-70 print:text-amber-700">❖ MERIT ❖</div>

            {/* Top Emblem & Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-10 h-10 text-amber-400 print:text-amber-600" />
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-amber-400 print:text-amber-800 font-serif uppercase">
                  Al-Zia Science Academy
                </h1>
                <Trophy className="w-10 h-10 text-amber-400 print:text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm font-semibold tracking-widest text-indigo-300 uppercase print:text-slate-700 font-sans">
                Center for Science, Computer & Modern Academic Learning
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full mt-2 print:bg-amber-600" />
            </div>

            {/* Certificate Title */}
            <div className="py-2">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-serif text-lg sm:text-2xl font-bold uppercase tracking-widest print:bg-amber-100 print:text-amber-900 print:border-amber-600">
                📜 Certificate of Excellence 📜
              </span>
              <p className="text-xs font-serif italic text-slate-300 mt-2 print:text-slate-600">
                This prestigious certificate is proudly presented to
              </p>
            </div>

            {/* Recipient Name Box */}
            <div className="py-2 border-b-2 border-amber-500/30 w-3/4 mx-auto print:border-amber-600">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide font-serif print:text-black">
                {scorer.studentName}
              </h2>
              <p className="text-sm font-semibold text-amber-300 mt-1 print:text-amber-800">
                Son / Daughter of: <span className="text-white print:text-black font-bold">{scorer.fname || 'N/A'}</span>
              </p>
            </div>

            {/* Academic Details & Citation */}
            <div className="max-w-2xl mx-auto space-y-3 text-sm text-slate-200 print:text-slate-800 font-sans leading-relaxed">
              <p>
                In recognition of outstanding academic dedication and achieving <strong className="text-amber-400 print:text-amber-800 font-bold">1st Position (Class Topper)</strong> in <strong className="text-indigo-300 print:text-indigo-900 font-bold">Class {scorer.className}</strong> for the entire month of <strong className="text-white print:text-black font-bold">{monthFormatted}</strong>.
              </p>
              
              <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-950/80 border border-amber-500/30 px-6 py-2.5 rounded-2xl print:bg-amber-50 print:border-amber-400 print:text-black font-mono">
                <div>
                  <span className="text-xs text-slate-400 print:text-slate-600 block">Roll Number:</span>
                  <strong className="text-indigo-400 print:text-indigo-900 text-base">#{scorer.rollNo}</strong>
                </div>
                <div className="w-px h-6 bg-slate-800 print:bg-amber-300" />
                <div>
                  <span className="text-xs text-slate-400 print:text-slate-600 block">Overall Monthly Marks:</span>
                  <strong className="text-emerald-400 print:text-emerald-800 text-base">{scorer.obtainedMarks} / {scorer.maxMarks}</strong>
                </div>
                <div className="w-px h-6 bg-slate-800 print:bg-amber-300" />
                <div>
                  <span className="text-xs text-slate-400 print:text-slate-600 block">Aggregate Percentage:</span>
                  <strong className="text-amber-400 print:text-amber-800 text-base">{scorer.percentage}%</strong>
                </div>
              </div>
            </div>

            {/* Bottom Signatures & Seal Grid */}
            <div className="pt-8 flex items-end justify-between text-left text-xs text-slate-300 print:text-slate-800">
              
              {/* QR Verification Seal */}
              <div className="flex items-center gap-3">
                <img
                  src={qrCodeUrl}
                  alt="QR Verification"
                  className="w-16 h-16 rounded-xl border border-amber-500/40 p-1 bg-white print:border-amber-600"
                />
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 print:text-amber-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Verified
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 print:text-slate-600">Issued: {issueDate}</div>
                  <div className="text-[9px] font-mono text-slate-500 print:text-slate-500">Al-Zia Merit Reg #AZ-{scorer.rollNo}-{scorer.classId}</div>
                </div>
              </div>

              {/* Gold Ribbon Seal Emblem */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-bold text-center text-[10px] p-1 print:border-amber-800">
                  🏆 TOPPER 1ST POS
                </div>
                <span className="text-[10px] font-mono text-amber-400 print:text-amber-800 mt-1 font-bold">MERIT SEAL</span>
              </div>

              {/* Director Signature Line */}
              <div className="text-center space-y-1">
                <div className="w-40 border-b-2 border-slate-400 print:border-black font-serif italic text-sm text-indigo-300 print:text-black font-bold pb-1">
                  Haris Jabbar / Admin
                </div>
                <div className="text-[11px] font-bold text-white print:text-black">Academy Director</div>
                <div className="text-[9px] text-slate-400 print:text-slate-600 uppercase tracking-wider">Al-Zia Science Academy</div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Print Specific CSS Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          .certificate-print-area, .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20px !important;
            background-color: white !important;
            color: black !important;
            border: 8px double #b45309 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
