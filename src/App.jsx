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
import { Heart, Code, ShieldCheck, Clock, Award, GraduationCap, Phone } from 'lucide-react';
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
  DEFAULT_FACULTY,
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

          setData(prev => {
            // Helper to merge lists by ID without losing local additions
            const mergeById = (localList = [], cloudList = []) => {
              const map = new Map();
              (localList || []).forEach(item => { if (item?.id) map.set(item.id, item); });
              (cloudList || []).forEach(item => { if (item?.id) map.set(item.id, item); });
              return Array.from(map.values());
            };

            const mergedStudents = mergeById(prev.students, cloudData.students);
            const mergedTests = mergeById(prev.tests, cloudData.tests);
            const mergedResources = mergeById(prev.resources, cloudData.resources);
            const mergedFeedbacks = mergeById(prev.feedbacks, cloudData.feedbacks);
            const mergedNotices = mergeById(prev.notices, cloudData.notices);

            // Auto-sync any locally discovered students back to cloud if missing in cloud
            if (cloudData.students && Array.isArray(cloudData.students)) {
              const cloudIds = new Set(cloudData.students.map(s => s.id));
              (prev.students || []).forEach(s => {
                if (s?.id && !cloudIds.has(s.id)) {
                  syncWithFirestore('students', s.id, s).catch(() => {});
                }
              });
            }

            return {
              ...prev,
              tests: mergedTests,
              students: mergedStudents,
              classes: cloudData.classes && cloudData.classes.length > 0 ? cloudData.classes : prev.classes,
              notices: mergedNotices,
              attendance: { ...prev.attendance, ...(cloudData.attendance || {}) },
              fees: { ...prev.fees, ...(cloudData.fees || {}) },
              resources: mergedResources,
              feedbacks: mergedFeedbacks,
              timetable: (Array.isArray(cloudData.timetable) && cloudData.timetable.length > 0 && !cloudData.timetable.some(t => JSON.stringify(t).includes('Combined') || JSON.stringify(t).includes('Jalab') || !t.boys))
                ? cloudData.timetable 
                : DEFAULT_TIMETABLE,
              ...(Array.isArray(cloudData.faculty) ? { faculty: cloudData.faculty } : {})
            };
          });

          if (cloudData.timetable && cloudData.timetable.some(t => JSON.stringify(t).includes('Combined') || JSON.stringify(t).includes('Jalab') || !t.boys)) {
            syncWithFirestore('settings', 'timetable', { schedule: DEFAULT_TIMETABLE });
          }
        }
      }).catch(() => {});

      // 3. Real-time listener for tests (updates Top High Scorers live across all devices)
      unsubTests = subscribeToCollection('tests', (remoteTests) => {
        if (Array.isArray(remoteTests) && remoteTests.length > 0) {
          setData(prev => {
            const map = new Map();
            (prev.tests || []).forEach(t => { if (t?.id) map.set(t.id, t); });
            remoteTests.forEach(t => { if (t?.id) map.set(t.id, t); });
            const merged = Array.from(map.values());
            if (JSON.stringify(prev.tests) === JSON.stringify(merged)) return prev;
            return { ...prev, tests: merged };
          });
        }
      });

      // 4. Real-time listener for students
      unsubStudents = subscribeToCollection('students', (remoteStudents) => {
        if (Array.isArray(remoteStudents) && remoteStudents.length > 0) {
          setData(prev => {
            const map = new Map();
            (prev.students || []).forEach(s => { if (s?.id) map.set(s.id, s); });
            remoteStudents.forEach(s => { if (s?.id) map.set(s.id, s); });
            const merged = Array.from(map.values());
            if (JSON.stringify(prev.students) === JSON.stringify(merged)) return prev;
            return { ...prev, students: merged };
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
          const mockNames = ['haris jabbar', 'malik umar', 'hassan raza', 'abdul ghani', 'ghulam hussain', 'zaid malik'];
          const cleanList = docData.list.filter(f => {
            if (!f || !f.teacher) return false;
            const lower = f.teacher.toLowerCase();
            return !mockNames.some(m => lower.includes(m)) && !['fac-1', 'fac-2', 'fac-3', 'fac-4', 'fac-5', 'fac-6'].includes(f.id);
          });
          const list = cleanList.length > 0 ? cleanList : DEFAULT_FACULTY;
          setData(prev => {
            if (JSON.stringify(prev.faculty) === JSON.stringify(list)) return prev;
            return { ...prev, faculty: list };
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

  // Handler: Save Attendance (Cloud-First)
  const handleSaveAttendance = async (date, classId, records) => {
    const attendanceKey = `${date}_${classId}`;
    const newRecordObj = { date, classId, records };

    // 1. Write directly to Cloud Firebase
    await syncWithFirestore('attendance', attendanceKey, newRecordObj);

    // 2. Update state & local cache
    setData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [attendanceKey]: newRecordObj
      }
    }));
  };

  // Handler: Add Test Marks (Cloud-First)
  const handleAddTest = async (newTest) => {
    // 1. Write directly to Cloud Firebase
    await syncWithFirestore('tests', newTest.id, newTest);

    // 2. Update state
    setData(prev => {
      const existingTests = Array.isArray(prev?.tests) ? prev.tests : [];
      return {
        ...prev,
        tests: [newTest, ...existingTests]
      };
    });
  };

  // Handler: Delete Test (Cloud-First)
  const handleDeleteTest = async (testId) => {
    await deleteFromFirestore('tests', testId);
    setData(prev => {
      const existingTests = Array.isArray(prev?.tests) ? prev.tests : [];
      return {
        ...prev,
        tests: existingTests.filter(t => t && t.id !== testId)
      };
    });
  };

  // Handler: Add Class (Cloud-First)
  const handleAddClass = async (newClass) => {
    await syncWithFirestore('classes', newClass.id, newClass);

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
  };

  // Handler: Delete Class (Cloud-First)
  const handleDeleteClass = async (classId) => {
    await deleteFromFirestore('classes', classId);

    setData(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== classId),
      students: prev.students.filter(s => s.classId !== classId)
    }));
  };

  // Handler: Update Class (Cloud-First)
  const handleUpdateClass = async (updatedClass) => {
    await syncWithFirestore('classes', updatedClass.id, updatedClass);

    setData(prev => {
      const updatedClasses = (prev.classes || []).map(c => 
        c.id === updatedClass.id ? { ...c, ...updatedClass, subjects: [...(updatedClass.subjects || [])] } : c
      );
      const nextData = { ...prev, classes: updatedClasses };
      saveLocalData(nextData);
      return nextData;
    });
  };

  // Handler: Add Student (Cloud-First - Direct to Firebase)
  const handleAddStudent = async (newStudent) => {
    // 1. Immediately push to Firebase Firestore Cloud
    await syncWithFirestore('students', newStudent.id, newStudent);

    // 2. Reflect in UI state
    setData(prev => {
      const exists = (prev.students || []).some(s => s.id === newStudent.id);
      if (exists) return prev;
      return {
        ...prev,
        students: [...prev.students, newStudent]
      };
    });
  };

  // Handler: Update Student (Cloud-First - Direct to Firebase)
  const handleUpdateStudent = async (updatedStudent) => {
    await syncWithFirestore('students', updatedStudent.id, updatedStudent);

    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));
  };

  // Handler: Delete Student (Cloud-First - Direct to Firebase)
  const handleDeleteStudent = async (studentId) => {
    await deleteFromFirestore('students', studentId);

    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));
  };

  // Handler: Save Timetable (Cloud-First)
  const handleSaveTimetable = async (newTimetable) => {
    await syncWithFirestore('settings', 'timetable', { schedule: newTimetable });

    setData(prev => ({
      ...prev,
      timetable: newTimetable
    }));
  };

  // Handler: Add Resource (Cloud-First)
  const handleAddResource = async (newResource) => {
    await syncWithFirestore('resources', newResource.id, newResource);

    setData(prev => ({
      ...prev,
      resources: [newResource, ...(prev.resources || [])]
    }));
  };

  // Handler: Update Resource (Cloud-First)
  const handleUpdateResource = async (updatedResource) => {
    await syncWithFirestore('resources', updatedResource.id, updatedResource);

    setData(prev => ({
      ...prev,
      resources: (prev.resources || []).map(r => r.id === updatedResource.id ? updatedResource : r)
    }));
  };

  // Handler: Delete Resource (Cloud-First)
  const handleDeleteResource = async (resourceId) => {
    await deleteFromFirestore('resources', resourceId);

    setData(prev => ({
      ...prev,
      resources: (prev.resources || []).filter(r => r.id !== resourceId)
    }));
  };

  // Handler: Save Fee Record (Cloud-First)
  const handleSaveFeeRecord = async (feeKey, feeRecord) => {
    await syncWithFirestore('fees', feeKey, feeRecord);

    setData(prev => ({
      ...prev,
      fees: {
        ...(prev.fees || {}),
        [feeKey]: feeRecord
      }
    }));
  };

  // Handler: Add Student Feedback (Cloud-First)
  const handleAddFeedback = async (newFeedback) => {
    await syncWithFirestore('feedbacks', newFeedback.id, newFeedback);

    setData(prev => ({
      ...prev,
      feedbacks: [newFeedback, ...(prev.feedbacks || [])]
    }));
  };

  // Handler: Delete Feedback (Cloud-First)
  const handleDeleteFeedback = async (feedbackId) => {
    await deleteFromFirestore('feedbacks', feedbackId);

    setData(prev => ({
      ...prev,
      feedbacks: (prev.feedbacks || []).filter(fb => fb.id !== feedbackId)
    }));
  };

  // Handler: Toggle Feedback Status (Cloud-First)
  const handleToggleFeedbackStatus = async (feedbackId) => {
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
      await syncWithFirestore('feedbacks', feedbackId, updatedFb);
    }
  };

  // Handler: Add Notice (Cloud-First)
  const handleAddNotice = async (newNotice) => {
    await syncWithFirestore('notices', newNotice.id, newNotice);

    setData(prev => ({
      ...prev,
      notices: [newNotice, ...(prev.notices || [])]
    }));
  };

  // Handler: Delete Announcement Notice (Cloud-First)
  const handleDeleteNotice = async (noticeId) => {
    await deleteFromFirestore('notices', noticeId);

    setData(prev => ({
      ...prev,
      notices: (prev.notices || []).filter(n => n.id !== noticeId)
    }));
  };

  const handleUpdateFaculty = async (updatedFacultyList) => {
    const newData = { ...data, faculty: updatedFacultyList };
    setData(newData);
    saveLocalData(newData);
    await syncWithFirestore('settings', 'faculty', { list: updatedFacultyList });
  };

  const handleUpdateAiRules = async (updatedRules) => {
    const newData = { ...data, aiRules: updatedRules };
    setData(newData);
    saveLocalData(newData);
    await syncWithFirestore('settings', 'aiRules', { rules: updatedRules });
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
            <div className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs flex items-center gap-2 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Sync Button (Admin Only) */}
            {isAdminLoggedIn && (
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
                    alert('All tests, marks, attendance, and records have been synced successfully.');
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-2.5 sm:px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                title="Sync data across devices"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">Sync Data</span>
                <span className="sm:hidden">Sync</span>
              </button>
            )}

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

              {/* Right Column: Academy Contact & Admissions Helpdesk (5 cols) */}
              <div className="lg:col-span-5 w-full">
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/20 via-slate-800/30 to-transparent border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-indigo-950/10">
                  <div className="rounded-[15px] bg-white/95 dark:bg-[#0b0f1d]/95 backdrop-blur-xl p-5 space-y-3.5">
                    
                    {/* Top Row: Office & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Admissions &amp; Office Helpline
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Admissions Open
                      </span>
                    </div>

                    {/* Contact Person & Direct Phone */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        Campus Incharge / Information Desk
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                            Sir Zia-ur-Rehman
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            Director &amp; Senior Academic Lead
                          </p>
                        </div>
                        <a 
                          href="https://wa.me/923346683236" 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>0334-6683236</span>
                        </a>
                      </div>
                    </div>

                    {/* Quick Info Badges */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 font-medium">
                        🕒 3:00 PM – 6:30 PM
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 font-medium">
                        📍 Main Campus
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 font-medium">
                        🎓 Session 2026-2027
                      </span>
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
