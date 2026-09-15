import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import Timetable from './components/Timetable';
import FeeManager from './components/FeeManager';
import StudyMaterial from './components/StudyMaterial';
import AttendanceSheet from './components/AttendanceSheet';
import MarksLedger from './components/MarksLedger';
import ClassStudentManager from './components/ClassStudentManager';
import StudentFeedback from './components/StudentFeedback';
import NoticeBoard from './components/NoticeBoard';
import AiChatbot from './components/AiChatbot';
import CommandPalette from './components/CommandPalette';
import MobileSplashScreen from './components/MobileSplashScreen';
import StaffInfo from './components/StaffInfo';
import { Heart, Code, Sparkles, ShieldCheck, Clock, Award, GraduationCap } from 'lucide-react';
import { 
  getInitialData, 
  saveLocalData, 
  syncWithFirestore, 
  deleteFromFirestore,
  seedFirestoreData,
  getFirestoreAdminPin,
  updateAdminPinInCloud,
  subscribeToAdminPin,
  updatePresence,
  removePresence,
  subscribeToPresence,
  cleanStalePresence,
  subscribeToCollection,
  subscribeToMapCollection,
  subscribeToDoc,
  fetchCloudData,
  syncAllDataToCloud,
  DEFAULT_TIMETABLE,
  purgeAllDummyDataFromCloud
} from './services/academyService';

export default function App() {
  const [data, setData] = useState(getInitialData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  
  // Persistent Admin Session (Stays logged in across page reloads / refreshes)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('academy_admin_session_active') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleSetIsAdminLoggedIn = (status) => {
    setIsAdminLoggedIn(status);
    try {
      if (status) {
        localStorage.setItem('academy_admin_session_active', 'true');
      } else {
        localStorage.removeItem('academy_admin_session_active');
      }
    } catch (e) {}
  };

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Keyboard Shortcut for Command Palette (Ctrl + K / Cmd + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Real-time Active Presence Tracker
  useEffect(() => {
    let unsubscribePresence = null;
    let heartbeat = null;

    try {
      let sessionId = sessionStorage.getItem('academy_session_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('academy_session_id', sessionId);
      }

      const deviceType = window.innerWidth < 768 ? 'Mobile📱' : 'Desktop💻';

      updatePresence(sessionId, deviceType).catch(() => {});
      cleanStalePresence().catch(() => {});

      heartbeat = setInterval(() => {
        updatePresence(sessionId, deviceType).catch(() => {});
      }, 45000);

      unsubscribePresence = subscribeToPresence((activeSessions) => {
        setOnlineUsers(activeSessions || []);
      });

      const handleUnload = () => {
        removePresence(sessionId).catch(() => {});
      };
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        if (heartbeat) clearInterval(heartbeat);
        if (typeof unsubscribePresence === 'function') unsubscribePresence();
        window.removeEventListener('beforeunload', handleUnload);
      };
    } catch (err) {
      console.warn('Presence Tracker initialization warning:', err);
    }
  }, []);

  // Global Admin PIN State (Synced with localStorage & Firebase Cloud)
  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem('academy_admin_pin') || '1234';
    } catch (e) {
      return '1234';
    }
  });

  const handleUpdateAdminPin = (newPin) => {
    const stringPin = String(newPin);
    setAdminPin(stringPin);
    try {
      localStorage.setItem('academy_admin_pin', stringPin);
    } catch (e) {}
    updateAdminPinInCloud(stringPin).catch(() => {});
  };

  // Real-time Cloud Synchronization (All Essential Academic Data across Laptop, Mobile & All Devices)
  useEffect(() => {
    let unsubscribePin = null;
    let unsubTests = null;
    let unsubStudents = null;
    let unsubClasses = null;
    let unsubNotices = null;
    let unsubAttendance = null;
    let unsubFees = null;
    let unsubResources = null;
    let unsubFeedbacks = null;
    let unsubFaculty = null;
    let unsubTimetable = null;

    try {
      // 0. Ensure timetable is migrated immediately if stale or missing boys column
      setData(prev => {
        const isStale = !Array.isArray(prev?.timetable) || 
                        prev.timetable.length === 0 || 
                        prev.timetable.some(t => !t || !t.boys || t.boys === 'Subject' || JSON.stringify(t).includes('Combined') || JSON.stringify(t).toLowerCase().includes('jalab'));
        if (isStale) {
          syncWithFirestore('settings', 'timetable', { schedule: DEFAULT_TIMETABLE });
          return { ...prev, timetable: DEFAULT_TIMETABLE };
        }
        return prev;
      });

      // 1. If local data exists, ensure cloud has all tests & records
      if (data) {
        seedFirestoreData(data).catch(() => {});
        syncAllDataToCloud(data).catch(() => {});
      }

      // 2. Fetch fresh cloud data immediately on startup (for mobile & desktop)
      fetchCloudData().then(cloudData => {
        if (cloudData) {
          const hasDummyInCloud = (cloudData.students && cloudData.students.some(s => s && (s.id === 'std-1' || s.name === 'Ali Ahmed'))) ||
                                  (cloudData.tests && cloudData.tests.some(t => t && t.id === 'tst-1'));
          if (hasDummyInCloud) {
            purgeAllDummyDataFromCloud().catch(() => {});
            cloudData.students = [];
            cloudData.tests = [];
            cloudData.attendance = {};
            cloudData.fees = {};
            cloudData.resources = [];
            cloudData.feedbacks = [];
            cloudData.notices = [];
          }

          setData(prev => ({
            ...prev,
            tests: cloudData.tests || [],
            students: cloudData.students || [],
            classes: cloudData.classes && cloudData.classes.length > 0 ? cloudData.classes : prev.classes,
            notices: cloudData.notices || [],
            attendance: cloudData.attendance || {},
            fees: cloudData.fees || {},
            resources: cloudData.resources || [],
            feedbacks: cloudData.feedbacks || [],
            timetable: (Array.isArray(cloudData.timetable) && cloudData.timetable.length > 0 && !cloudData.timetable.some(t => JSON.stringify(t).includes('Combined') || JSON.stringify(t).includes('Jalab') || !t.boys))
              ? cloudData.timetable 
              : DEFAULT_TIMETABLE,
            ...(Array.isArray(cloudData.faculty) ? { faculty: cloudData.faculty } : {})
          }));

          if (cloudData.timetable && cloudData.timetable.some(t => JSON.stringify(t).includes('Combined') || JSON.stringify(t).includes('Jalab') || !t.boys)) {
            syncWithFirestore('settings', 'timetable', { schedule: DEFAULT_TIMETABLE });
          }
        }
      }).catch(() => {});

      // 3. Real-time listener for tests (updates Top High Scorers live across all devices)
      unsubTests = subscribeToCollection('tests', (remoteTests) => {
        if (Array.isArray(remoteTests) && remoteTests.length > 0) {
          setData(prev => {
            if (JSON.stringify(prev.tests) === JSON.stringify(remoteTests)) return prev;
            return { ...prev, tests: remoteTests };
          });
        }
      });

      // 4. Real-time listener for students
      unsubStudents = subscribeToCollection('students', (remoteStudents) => {
        if (Array.isArray(remoteStudents) && remoteStudents.length > 0) {
          setData(prev => {
            if (JSON.stringify(prev.students) === JSON.stringify(remoteStudents)) return prev;
            return { ...prev, students: remoteStudents };
          });
        }
      });

      // 5. Real-time listener for classes
      unsubClasses = subscribeToCollection('classes', (remoteClasses) => {
        if (Array.isArray(remoteClasses) && remoteClasses.length > 0) {
          setData(prev => {
            if (JSON.stringify(prev.classes) === JSON.stringify(remoteClasses)) return prev;
            return { ...prev, classes: remoteClasses };
          });
        }
      });

      // 6. Real-time listener for notices
      unsubNotices = subscribeToCollection('notices', (remoteNotices) => {
        if (Array.isArray(remoteNotices) && remoteNotices.length > 0) {
          setData(prev => {
            if (JSON.stringify(prev.notices) === JSON.stringify(remoteNotices)) return prev;
            return { ...prev, notices: remoteNotices };
          });
        }
      });

      // 7. Real-time listener for attendance
      unsubAttendance = subscribeToMapCollection('attendance', (remoteAtt) => {
        if (remoteAtt && Object.keys(remoteAtt).length > 0) {
          setData(prev => ({
            ...prev,
            attendance: { ...prev.attendance, ...remoteAtt }
          }));
        }
      });

      // 8. Real-time listener for fees
      unsubFees = subscribeToMapCollection('fees', (remoteFees) => {
        if (remoteFees && Object.keys(remoteFees).length > 0) {
          setData(prev => ({
            ...prev,
            fees: { ...prev.fees, ...remoteFees }
          }));
        }
      });

      // 9. Real-time listener for study resources
      unsubResources = subscribeToCollection('resources', (remoteRes) => {
        if (Array.isArray(remoteRes) && remoteRes.length > 0) {
          setData(prev => {
            if (JSON.stringify(prev.resources) === JSON.stringify(remoteRes)) return prev;
            return { ...prev, resources: remoteRes };
          });
        }
      });

      // 10. Real-time listener for student feedback
      unsubFeedbacks = subscribeToCollection('feedbacks', (remoteFb) => {
        if (Array.isArray(remoteFb) && remoteFb.length > 0) {
          setData(prev => {
            if (JSON.stringify(prev.feedbacks) === JSON.stringify(remoteFb)) return prev;
            return { ...prev, feedbacks: remoteFb };
          });
        }
      });

      // 11. Real-time listener for faculty (Staff Directory)
      unsubFaculty = subscribeToDoc('settings', 'faculty', (docData) => {
        if (docData && Array.isArray(docData.list)) {
          setData(prev => {
            if (JSON.stringify(prev.faculty) === JSON.stringify(docData.list)) return prev;
            return { ...prev, faculty: docData.list };
          });
        }
      });

      // 12. Real-time listener for timetable
      unsubTimetable = subscribeToDoc('settings', 'timetable', (docData) => {
        if (docData && Array.isArray(docData.schedule) && docData.schedule.length > 0) {
          const isStale = docData.schedule.some(t => !t || !t.boys || t.boys === 'Subject' || JSON.stringify(t).includes('Combined') || JSON.stringify(t).toLowerCase().includes('jalab'));
          if (isStale) {
            syncWithFirestore('settings', 'timetable', { schedule: DEFAULT_TIMETABLE });
            setData(prev => ({ ...prev, timetable: DEFAULT_TIMETABLE }));
            return;
          }
          setData(prev => {
            if (JSON.stringify(prev.timetable) === JSON.stringify(docData.schedule)) return prev;
            return { ...prev, timetable: docData.schedule };
          });
        }
      });

      // 13. Real-time Admin PIN
      unsubscribePin = subscribeToAdminPin(remotePin => {
        if (remotePin) {
          setAdminPin(String(remotePin));
          try {
            localStorage.setItem('academy_admin_pin', String(remotePin));
          } catch (e) {}
        }
      });
    } catch (err) {
      console.warn('Real-time sync error:', err);
    }

    return () => {
      if (typeof unsubscribePin === 'function') unsubscribePin();
      if (typeof unsubTests === 'function') unsubTests();
      if (typeof unsubStudents === 'function') unsubStudents();
      if (typeof unsubClasses === 'function') unsubClasses();
      if (typeof unsubNotices === 'function') unsubNotices();
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubFees === 'function') unsubFees();
      if (typeof unsubResources === 'function') unsubResources();
      if (typeof unsubFeedbacks === 'function') unsubFeedbacks();
      if (typeof unsubFaculty === 'function') unsubFaculty();
      if (typeof unsubTimetable === 'function') unsubTimetable();
    };
  }, []);

  // Light / Dark Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('academy_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark', 'dark-mode');
      root.classList.remove('light', 'light-mode');
    } else {
      root.classList.add('light', 'light-mode');
      root.classList.remove('dark', 'dark-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('academy_theme', nextTheme);
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  // Handler: Save Attendance
  const handleSaveAttendance = (date, classId, records) => {
    const attendanceKey = `${date}_${classId}`;
    const newRecordObj = { date, classId, records };

    setData(prev => {
      const updatedAttendance = {
        ...prev.attendance,
        [attendanceKey]: newRecordObj
      };
      return { ...prev, attendance: updatedAttendance };
    });

    // Cloud Sync
    syncWithFirestore('attendance', attendanceKey, newRecordObj);
  };

  // Handler: Add Test Marks
  const handleAddTest = (newTest) => {
    setData(prev => {
      const existingTests = Array.isArray(prev?.tests) ? prev.tests : [];
      return {
        ...prev,
        tests: [newTest, ...existingTests]
      };
    });

    // Cloud Sync
    syncWithFirestore('tests', newTest.id, newTest);
  };

  // Handler: Delete Test
  const handleDeleteTest = (testId) => {
    setData(prev => {
      const existingTests = Array.isArray(prev?.tests) ? prev.tests : [];
      return {
        ...prev,
        tests: existingTests.filter(t => t && t.id !== testId)
      };
    });

    deleteFromFirestore('tests', testId);
  };

  // Handler: Add Class
  const handleAddClass = (newClass) => {
    setData(prev => {
      const existingClasses = prev.classes || [];
      if (existingClasses.some(c => c.id === newClass.id || c.name.trim().toLowerCase() === newClass.name.trim().toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        classes: [...existingClasses, newClass]
      };
    });

    syncWithFirestore('classes', newClass.id, newClass);
  };

  // Handler: Delete Class
  const handleDeleteClass = (classId) => {
    setData(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== classId),
      students: prev.students.filter(s => s.classId !== classId)
    }));

    deleteFromFirestore('classes', classId);
  };

  // Handler: Update Class (Subjects, description)
  const handleUpdateClass = (updatedClass) => {
    setData(prev => {
      const updatedClasses = (prev.classes || []).map(c => 
        c.id === updatedClass.id ? { ...c, ...updatedClass, subjects: [...(updatedClass.subjects || [])] } : c
      );
      const nextData = { ...prev, classes: updatedClasses };
      saveLocalData(nextData);
      return nextData;
    });

    syncWithFirestore('classes', updatedClass.id, updatedClass);
  };

  // Handler: Add Student
  const handleAddStudent = (newStudent) => {
    setData(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));

    syncWithFirestore('students', newStudent.id, newStudent);
  };

  // Handler: Update Student
  const handleUpdateStudent = (updatedStudent) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));

    syncWithFirestore('students', updatedStudent.id, updatedStudent);
  };

  // Handler: Delete Student
  const handleDeleteStudent = (studentId) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));

    deleteFromFirestore('students', studentId);
  };

  // Handler: Save Timetable
  const handleSaveTimetable = (newTimetable) => {
    setData(prev => ({
      ...prev,
      timetable: newTimetable
    }));

    syncWithFirestore('settings', 'timetable', { schedule: newTimetable });
  };

  // Handler: Add Resource (PDF / Book / Notes / MCQs)
  const handleAddResource = (newResource) => {
    setData(prev => ({
      ...prev,
      resources: [newResource, ...(prev.resources || [])]
    }));

    syncWithFirestore('resources', newResource.id, newResource);
  };

  // Handler: Update Resource
  const handleUpdateResource = (updatedResource) => {
    setData(prev => ({
      ...prev,
      resources: (prev.resources || []).map(r => r.id === updatedResource.id ? updatedResource : r)
    }));

    syncWithFirestore('resources', updatedResource.id, updatedResource);
  };

  // Handler: Delete Resource
  const handleDeleteResource = (resourceId) => {
    setData(prev => ({
      ...prev,
      resources: (prev.resources || []).filter(r => r.id !== resourceId)
    }));

    deleteFromFirestore('resources', resourceId);
  };

  // Handler: Save Fee Record (Paid / Unpaid)
  const handleSaveFeeRecord = (feeKey, feeRecord) => {
    setData(prev => ({
      ...prev,
      fees: {
        ...(prev.fees || {}),
        [feeKey]: feeRecord
      }
    }));

    syncWithFirestore('fees', feeKey, feeRecord);
  };

  // Handler: Add Student Feedback / Suggestion
  const handleAddFeedback = (newFeedback) => {
    setData(prev => ({
      ...prev,
      feedbacks: [newFeedback, ...(prev.feedbacks || [])]
    }));

    syncWithFirestore('feedbacks', newFeedback.id, newFeedback);
  };

  // Handler: Delete Feedback
  const handleDeleteFeedback = (feedbackId) => {
    setData(prev => ({
      ...prev,
      feedbacks: (prev.feedbacks || []).filter(fb => fb.id !== feedbackId)
    }));

    deleteFromFirestore('feedbacks', feedbackId);
  };

  // Handler: Toggle Feedback Status (Pending <-> Resolved)
  const handleToggleFeedbackStatus = (feedbackId) => {
    let updatedFb = null;
    setData(prev => ({
      ...prev,
      feedbacks: (prev.feedbacks || []).map(fb => {
        if (fb.id === feedbackId) {
          updatedFb = {
            ...fb,
            status: fb.status === 'Resolved' ? 'Pending' : 'Resolved'
          };
          return updatedFb;
        }
        return fb;
      })
    }));

    if (updatedFb) {
      syncWithFirestore('feedbacks', feedbackId, updatedFb);
    }
  };
  const handleAddNotice = (newNotice) => {
    setData(prev => ({
      ...prev,
      notices: [newNotice, ...(prev.notices || [])]
    }));

    syncWithFirestore('notices', newNotice.id, newNotice);
  };

  // Handler: Delete Announcement Notice
  const handleDeleteNotice = (noticeId) => {
    setData(prev => ({
      ...prev,
      notices: (prev.notices || []).filter(n => n.id !== noticeId)
    }));

    deleteFromFirestore('notices', noticeId);
  };

  const handleUpdateFaculty = (updatedFacultyList) => {
    const newData = { ...data, faculty: updatedFacultyList };
    setData(newData);
    saveLocalData(newData);
    syncWithFirestore('settings', 'faculty', { list: updatedFacultyList });
  };

  const handleUpdateAiRules = (updatedRules) => {
    const newData = { ...data, aiRules: updatedRules };
    setData(newData);
    saveLocalData(newData);
    syncWithFirestore(newData, 'aiRules');
  };

  // Handler: Purge All Sample/Dummy Data & Start Clean for Real Data
  const handlePurgeAllData = async () => {
    if (!window.confirm('⚠️ ATTENTION: Are you sure you want to permanently clear all sample records (students, tests, marks, fees, attendance, notices)?\n\nOfficial classes (9th-12th) and your official timetable will be safely kept. This gives you a 100% clean system to start fresh with your real data.')) {
      return;
    }
    await purgeAllDummyDataFromCloud();
    const cleanData = {
      ...data,
      students: [],
      tests: [],
      attendance: {},
      fees: {},
      resources: [],
      feedbacks: [],
      notices: []
    };
    setData(cleanData);
    saveLocalData(cleanData);
    alert('✅ All sample records have been permanently cleared!\n\nAl-Zia Science Academy portal is now completely clean and ready for real data.');
  };

  const tabDetails = {
    dashboard: { 
      title: isAdminLoggedIn ? 'Admin Management Dashboard' : 'Student & Academy Portal', 
      subtitle: 'Complete overview of academy metrics, announcements, student attendance & honors' 
    },
    timetable: { 
      title: 'Class Routine & Timetable', 
      subtitle: 'Official daily lecture schedules, class timings, and subject routines' 
    },
    fees: { 
      title: 'Tuition Fee Management', 
      subtitle: 'Student fee collection records, monthly dues tracking & printable receipts' 
    },
    library: { 
      title: 'Digital Study Material & Notes', 
      subtitle: 'Downloadable PDF course books, past papers, assignments & syllabus' 
    },
    attendance: { 
      title: 'Daily Attendance Register', 
      subtitle: 'Class-wise student daily attendance marking, history and print reports' 
    },
    marks: { 
      title: 'Tests & Marks Ledger', 
      subtitle: 'Record test scores, generate student performance report cards & analytics' 
    },
    students: { 
      title: 'Classes & Student Directory', 
      subtitle: 'Manage classes, student enrollments, roll numbers and printable ID cards' 
    },
    feedback: { 
      title: 'Feedback & Student Inquiries', 
      subtitle: 'Parent and student questions, feedback messages, reviews and replies' 
    },
    staff: { 
      title: 'Teaching Faculty & Staff Directory', 
      subtitle: 'Faculty profiles, subject specializations, academic degrees and teaching qualifications' 
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 dark-mode' : 'bg-slate-50 text-slate-900 light-mode'
    } flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white`}>
      
      {/* 📱 Mobile-Only Luxury Startup Splash Loader (Never shows on Laptop/Desktop) */}
      <MobileSplashScreen />

      {/* Background Subtle Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className={`absolute -top-40 -left-40 w-[36rem] h-[36rem] ${theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-500/15'} rounded-full blur-3xl`} />
        <div className={`absolute top-1/3 -right-40 w-[36rem] h-[36rem] ${theme === 'dark' ? 'bg-purple-600/10' : 'bg-purple-500/15'} rounded-full blur-3xl`} />
        <div className={`absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] ${theme === 'dark' ? 'bg-amber-500/5' : 'bg-amber-400/10'} rounded-full blur-3xl`} />
      </div>

      {/* Left Sidebar Navigation (Desktop Left Sidebar + Mobile Responsive Drawer) */}
      <div className="print:hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          classes={data?.classes || []}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          isAdminLoggedIn={isAdminLoggedIn}
          setIsAdminLoggedIn={handleSetIsAdminLoggedIn}
          theme={theme}
          toggleTheme={toggleTheme}
          adminPin={adminPin}
          onUpdateAdminPin={handleUpdateAdminPin}
          onlineUsers={onlineUsers}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">

        {/* 💻 Desktop Sleek Top Header Bar */}
        <header className={`hidden lg:flex items-center justify-between px-8 py-4 ${
          theme === 'dark' ? 'bg-slate-950/70 border-slate-800/80' : 'bg-white/80 border-slate-200/90'
        } backdrop-blur-md border-b print:hidden`}>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
              <span>Portal</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span>{tabDetails[activeTab]?.title || 'Overview'}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {tabDetails[activeTab]?.title || 'Dashboard'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tabDetails[activeTab]?.subtitle || 'Al-Zia Science Academy Online Management'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Date Indicator */}
            <div className="px-3.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs flex items-center gap-2 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Live Cloud Real-time Status & Sync Button */}
            <button
              onClick={async () => {
                try {
                  await syncAllDataToCloud(data);
                  const fresh = await fetchCloudData();
                  if (fresh) {
                    setData(prev => ({
                      ...prev,
                      ...(fresh.tests && fresh.tests.length > 0 ? { tests: fresh.tests } : {}),
                      ...(fresh.students && fresh.students.length > 0 ? { students: fresh.students } : {}),
                      ...(fresh.classes && fresh.classes.length > 0 ? { classes: fresh.classes } : {}),
                      ...(fresh.notices && fresh.notices.length > 0 ? { notices: fresh.notices } : {}),
                      ...(fresh.attendance && Object.keys(fresh.attendance).length > 0 ? { attendance: { ...prev.attendance, ...fresh.attendance } } : {}),
                      ...(fresh.fees && Object.keys(fresh.fees).length > 0 ? { fees: { ...prev.fees, ...fresh.fees } } : {}),
                      ...(fresh.resources && fresh.resources.length > 0 ? { resources: fresh.resources } : {}),
                      ...(fresh.feedbacks && fresh.feedbacks.length > 0 ? { feedbacks: fresh.feedbacks } : {}),
                      ...(Array.isArray(fresh.timetable) && fresh.timetable.length > 0 && !fresh.timetable.some(t => JSON.stringify(t).includes('Combined') || JSON.stringify(t).includes('Jalab') || !t.boys) ? { timetable: fresh.timetable } : { timetable: DEFAULT_TIMETABLE }),
                      ...(Array.isArray(fresh.faculty) ? { faculty: fresh.faculty } : {})
                    }));
                  }
                  alert('☁️ Live Cloud Synced! All tests, marks, toppers, attendance, fees, and staff are updated across Laptop and Mobile.');
                } catch (e) {
                  console.error(e);
                }
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              title="Click to sync data with Cloud / All Devices"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">☁️ Cloud Live</span>
              <span className="sm:hidden">☁️ Sync</span>
            </button>

            {isAdminLoggedIn ? (
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                🛡️ Admin Session Active
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-semibold">
                🎓 Student & Guest View
              </span>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
          {activeTab === 'dashboard' && (
            <>
              {/* Public Notice Board & Announcement Banner */}
              <div className="print:hidden">
                <NoticeBoard
                  data={data}
                  isAdminLoggedIn={isAdminLoggedIn}
                  onAddNotice={handleAddNotice}
                  onDeleteNotice={handleDeleteNotice}
                />
              </div>

              <AdminDashboard
                data={data}
                selectedClassId={selectedClassId}
                isAdminLoggedIn={isAdminLoggedIn}
                onlineUsers={onlineUsers}
                onPurgeAllData={handlePurgeAllData}
                onNavigate={setActiveTab}
              />
            </>
          )}

          {activeTab === 'timetable' && (
            <Timetable
              timetable={data.timetable || []}
              selectedClassId={selectedClassId}
              isAdminLoggedIn={isAdminLoggedIn}
              onSaveTimetable={handleSaveTimetable}
            />
          )}

          {activeTab === 'fees' && (
            <FeeManager
              data={data}
              selectedClassId={selectedClassId}
              isAdminLoggedIn={isAdminLoggedIn}
              onSaveFeeRecord={handleSaveFeeRecord}
            />
          )}

          {activeTab === 'library' && (
            <StudyMaterial
              data={data}
              selectedClassId={selectedClassId}
              isAdminLoggedIn={isAdminLoggedIn}
              onAddResource={handleAddResource}
              onUpdateResource={handleUpdateResource}
              onDeleteResource={handleDeleteResource}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceSheet
              data={data}
              selectedClassId={selectedClassId}
              isAdminLoggedIn={isAdminLoggedIn}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {activeTab === 'marks' && (
            <MarksLedger
              data={data}
              selectedClassId={selectedClassId}
              isAdminLoggedIn={isAdminLoggedIn}
              onAddTest={handleAddTest}
              onDeleteTest={handleDeleteTest}
            />
          )}

          {activeTab === 'students' && (
            <ClassStudentManager
              data={data}
              selectedClassId={selectedClassId}
              isAdminLoggedIn={isAdminLoggedIn}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'feedback' && (
            <StudentFeedback
              data={data}
              isAdminLoggedIn={isAdminLoggedIn}
              onAddFeedback={handleAddFeedback}
              onDeleteFeedback={handleDeleteFeedback}
              onToggleFeedbackStatus={handleToggleFeedbackStatus}
            />
          )}

          {activeTab === 'staff' && (
            <StaffInfo
              faculty={data.faculty || []}
              isAdminLoggedIn={isAdminLoggedIn}
              onUpdateFaculty={handleUpdateFaculty}
            />
          )}
        </main>

        {/* 🌟 High-Level Executive Platform Footer */}
        <footer className="app-footer-main relative border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070b16] text-slate-500 dark:text-slate-400 text-xs print:hidden transition-colors overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-28 bg-indigo-500/[0.08] blur-[90px] pointer-events-none" />

          {/* Top Hairline Accent Line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 relative space-y-10">
            
            {/* Top Grid: 2 Well-Balanced Executive Pillars */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Academy Brand & Institutional Profile (7 cols) */}
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900/60 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950/40 p-2">
                    <img src="/favicon.svg" alt="Al-Zia Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Al-Zia Science Academy
                    </h3>
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Center for Conceptual Learning &amp; Academic Distinction
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Dedicated to preparing students of Matric &amp; Intermediate (9th, 10th, 11th &amp; 12th) for top board positions through conceptual mastery, daily rigorous evaluations, and seamless digital institutional management.
                </p>

                {/* Badges / Core Features Highlights */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                  <span className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Matric &amp; Intermediate (9th–12th)</span>
                  </span>

                  <span className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Evening Shift: 3:00 PM – 6:30 PM</span>
                  </span>

                  <span className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Cloud Sync Active</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Lead Software Architect & Engineering Card (5 cols) */}
              <div className="lg:col-span-5 w-full">
                <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-transparent hover:from-indigo-500/50 transition-all duration-300 shadow-xl shadow-indigo-950/20">
                  <div className="rounded-[15px] bg-white/95 dark:bg-[#0b0f1d]/95 backdrop-blur-xl p-5 space-y-3.5">
                    
                    {/* Top Row: Tag & Live Version */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                          <Code className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Engineering &amp; Architecture
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        v2.5 Live
                      </span>
                    </div>

                    {/* Developer Name & Credential */}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        Designed, Engineered &amp; Maintained by
                      </p>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                          Haris Jabbar
                        </h4>
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Lead Full-Stack Web Architect &amp; Software Specialist
                      </p>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
                      {['React', 'Next.js', 'Firebase', 'Node.js', 'Express', 'REST APIs', 'Tailwind CSS'].map((tech, i) => (
                        <span key={i} className="text-[9px] px-2.5 py-1 rounded-lg font-mono font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                          {tech}
                        </span>
                      ))}
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Bar: Copyright & Dedicated Safe Clearance */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                &copy; 2026 <strong className="text-slate-900 dark:text-white">Al-Zia Science Academy</strong>. Developed by <strong className="text-indigo-600 dark:text-indigo-400">Haris Jabbar</strong>. All Rights Reserved.
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                <span>for Quality Education in Pakistan</span>
              </div>
            </div>

          </div>
        </footer>

      </div>

      {/* Global Quick Command Palette (Ctrl + K / Search Modal) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        data={data}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectClass={(classId) => setSelectedClassId(classId)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Floating AI Assistant Chatbot Widget */}
      <AiChatbot 
        data={data} 
        isAdminLoggedIn={isAdminLoggedIn} 
        onUpdateFaculty={handleUpdateFaculty}
        onUpdateAiRules={handleUpdateAiRules}
      />

    </div>
  );
}
