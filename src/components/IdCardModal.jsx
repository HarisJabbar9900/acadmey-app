import React, { useState } from 'react';
import { Printer, GraduationCap, User, Phone, ShieldCheck, QrCode, X } from 'lucide-react';

export default function IdCardModal({ student, data, onClose, isAdminLoggedIn = false }) {
  if (!student) return null;

  // Security Guard: Prevent unauthorized access to student emergency contact info
  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
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
      </div>
    );
  }

  const studentClass = data.classes.find(c => c.id === student.classId);

  // Editable fields by Admin before printing ID Card
  const [bloodGroup, setBloodGroup] = useState(student.bloodGroup || 'O+');
  const [emergencyPhone, setEmergencyPhone] = useState(student.fatherNumber || student.parentContact || '0334-6683236');
  const [validUntil, setValidUntil] = useState('Aug 2027');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 my-auto print:p-0 print:bg-white print:border-0 print:shadow-none">
        
        {/* Modal Top Header (Screen Only) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Student Identity Card
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Student ID Card Preview</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Quick Editing Options (Screen Only) */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs print:hidden">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
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
        <div className="flex justify-center print:m-0">
          <div className="w-[340px] bg-white border-2 border-slate-300 rounded-2xl shadow-xl overflow-hidden text-slate-900 relative font-sans print:w-[320px] print:border-2 print:border-slate-900 print:shadow-none">
            
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
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-md text-[10px] font-mono font-extrabold inline-block">
                      Roll #{student.rollNo}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-md text-[9px] font-bold uppercase">
                      Class {studentClass?.name || 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-tight truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-indigo-700 font-semibold">
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
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print Student ID Card
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
