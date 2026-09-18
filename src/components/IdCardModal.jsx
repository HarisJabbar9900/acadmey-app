import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, GraduationCap, User, Phone, ShieldCheck, QrCode, X, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function IdCardModal({ student, data, onClose, isAdminLoggedIn = false }) {
  if (!student) return null;

  // Security Guard: Prevent unauthorized access to student emergency contact info
  if (!isAdminLoggedIn) {
    return createPortal(
      <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confidential Identity Document</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Student Identity Cards contain personal emergency contacts and are strictly restricted to authorized Academy Administration.
          </p>
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const safeClasses = Array.isArray(data?.classes) ? data.classes : [];
  const studentClass = safeClasses.find(c => c && c.id === student.classId);

  // Editable fields by Admin before printing ID Card
  const [bloodGroup, setBloodGroup] = useState(student.bloodGroup || 'O+');
  const [emergencyPhone, setEmergencyPhone] = useState(student.fatherNumber || student.parentContact || '0334-6683236');
  const [validUntil, setValidUntil] = useState('Aug 2027');
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    document.body.classList.add('printing-idcard-active');
    const oldTitle = document.title;
    document.title = `${student.name || 'Student'}_ID_Card_Al_Zia`;
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-idcard-active');
      document.title = oldTitle;
    }, 1000);
  };

  const handleDownloadImage = async () => {
    const cardElement = document.getElementById('student-id-card-print-target');
    if (!cardElement) return;

    const studentNameClean = (student.name || 'Student').trim().replace(/\s+/g, '_');
    const fileName = `${studentNameClean}_ID_Card_Al_Zia.png`;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(cardElement, {
        scale: 3,
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
      console.error('ID Card PNG Download Error:', err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div className="idcard-modal-wrapper fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible">
      <div className="idcard-modal-inner bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-5 my-auto print:p-0 print:bg-white print:border-0 print:shadow-none print:m-0">
        
        {/* Modal Top Header (Screen Only) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Student Identity Card
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">Student ID Card Preview</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Quick Editing Options (Screen Only) */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2.5 text-xs print:hidden">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Emergency Contact</label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Printable ID Card Container */}
        <div className="flex justify-center print:m-0 print:p-0">
          <div 
            id="student-id-card-print-target"
            className="idcard-print-target w-[340px] max-w-full bg-white border-2 border-slate-300 rounded-2xl shadow-xl overflow-hidden text-slate-900 relative font-sans print:w-[320px] print:border-2 print:border-slate-900 print:shadow-none print:m-0"
          >
            
            {/* ID Card Header Banner: Royal Navy with Gold accent */}
            <div className="bg-gradient-to-r from-slate-950 via-[#0e162e] to-slate-950 px-3 py-3 text-center text-white relative border-b-2 border-amber-400">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-sm uppercase tracking-wider leading-none text-white">Al-Zia Science Academy</h2>
              </div>
              <div className="flex justify-center">
                <span className="inline-block px-3 py-0.5 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-widest shadow-xs">
                  Student Identity Card
                </span>
              </div>
            </div>

            {/* Photo Avatar & Student Info Body */}
            <div className="p-4 space-y-3.5 bg-white">
              
              <div className="flex items-center gap-3.5">
                {/* Photo Frame Placeholder */}
                <div className="w-20 h-24 bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 shrink-0 overflow-hidden shadow-xs">
                  <User className="w-10 h-10 text-slate-400" />
                  <span className="text-[8px] font-mono mt-1 text-slate-400 uppercase tracking-wider">Photo</span>
                </div>

                {/* Main Name & Roll Number */}
                <div className="space-y-1 overflow-hidden flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-md text-[10px] font-mono font-extrabold inline-block shrink-0">
                      Roll #{student.rollNo}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-md text-[9px] font-bold uppercase truncate inline-block">
                      Class {studentClass?.name || 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-tight truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-indigo-700 font-semibold truncate">
                    {studentClass?.subject || 'Science & Computer'}
                  </p>
                </div>
              </div>

              {/* Grid Personal Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-2.5 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Father's Name</span>
                  <span className="font-bold text-slate-900 truncate block">{student.fname || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Blood Group</span>
                  <span className="font-black text-rose-600 font-mono text-xs">{bloodGroup}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Emergency Contact</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600" /> {emergencyPhone}
                  </span>
                </div>
              </div>

              {/* QR Verification & Validity Footer */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white rounded border border-slate-300 shadow-2xs">
                    <QrCode className="w-7 h-7 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block font-mono">ID: {student.id}</span>
                    <span className="text-[9px] font-extrabold text-emerald-700 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[8px] text-slate-500 block uppercase font-semibold">Valid Until</span>
                  <span className="font-mono font-black text-slate-900 text-xs">{validUntil}</span>
                </div>
              </div>

            </div>

            {/* Bottom Official Accent Line: Gold and Navy */}
            <div className="h-2 bg-gradient-to-r from-amber-400 via-indigo-700 to-slate-950" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Saving HD...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Download Image</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
