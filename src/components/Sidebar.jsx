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
  Laptop,
  Search,
  UserCheck
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
  onlineUsers = [],
  onOpenCommandPalette
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
          id: 'staff', 
          label: 'Faculty & Staff Info', 
          icon: UserCheck,
          badge: 'Staff'
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
    <div className="flex flex-col h-full max-h-screen justify-between select-none overflow-hidden">
      
      {/* 1. Top Brand Section (Fixed Header) */}
      <div className="shrink-0">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                Al-Zia Academy
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Science Portal</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 inline-block"></span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Pro v2.5</span>
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cloud Status Pill */}
        <div className="px-4 pt-2.5 pb-1">
          <div className="flex items-center justify-between px-3 py-1 bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] shadow-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cloud Sync</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

        {/* Quick Search Trigger Pill */}
        <div className="px-3 pt-2">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (typeof onOpenCommandPalette === 'function') onOpenCommandPalette();
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-900/80 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/90 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-slate-200 transition-all shadow-sm group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Quick Search...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono rounded text-slate-600 dark:text-slate-300 shadow-xs">
              Ctrl K
            </kbd>
          </button>
        </div>
      </div>

      {/* 2. Navigation Menus (Flexible Scrollable Area) */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {section.title}
            </div>
            {section.items.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white hover:bg-indigo-50/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="tracking-wide truncate">{tab.label}</span>
                  </div>

                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.isSpecial 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-500/30'
                          : tab.badge === 'Admin'
                            ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 3. Bottom User & Control Center (Fixed Shrink-0 Anchored at Bottom) */}
      <div className="shrink-0 p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/60 space-y-2.5">
        
        {/* Admin Status Card */}
        {isAdminLoggedIn ? (
          <div className="p-2.5 bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-xl space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-tight">Admin Mode Active</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Full Edit Permissions</p>
                </div>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => setIsChangePinModalOpen(true)}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
                title="Change Admin Security PIN"
              >
                <Settings className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                PIN
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 hover:text-white dark:text-rose-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border border-rose-200 hover:border-rose-600 dark:border-rose-500/30 transition-colors cursor-pointer shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">Admin Login</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">PIN authentication</span>
              </div>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
            >
              Login
            </button>
          </div>
        )}

        {/* Quick Toolbar (Theme Switcher + Online Users Counter) */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={toggleTheme}
            className="group flex-1 py-1.5 px-2.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 rounded-xl transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors shrink-0" />
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 group-hover:text-indigo-700 transition-colors shrink-0" />
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Dark Mode</span>
              </>
            )}
          </button>

          {isAdminLoggedIn && (
            <div 
              className="px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shrink-0"
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
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">Al-Zia Academy</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCommandPalette}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            title="Search Portal (Ctrl + K)"
          >
            <Search className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs cursor-pointer shadow-xs"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {isAdminLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Unlock className="w-3 h-3" /> Admin
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-72 max-w-[80vw] h-full max-h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col overflow-hidden">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 💻 Desktop Left Fixed/Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen max-h-screen sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl z-20 overflow-hidden">
        {renderSidebarContent()}
      </aside>

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Admin Authentication</h3>
              </div>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enter Admin Passcode (PIN)</label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-center shadow-xs"
                />
                {errorMessage && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-2 font-bold">{errorMessage}</p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
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
