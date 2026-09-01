import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  Printer, 
  Sparkles,
  Phone,
  UserCheck,
  Building2,
  Clock,
  Check,
  RotateCcw,
  Lock,
  Download,
  Loader2,
  GraduationCap,
  X
} from 'lucide-react';

export default function FeeManager({ data, selectedClassId, isAdminLoggedIn, onSaveFeeRecord }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  const [activeClassFilter, setActiveClassFilter] = useState(selectedClassId || 'ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Unpaid'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAdminLoggedIn) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Confidential Financial Data</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Academy Fee Collection accounts are strictly protected and visible to Admin only. Please click <strong className="text-indigo-400">Admin Login</strong> in the top right menu and enter your PIN to access Fee Manager.
        </p>
      </div>
    );
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [feeAmount, setFeeAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [receiptStudent, setReceiptStudent] = useState(null);
  const [notification, setNotification] = useState(null);

  const feesObj = data.fees || {};

  // Open Payment Modal
  const handleOpenPaymentModal = (student) => {
    setSelectedStudentForFee(student);
    const feeKey = `${selectedMonth}_${student.id}`;
    const existing = feesObj[feeKey];
    setFeeAmount(existing?.paidAmount || existing?.monthlyFee || '');
    setPaymentDate(existing?.paidDate || new Date().toISOString().split('T')[0]);
    setPaymentMethod(existing?.paymentMethod || 'Cash');
    setIsModalOpen(true);
  };

  // Submit Payment
  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!selectedStudentForFee) return;

    const feeKey = `${selectedMonth}_${selectedStudentForFee.id}`;
    const amtNum = Number(feeAmount) || 0;
    const feeRecord = {
      month: selectedMonth,
      studentId: selectedStudentForFee.id,
      monthlyFee: amtNum,
      paidAmount: amtNum,
      status: 'Paid',
      paidDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod
    };

    onSaveFeeRecord(feeKey, feeRecord);
    setIsModalOpen(false);

    setNotification(`Fee of Rs. ${amtNum} marked PAID for "${selectedStudentForFee.name}" on ${paymentDate}!`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Mark Unpaid
  const handleMarkUnpaid = (student) => {
    const feeKey = `${selectedMonth}_${student.id}`;
    const existing = feesObj[feeKey];
    const feeRecord = {
      month: selectedMonth,
      studentId: student.id,
      monthlyFee: existing?.monthlyFee || 0,
      paidAmount: 0,
      status: 'Unpaid',
      paidDate: '',
      paymentMethod: ''
    };

    onSaveFeeRecord(feeKey, feeRecord);
    setNotification(`Status for "${student.name}" set to UNPAID.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Pagination State (Max 10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter students based on Class, Search Query & Status
  const filteredStudents = data.students.filter(student => {
    const isClassMatch = activeClassFilter === 'ALL' || student.classId === activeClassFilter;
    
    const feeKey = `${selectedMonth}_${student.id}`;
    const feeRecord = feesObj[feeKey];
    const status = feeRecord?.status || 'Unpaid';

    const isStatusMatch = statusFilter === 'ALL' || status === statusFilter;
    const isSearchMatch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.fname && student.fname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.rollNo && student.rollNo.includes(searchQuery));

    return isClassMatch && isStatusMatch && isSearchMatch;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate Whole Academy Statistics for selected month
  let grandTotalCollected = 0;
  let grandTotalPending = 0;
  let grandTotalPaidCount = 0;
  let grandTotalUnpaidCount = 0;

  data.students.forEach(student => {
    const feeKey = `${selectedMonth}_${student.id}`;
    const feeRecord = feesObj[feeKey];
    const expectedFee = feeRecord?.monthlyFee || feeRecord?.paidAmount || 0;
    
    if (feeRecord?.status === 'Paid') {
      grandTotalCollected += Number(feeRecord.paidAmount) || expectedFee;
      grandTotalPaidCount++;
    } else {
      grandTotalPending += expectedFee;
      grandTotalUnpaidCount++;
    }
  });

  // Class-Wise Fee Breakdown Summary
  const classFeeSummaries = data.classes.map(cls => {
    const classStudents = data.students.filter(s => s.classId === cls.id);
    let classCollected = 0;
    let classPending = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    classStudents.forEach(student => {
      const feeKey = `${selectedMonth}_${student.id}`;
      const feeRecord = feesObj[feeKey];
      const expectedFee = feeRecord?.monthlyFee || feeRecord?.paidAmount || 0;

      if (feeRecord?.status === 'Paid') {
        classCollected += Number(feeRecord.paidAmount) || expectedFee;
        paidCount++;
      } else {
        classPending += expectedFee;
        unpaidCount++;
      }
    });

    return {
      classId: cls.id,
      className: cls.name,
      totalStudents: classStudents.length,
      classCollected,
      classPending,
      paidCount,
      unpaidCount
    };
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Al-Zia Science Academy Accounts
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            Class-Wise Student Fee Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track student monthly fee payments (Paid / Unpaid status with payment date & receipt generation).
          </p>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2 shrink-0">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 font-medium">Select Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-5 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-xl shadow-emerald-950/40 animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Grand Total Academy Collected Revenue */}
        <div className="bg-slate-900/70 border border-emerald-500/30 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Academy Collected</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">Rs. {grandTotalCollected.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Collected in {selectedMonth}</span>
          </p>
        </div>

        {/* Card 2: Total Pending Fee */}
        <div className="bg-slate-900/70 border border-rose-500/30 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pending Fee</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400">Rs. {grandTotalPending.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>Remaining Unpaid Amount</span>
          </p>
        </div>

        {/* Card 3: Paid Students Count */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Paid Students</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{grandTotalPaidCount}</div>
          <p className="text-xs text-emerald-400 font-semibold mt-1">
            {data.students.length > 0 ? Math.round((grandTotalPaidCount / data.students.length) * 100) : 0}% Fee Recovery Rate
          </p>
        </div>

        {/* Card 4: Unpaid Students Count */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Unpaid Students</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{grandTotalUnpaidCount}</div>
          <p className="text-xs text-slate-400 mt-1">Students awaiting fee deposit</p>
        </div>

      </div>

      {/* Class-Wise Collection Summary Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          Class-Wise Fee Collection Breakdown ({selectedMonth})
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classFeeSummaries.map(c => (
            <div
              key={c.classId}
              onClick={() => setActiveClassFilter(c.classId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeClassFilter === c.classId
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-105'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-white">Class {c.className}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {c.totalStudents} stds
                </span>
              </div>

              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Collected:</span>
                  <span className="text-emerald-400 font-bold">Rs. {c.classCollected.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Pending:</span>
                  <span className="text-rose-400 font-bold">Rs. {c.classPending.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-semibold">{c.paidCount} Paid</span>
                  <span>•</span>
                  <span className="text-rose-400 font-semibold">{c.unpaidCount} Unpaid</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Class Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Class:
            </span>
            <button
              onClick={() => setActiveClassFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeClassFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Classes ({data.students.length})
            </button>
            {data.classes.map(c => {
              const count = data.students.filter(s => s.classId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveClassFilter(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeClassFilter === c.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Class {c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeClassFilter === c.id ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Tabs & Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
              {['ALL', 'Paid', 'Unpaid'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'Paid' ? '🟢 Paid' : '🔴 Unpaid'}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student, roll #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Student Fee Ledger Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              Student Fee Register ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-400">Showing {filteredStudents.length} student record(s)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-4">Roll #</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Father Name & Contact</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4 text-center">Status & Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => {
                  const studentClassObj = data.classes.find(c => c.id === student.classId);
                  const feeKey = `${selectedMonth}_${student.id}`;
                  const feeRecord = feesObj[feeKey];
                  const isPaid = feeRecord?.status === 'Paid';

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-bold">#{student.rollNo}</td>
                      
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{student.name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-slate-300 font-medium">{student.fname || 'N/A'}</div>
                        <div className="text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {student.fatherNumber || 'N/A'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                          Class {studentClassObj?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Status & Date */}
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <div className="flex flex-col items-center">
                            <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PAID
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-1">
                              Date: {feeRecord.paidDate || 'N/A'} • {feeRecord.paymentMethod || 'Cash'}
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-1.5 w-fit mx-auto">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" /> UNPAID
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isAdminLoggedIn ? (
                            <>
                              {isPaid ? (
                                <button
                                  onClick={() => handleMarkUnpaid(student)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="Mark as Unpaid"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Mark Unpaid
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenPaymentModal(student)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Mark Paid
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const parentPhone = student.fatherNumber || student.parentContact;
                                      if (!parentPhone) {
                                        alert(`Parent contact number not found for ${student.name}`);
                                        return;
                                      }
                                      let cleanPhone = parentPhone.replace(/[^0-9]/g, '');
                                      if (cleanPhone.startsWith('0')) {
                                        cleanPhone = '92' + cleanPhone.slice(1);
                                      }
                                      
                                      // Convert '2026-08' to clean month name 'August'
                                      const monthIndex = selectedMonth ? parseInt(selectedMonth.split('-')[1], 10) - 1 : 7;
                                      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                      const monthName = monthNames[monthIndex] || 'August';

                                      const msg = `Respected Parent, Monthly fee for *${student.name}* (Roll #${student.rollNo}, Class ${studentClassObj?.name}) for the month of *${monthName}* is PENDING. Kindly deposit at your earliest convenience. - Al-Zia Science Academy`;
                                      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                    title="Send WhatsApp Fee Pending Reminder to Parent"
                                  >
                                    💬 WA Reminder
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-600 font-mono">🔒 Admin Only</span>
                          )}

                          {/* Print Fee Slip */}
                          <button
                            onClick={() => setReceiptStudent({ student, feeRecord })}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors"
                            title="Print Fee Receipt Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 italic">
                    No student records matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Pager Controls (Max 10 per page) */}
        {filteredStudents.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</strong> of <strong className="text-indigo-400">{filteredStudents.length}</strong> Fee Records
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ◀ Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Mark Paid Form */}
      {isModalOpen && selectedStudentForFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 my-auto max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Mark Fee Paid
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedStudentForFee.name} • Roll #{selectedStudentForFee.rollNo}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Fee Amount Received (Rs.) *
                </label>
                
                {/* Preset Amount Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {[1500, 2000, 2500, 3000, 3500, 4000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFeeAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        Number(feeAmount) === amt
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Rs. {amt}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  placeholder="Enter custom fee amount e.g. 1500, 2000..."
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Type any custom fee amount (e.g. discount or extra fee).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Payment *</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Cash" className="bg-slate-900">Cash Deposit</option>
                  <option value="JazzCash" className="bg-slate-900">JazzCash</option>
                  <option value="EasyPaisa" className="bg-slate-900">EasyPaisa</option>
                  <option value="Bank Transfer" className="bg-slate-900">Bank Transfer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Paid Status
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Fee Slip Receipt */}
      {receiptStudent && createPortal(
        <div className="fee-receipt-modal-wrapper fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto relative">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print-hidden print:hidden">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Student Fee Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const reportElement = document.getElementById('fee-receipt-print-area');
                    if (!reportElement) return;
                    const studentName = receiptStudent.student?.name || 'Student';
                    const fileName = `Fee_Receipt_${studentName.replace(/\s+/g, '_')}_${selectedMonth}.png`;
                    html2canvas(reportElement, { scale: 2.5, backgroundColor: '#ffffff' }).then(canvas => {
                      const image = canvas.toDataURL('image/png', 1.0);
                      const link = document.createElement('a');
                      link.download = fileName;
                      link.href = image;
                      link.click();
                    });
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PNG
                </button>
                <button
                  onClick={() => {
                    const oldTitle = document.title;
                    const studentName = receiptStudent.student?.name || 'Student';
                    document.title = `Fee_Receipt_${studentName.replace(/\s+/g, '_')}_${selectedMonth}`;
                    window.print();
                    setTimeout(() => { document.title = oldTitle; }, 1000);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print PDF
                </button>
                <button
                  onClick={() => setReceiptStudent(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT SLIP AREA */}
            <div 
              id="fee-receipt-print-area"
              className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl space-y-4 mx-auto print:shadow-none print:w-full print:p-4"
            >
              {/* Header Banner */}
              <div className="text-center border-b-2 border-indigo-950 pb-3 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-indigo-950">
                  <GraduationCap className="w-6 h-6" />
                  <h2 className="text-lg font-black uppercase tracking-wide">Al-Zia Science Academy</h2>
                </div>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  Official Student Monthly Fee Payment Voucher
                </p>
              </div>

              {/* Receipt Information Grid */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Fee Month:</span>
                  <span className="font-extrabold text-slate-900">{selectedMonth}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Student Name:</span>
                  <span className="font-extrabold text-indigo-950 text-sm">{receiptStudent.student.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Father Name:</span>
                  <span className="font-bold text-slate-800">{receiptStudent.student.fname || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Roll Number:</span>
                  <span className="font-extrabold text-indigo-700">#{receiptStudent.student.rollNo}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Class:</span>
                  <span className="font-bold text-slate-800">Class {data.classes.find(c => c.id === receiptStudent.student.classId)?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Payment Status:</span>
                  <span className={`font-extrabold px-2.5 py-0.5 rounded text-[11px] ${receiptStudent.feeRecord?.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {receiptStudent.feeRecord?.status === 'Paid' ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
                {receiptStudent.feeRecord?.status === 'Paid' && (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Date Received:</span>
                      <span className="font-bold text-slate-800">{receiptStudent.feeRecord.paidDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500 uppercase font-sans font-bold text-[10px]">Payment Mode:</span>
                      <span className="font-bold text-slate-800">{receiptStudent.feeRecord.paymentMethod || 'Cash'}</span>
                    </div>
                  </>
                )}
                
                {/* Total Paid Box */}
                <div className="flex justify-between py-2.5 text-sm font-extrabold bg-slate-100 border border-slate-200 px-4 rounded-xl mt-3 text-slate-900">
                  <span>Amount Paid:</span>
                  <span className="text-indigo-950 font-mono">Rs. {(receiptStudent.feeRecord?.paidAmount || receiptStudent.monthlyFeeAmount || 2500).toLocaleString()}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[10px] font-sans font-bold text-slate-600">
                <div className="text-center">
                  <div className="w-24 border-b border-slate-800 mb-1" />
                  <span>Accountant</span>
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-slate-800 mb-1" />
                  <span>Administrator</span>
                </div>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
