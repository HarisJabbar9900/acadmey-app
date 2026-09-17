import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Download, 
  FileSpreadsheet, 
  Database, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Users, 
  CreditCard, 
  Calendar, 
  Award, 
  Loader2,
  HardDrive
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function BackupModal({ data, onClose }) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const safeClasses = Array.isArray(data?.classes) ? data.classes : [];
  const safeStudents = Array.isArray(data?.students) ? data.students : [];
  const safeTests = Array.isArray(data?.tests) ? data.tests : [];
  const safeFees = data?.fees || {};
  const safeAttendance = data?.attendance || {};
  const safeFaculty = Array.isArray(data?.faculty) ? data.faculty : [];

  // Helper: Get Class Name
  const getClassName = (classId) => {
    const found = safeClasses.find(c => c && c.id === classId);
    return found ? found.name : (classId || 'N/A');
  };

  // Helper: Format Current Date for file name
  const getTimestamp = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Total attendance entries count
  let totalAttendanceCount = 0;
  Object.values(safeAttendance).forEach(rec => {
    if (rec && rec.records) {
      totalAttendanceCount += Object.keys(rec.records).length;
    }
  });

  // 1. Export Multi-Sheet Excel Workbook (.xlsx)
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();
      const dateStr = getTimestamp();

      // --- SHEET 1: STUDENTS DIRECTORY ---
      const studentsSheetData = safeStudents.map((s, index) => ({
        'Sr #': index + 1,
        'Roll Number': s.rollNo || '',
        'Student Name': s.name || '',
        'Father Name': s.fname || '',
        'Father Contact': s.fatherNumber || s.parentContact || '',
        'Class': `Class ${getClassName(s.classId)}`,
        'Monthly Fee (PKR)': Number(s.monthlyFee) || 0,
        'Enrollment Date': s.admissionDate || s.createdAt || 'N/A',
        'Address': s.address || '',
        'Status': s.status || 'Active'
      }));
      const wsStudents = XLSX.utils.json_to_sheet(studentsSheetData);
      XLSX.utils.book_append_sheet(wb, wsStudents, "Students Directory");

      // --- SHEET 2: FEE RECORDS ---
      const feeSheetData = [];
      Object.entries(safeFees).forEach(([key, feeRec], idx) => {
        if (!feeRec) return;
        // Key format: YYYY-MM_studentId
        const parts = key.split('_');
        const month = feeRec.month || parts[0] || 'N/A';
        const studentId = feeRec.studentId || parts.slice(1).join('_');
        const student = safeStudents.find(s => s && s.id === studentId);

        const expected = Number(feeRec.monthlyFee) || Number(student?.monthlyFee) || 0;
        const paid = Number(feeRec.paidAmount) || (feeRec.status === 'Paid' ? expected : 0);
        const pending = Math.max(0, expected - paid);

        feeSheetData.push({
          'Sr #': idx + 1,
          'Month': month,
          'Roll Number': student?.rollNo || '',
          'Student Name': student?.name || feeRec.studentName || 'N/A',
          'Father Name': student?.fname || 'N/A',
          'Class': student ? `Class ${getClassName(student.classId)}` : 'N/A',
          'Total Due (PKR)': expected,
          'Paid Amount (PKR)': paid,
          'Pending Balance (PKR)': pending,
          'Payment Status': feeRec.status || (pending === 0 ? 'Paid' : 'Pending'),
          'Payment Date': feeRec.paidDate || feeRec.updatedAt || 'N/A',
          'Receipt #': feeRec.receiptNo || `REC-${key}`
        });
      });
      const wsFees = XLSX.utils.json_to_sheet(feeSheetData.length > 0 ? feeSheetData : [{ Message: 'No fee records found' }]);
      XLSX.utils.book_append_sheet(wb, wsFees, "Fee Records");

      // --- SHEET 3: ATTENDANCE LEDGER ---
      const attendanceSheetData = [];
      let attIndex = 1;
      Object.entries(safeAttendance).forEach(([key, record]) => {
        if (!record || !record.records) return;
        const recDate = record.date || key.split('_')[0];
        const recClassId = record.classId || key.split('_').slice(1).join('_');
        const className = getClassName(recClassId);

        Object.entries(record.records).forEach(([stdId, status]) => {
          const std = safeStudents.find(s => s && s.id === stdId);
          attendanceSheetData.push({
            'Sr #': attIndex++,
            'Date': recDate,
            'Class': `Class ${className}`,
            'Roll #': std?.rollNo || '',
            'Student Name': std?.name || 'N/A',
            'Father Name': std?.fname || 'N/A',
            'Attendance Status': status
          });
        });
      });
      const wsAttendance = XLSX.utils.json_to_sheet(attendanceSheetData.length > 0 ? attendanceSheetData : [{ Message: 'No attendance records found' }]);
      XLSX.utils.book_append_sheet(wb, wsAttendance, "Attendance Records");

      // --- SHEET 4: TESTS & MARKS LEDGER ---
      const marksSheetData = [];
      let markIndex = 1;
      safeTests.forEach(test => {
        if (!test) return;
        const testClass = getClassName(test.classId);
        const scores = test.scores || {};

        Object.entries(scores).forEach(([stdId, scoreVal]) => {
          const std = safeStudents.find(s => s && s.id === stdId);
          const obt = Number(scoreVal) || 0;
          const max = Number(test.maxMarks) || 100;
          const pct = max > 0 ? Math.round((obt / max) * 100) : 0;

          let grade = 'F';
          if (pct >= 85) grade = 'A+';
          else if (pct >= 75) grade = 'A';
          else if (pct >= 65) grade = 'B';
          else if (pct >= 50) grade = 'C';
          else if (pct >= 40) grade = 'D';

          marksSheetData.push({
            'Sr #': markIndex++,
            'Test Title': test.title || test.subject || 'Monthly Test',
            'Subject': test.subject || '',
            'Class': `Class ${testClass}`,
            'Date': test.date || test.month || '',
            'Roll #': std?.rollNo || '',
            'Student Name': std?.name || 'N/A',
            'Father Name': std?.fname || 'N/A',
            'Marks Obtained': obt,
            'Maximum Marks': max,
            'Percentage (%)': `${pct}%`,
            'Grade': grade
          });
        });
      });
      const wsMarks = XLSX.utils.json_to_sheet(marksSheetData.length > 0 ? marksSheetData : [{ Message: 'No test marks recorded' }]);
      XLSX.utils.book_append_sheet(wb, wsMarks, "Tests & Marks");

      // --- SHEET 5: FACULTY DIRECTORY ---
      const facultySheetData = safeFaculty.map((f, i) => ({
        'Sr #': i + 1,
        'Teacher Name': f.teacher || f.name || '',
        'Subject Specialization': f.subject || '',
        'Education / Degree': f.education || '',
        'Teaching Experience': f.experience || '',
        'Assigned Classes': f.classes || '',
        'Contact Number': f.phone || f.contact || 'N/A'
      }));
      const wsFaculty = XLSX.utils.json_to_sheet(facultySheetData.length > 0 ? facultySheetData : [{ Message: 'No faculty profiles found' }]);
      XLSX.utils.book_append_sheet(wb, wsFaculty, "Teaching Faculty");

      // Save and trigger download
      const fileName = `Al_Zia_Academy_Complete_Backup_${dateStr}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setDownloadSuccess('Excel Backup فائل کامیابی سے ڈاؤن لوڈ ہو گئی ہے!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err) {
      console.error('Excel Export Error:', err);
      alert('ایکسل بیک اپ بناتے ہوئے خرابی پیش آئی: ' + err.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 2. Export Raw JSON Backup (.json)
  const handleExportJson = () => {
    try {
      setIsExportingJson(true);
      const dateStr = getTimestamp();
      const backupPayload = {
        metadata: {
          academyName: 'Al-Zia Science Academy',
          exportedAt: new Date().toISOString(),
          version: '2.0',
          totalStudents: safeStudents.length,
          totalClasses: safeClasses.length,
          totalTests: safeTests.length,
          totalFeeRecords: Object.keys(safeFees).length
        },
        data: data || {}
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupPayload, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `Al_Zia_Academy_Full_Database_Backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess('مکمل ڈیٹا بیس JSON فائل کامیابی سے محفوظ ہو گئی!');
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err) {
      console.error('JSON Export Error:', err);
      alert('JSON بیک اپ فائل ڈاؤن لوڈ نہیں ہو سکی: ' + err.message);
    } finally {
      setIsExportingJson(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      
      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto relative text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                  1-Click مکمل ڈیٹا بیک اپ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Offline Safety
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download all students, fees, attendance, test scores & faculty offline anytime.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Summary of Data to be Exported */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            بیک اپ میں شامل تمام ریکارڈز کا خلاصہ:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
              <Users className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <div className="text-sm font-black text-slate-900 dark:text-white">{safeStudents.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">کل طلباء</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
              <CreditCard className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <div className="text-sm font-black text-slate-900 dark:text-white">{Object.keys(safeFees).length}</div>
              <div className="text-[10px] text-slate-500 font-medium">فیس ریکارڈز</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
              <Calendar className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-sm font-black text-slate-900 dark:text-white">{totalAttendanceCount}</div>
              <div className="text-[10px] text-slate-500 font-medium">حاضری اینٹریز</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
              <Award className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <div className="text-sm font-black text-slate-900 dark:text-white">{safeTests.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">ٹیسٹ ایگزامز</div>
            </div>
          </div>
        </div>

        {/* Export Buttons Options */}
        <div className="space-y-3 pt-1">
          
          {/* OPTION 1: Complete Excel Workbook */}
          <div className="border border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  مکمل ایکسل شیٹ ڈاؤن لوڈ کریں (.xlsx)
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                5 الگ الگ شیٹس: طلباء، فیسیں، روزانہ حاضری، ٹیسٹ مارکس، اور اساتذہ۔ MS Excel میں اوپن کریں۔
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {isExportingExcel ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Excel...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Excel (.xlsx)</span>
                </>
              )}
            </button>
          </div>

          {/* OPTION 2: Raw Cloud JSON Backup */}
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  فل ڈیٹا بیس فائل ڈاؤن لوڈ کریں (.json)
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اکیڈمی کا خام (Raw) ڈیٹا بیس۔ مستقبل میں سسٹم بحال (Restore) کرنے کے لیے بہترین۔
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              disabled={isExportingJson}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {isExportingJson ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing JSON...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Backup JSON</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Security / Cloud note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Firebase Cloud Sync: محفوظ اور ہر وقت لائیو</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400">
            {getTimestamp()}
          </span>
        </div>

      </div>

    </div>,
    document.body
  );
}
