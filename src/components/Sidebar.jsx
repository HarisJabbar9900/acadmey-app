import React, { useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  ClipboardCheck, 
  Award, 
  Users, 
  Database,
  Lock, 
  Unlock, 
  KeyRound, 
  Settings, 
  CheckCircle2, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  Sun, 
  Moon,
  Menu,
  X,
  ShieldCheck,
  Bell,
  ChevronRight,
  School,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { isFirebaseActive } from '../services/academyService';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  classes = [], 
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Grouped Navigation Items
  const navSections = [
    {
      title: 'Main Overview',
      items: [
        { 
          id: 'dashboard', 
          label: isAdminLoggedIn ? 'Admin Dashboard' : 'Student Portal', 
          icon: LayoutDashboard,
          badge: null
        }
      ]
    },
    {
      title: 'Academic & Learning',
      items: [
        { 
          id: 'timetable', 
          label: 'Class Timetable', 
          icon: Calendar,
          badge: null
        },
        { 
          id: 'library', 
          label: 'Study Material', 
          icon: BookOpen,
          badge: 'Free'
        },
        { 
          id: 'paper', 
          label: 'AI Test Generator', 
          icon: FileText,
          badge: 'AI Smart',
          isSpecial: true
        }
      ]
    },
    {
      title: 'Records & Management',
      items: [
        ...(isAdminLoggedIn ? [
          { 
            id: 'fees', 
            label: 'Fee Manager', 
            icon: CreditCard,
            badge: 'Admin'
          },
          { 
            id: 'attendance', 
            label: 'Daily Attendance', 
            icon: ClipboardCheck,
            badge: 'Admin'
          }
        ] : []),
        { 
          id: 'marks', 
          label: 'Tests & Marks', 
          icon: Award,
          badge: null
        },
        { 
          id: 'students', 
          label: 'Classes & Students', 
          icon: Users,
          badge: classes.length > 0 ? `${classes.length} Classes` : null
        }
      ]
    },
    {
      title: 'Community & Support',
      items: [
        { 
          id: 'feedback', 
          label: 'Feedback & Notes', 
          icon: MessageSquare,
          badge: null
        }
      ]
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

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

  // Sidebar content (Shared between Desktop Fixed Sidebar and Mobile Drawer)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      
      {/* Top Brand Section */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Al-Zia Academy
              </h1>
              <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Science Portal</span>
                <span className="w-1 h-1 rounded-full bg-slate-600 inline-block"></span>
                <span className="text-indigo-400 font-semibold">Pro v2.5</span>
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Status Pill */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Sync</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

        {/* Navigation Menus with Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {section.title}
              </div>
              {section.items.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-800/80 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="tracking-wide">{tab.label}</span>
                    </div>

                    {tab.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.isSpecial 
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 border border-pink-500/30'
                            : tab.badge === 'Admin'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400'
                      }`}>
                        {tab.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User & Control Center */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3">
        
        {/* Admin Status Card */}
        {isAdminLoggedIn ? (
          <div className="p-3 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400 leading-tight">Admin Mode Active</p>
                  <p className="text-[10px] text-slate-400">Full Edit Permissions</p>
                </div>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsChangePinModalOpen(true)}
                className="flex-1 py-1.5 px-2 bg-slate-800/90 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                title="Change Admin Security PIN"
              >
                <Settings className="w-3 h-3 text-indigo-400" />
                PIN
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 border border-rose-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Admin Controls</p>
                <p className="text-[10px] text-slate-400">Staff Authentication</p>
              </div>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Login
            </button>
          </div>
        )}

        {/* Quick Toolbar (Theme Switcher + Online Users Counter) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={toggleTheme}
            className="flex-1 py-1.5 px-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center justify-center gap-1.5"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">Dark Mode</span>
              </>
            )}
          </button>

          {isAdminLoggedIn && (
            <div 
              className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
              title={`Active: ${desktopCount} PC, ${mobileCount} Mobile`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{onlineCount} live</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* 📱 Mobile Top Navigation Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">Al-Zia Academy</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {isAdminLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Unlock className="w-3 h-3" /> Admin
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Login
            </button>
          )}
        </div>
      </header>

      {/* 📱 Mobile Slideout Drawer Backdrop & Container */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl z-10 flex flex-col">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 💻 Desktop Left Fixed/Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 shadow-xl z-20 overflow-hidden">
        {renderSidebarContent()}
      </aside>

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
                <p className="text-[11px] text-slate-400 mt-2">
                  🔒 Passcode enables full access to add, edit, or delete students, fees, attendance & marks.
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
    </>
  );
}
