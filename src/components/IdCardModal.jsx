import React, { useState } from 'react';
import { Printer, GraduationCap, User, Phone, ShieldCheck, QrCode, X, Sparkles } from 'lucide-react';

export default function IdCardModal({ student, data, onClose }) {
  if (!student) return null;

  const studentClass = data.classes.find(c => c.id === student.classId);

  // Editable fields by Admin before printing ID Card
  const [bloodGroup, setBloodGroup] = useState(student.bloodGroup || 'O+');
  const [emergencyPhone, setEmergencyPhone] = useState(student.fatherNumber || student.parentContact || '+92 300 0000000');
  const [validUntil, setValidUntil] = useState('Aug 2027');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 my-auto print:p-0 print:bg-white print:border-0 print:shadow-none">
        
        {/* Modal Top Header (Screen Only) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
          <div>
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Official Student Identity Generator
            </span>
            <h3 className="text-lg font-extrabold text-white">Student ID Card Preview</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Quick Editing Options (Screen Only) */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 grid grid-cols-2 gap-3 text-xs print:hidden">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold focus:outline-none"
            >
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Emergency Contact</label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Printable ID Card Container */}
        <div className="flex justify-center print:m-0">
          <div className="w-[340px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 rounded-2xl shadow-2xl overflow-hidden text-white relative font-sans print:w-[320px] print:text-black print:bg-white print:border-2 print:border-indigo-900 print:shadow-none">
            
            {/* ID Card Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900 p-3 text-center text-white relative">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <GraduationCap className="w-5 h-5 text-indigo-200" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider leading-none text-white">Al-Zia Science Academy</h2>
              </div>
              <p className="text-[9px] font-semibold tracking-widest text-indigo-200 uppercase">Student Identity Card</p>
            </div>

            {/* Photo Avatar & Student Info Body */}
            <div className="p-4 space-y-3">
              
              <div className="flex items-center gap-3.5">
                {/* Photo Frame Placeholder */}
                <div className="w-20 h-24 bg-slate-800 border-2 border-indigo-400/60 rounded-xl flex flex-col items-center justify-center text-slate-400 shrink-0 overflow-hidden shadow-inner print:bg-slate-100 print:border-indigo-900">
                  <User className="w-10 h-10 text-indigo-400 print:text-indigo-900" />
                  <span className="text-[8px] font-mono mt-1 text-slate-500">PHOTO</span>
                </div>

                {/* Main Name & Roll Number */}
                <div className="space-y-1 overflow-hidden">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono font-bold inline-block print:bg-amber-100 print:text-amber-900">
                    Roll #{student.rollNo}
                  </span>
                  <h3 className="text-base font-extrabold text-white tracking-tight uppercase leading-tight truncate print:text-slate-900">
                    {student.name}
                  </h3>
                  <p className="text-xs text-indigo-300 font-semibold print:text-indigo-900">
                    Class {studentClass?.name || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Grid Personal Details */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono print:bg-slate-50 print:border-slate-300 print:text-slate-900">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-sans font-semibold block">Father Name</span>
                  <span className="font-bold text-white truncate block print:text-slate-900">{student.fname || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-sans font-semibold block">Blood Group</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-800">{bloodGroup}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-400 uppercase font-sans font-semibold block">Emergency Contact</span>
                  <span className="font-bold text-indigo-300 flex items-center gap-1 print:text-indigo-900">
                    <Phone className="w-3 h-3 text-indigo-400" /> {emergencyPhone}
                  </span>
                </div>
              </div>

              {/* QR Verification & Validity Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] print:border-slate-300">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white rounded border border-slate-700">
                    <QrCode className="w-7 h-7 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 block font-mono">ID: {student.id}</span>
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 print:text-emerald-800">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[8px] text-slate-400 block font-sans uppercase">Valid Until</span>
                  <span className="font-mono font-bold text-amber-300 text-xs print:text-slate-900">{validUntil}</span>
                </div>
              </div>

            </div>

            {/* Bottom Color Bar */}
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Student ID Card
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
