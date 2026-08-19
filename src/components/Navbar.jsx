import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  ClipboardCheck, 
  Award, 
  Users, 
  Database,
  Layers,
  Lock,
  Unlock,
  KeyRound,
  Settings,
  CheckCircle2,
  Calendar,
  BookOpen,
  CreditCard,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';
import { isFirebaseActive } from '../services/academyService';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  classes, 
  selectedClassId, 
  setSelectedClassId,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  theme,
  toggleTheme,
  adminPin,
  onUpdateAdminPin,
  onlineUsers = []
}) {
  const firebaseConnected = isFirebaseActive();

  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];
  const onlineCount = safeOnlineUsers.length;
  const desktopCount = safeOnlineUsers.filter(u => u && typeof u.device === 'string' && u.device.includes('Desktop')).length;
  const mobileCount = safeOnlineUsers.filter(u => u && typeof u.device === 'string' && u.device.includes('Mobile')).length;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Change PIN form state
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);
  const [changePinError, setChangePinError] = useState('');

  const tabs = [
    { id: 'dashboard', label: isAdminLoggedIn ? 'Admin Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    ...(isAdminLoggedIn ? [{ id: 'fees', label: 'Fee Manager', icon: CreditCard }] : []),
    { id: 'library', label: 'Study Material', icon: BookOpen },
    ...(isAdminLoggedIn ? [{ id: 'attendance', label: 'Daily Attendance', icon: ClipboardCheck }] : []),
    { id: 'marks', label: 'Tests & Marks', icon: Award },
    { id: 'students', label: 'Classes & Students', icon: Users },
    { id: 'feedback', label: 'Feedback & Suggestions', icon: MessageSquare },
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      setIsAdminLoggedIn(true);
      setIsLoginModalOpen(false);
      setPinInput('');
      setErrorMessage('');
    } else {
      setErrorMessage(`Incorrect Admin Passcode. Please enter your valid PIN.`);
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
  };

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    if (oldPinInput !== adminPin) {
      setChangePinError('Current PIN is incorrect.');
      return;
    }
    if (!newPinInput || newPinInput.length < 4) {
      setChangePinError('New PIN must be at least 4 digits.');
      return;
    }

    // Save new PIN globally
    onUpdateAdminPin(newPinInput);
    setChangePinSuccess(true);
    setChangePinError('');
    setOldPinInput('');
    setNewPinInput('');

    setTimeout(() => {
      setChangePinSuccess(false);
      setIsChangePinModalOpen(false);
    }, 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo & Academy Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-md shadow-indigo-500/20 text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  Al-Zia Science Academy
                </h1>
                <p className="text-xs text-slate-400 mt-1">Online Student & Academy Portal</p>
              </div>
            </div>

            {/* Admin Toggle (Mobile) */}
            <div className="md:hidden flex items-center gap-2">

              {isAdminLoggedIn ? (
                <>
                  <button
                    onClick={() => setIsChangePinModalOpen(true)}
                    className="p-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                    title="Change PIN"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1"
                  >
                    <Unlock className="w-3 h-3" /> Admin Mode
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-full text-xs font-semibold flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Login
                </button>
              )}
            </div>
          </div>

          {/* Class Selector & Admin Access Button */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Class Filter Dropdown */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 flex-1 md:flex-initial">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs text-slate-400 font-medium shrink-0">Filter:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Classes</option>
                {(classes || []).map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold hidden xl:inline text-amber-300">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold hidden xl:inline text-indigo-300">Dark Mode</span>
                </>
              )}
            </button>

            {/* Firebase Badge */}
            <div className="hidden lg:block">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Cloud Active
              </span>
            </div>

            {/* Online Users Status Badge (Admin Only) */}
            {isAdminLoggedIn && (
              <div className="flex items-center">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-extrabold shadow-sm cursor-help"
                  title={`Active: ${desktopCount} PC, ${mobileCount} Mobile`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{onlineCount} Online</span>
                </span>
              </div>
            )}

            {/* Admin Login / Change PIN / Logout Toggle Button (Desktop) */}
            <div className="hidden md:block">
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold shadow-sm">
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    Admin Mode Active
                  </span>
                  
                  <button
                    onClick={() => setIsChangePinModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-indigo-400" /> Change PIN
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Admin Login
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-2 pb-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Admin Authentication</h3>
              </div>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Admin Passcode (PIN)</label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center"
                />
                {errorMessage && (
                  <p className="text-rose-400 text-xs mt-2 font-medium">{errorMessage}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-2">
                  🔒 Passcode enables full access to add, edit, or delete students, attendance & marks.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  Unlock Admin Controls
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Change Admin PIN</h3>
              </div>
              <button onClick={() => setIsChangePinModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {changePinSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Admin PIN updated successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleChangePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Admin PIN</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current PIN"
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Admin PIN</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new 4-digit PIN (e.g. 5678)"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center"
                  />
                </div>

                {changePinError && (
                  <p className="text-rose-400 text-xs font-medium">{changePinError}</p>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsChangePinModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                  >
                    Save New PIN
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </header>
  );
}
