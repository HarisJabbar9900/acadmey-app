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
import TestPaperGenerator from './components/TestPaperGenerator';
import AiChatbot from './components/AiChatbot';
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
  cleanStalePresence
} from './services/academyService';

export default function App() {
  const [data, setData] = useState(getInitialData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

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

  // Auto-seed existing student data & subscribe to real-time Admin PIN from Firestore
  useEffect(() => {
    try {
      if (data) {
        seedFirestoreData(data).catch(() => {});
      }
      
      const unsubscribePin = subscribeToAdminPin(remotePin => {
        if (remotePin) {
          setAdminPin(String(remotePin));
          try {
            localStorage.setItem('academy_admin_pin', String(remotePin));
          } catch (e) {}
        }
      });

      return () => {
        if (typeof unsubscribePin === 'function') unsubscribePin();
      };
    } catch (err) {
      console.warn('Admin PIN sync warning:', err);
    }
  }, []);

  // Light / Dark Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('academy_theme') || 'dark';
  });

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
    setData(prev => ({
      ...prev,
      tests: [newTest, ...prev.tests]
    }));

    // Cloud Sync
    syncWithFirestore('tests', newTest.id, newTest);
  };

  // Handler: Delete Test
  const handleDeleteTest = (testId) => {
    setData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== testId)
    }));

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
    setData(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === updatedClass.id ? updatedClass : c)
    }));

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
    syncWithFirestore(newData, 'faculty');
  };

  const handleUpdateAiRules = (updatedRules) => {
    const newData = { ...data, aiRules: updatedRules };
    setData(newData);
    saveLocalData(newData);
    syncWithFirestore(newData, 'aiRules');
  };

  const tabDetails = {
    dashboard: { 
      title: isAdminLoggedIn ? 'Admin Management Dashboard' : 'Student & Academy Portal', 
      subtitle: 'Complete overview of academy metrics, announcements, student attendance & honors' 
    },
    timetable: { 
      title: 'Class Routine & Timetable', 
      subtitle: 'Daily lecture schedules, class timings, teachers and subject routines' 
    },
    fees: { 
      title: 'Tuition Fee Management', 
      subtitle: 'Student fee collection records, monthly dues tracking & printable receipts' 
    },
    library: { 
      title: 'Digital Study Material & Notes', 
      subtitle: 'Downloadable PDF course books, past papers, assignments & syllabus' 
    },
    paper: { 
      title: 'AI Examination Paper Generator', 
      subtitle: 'Generate high-standard customized test papers and quizzes with AI' 
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
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 dark-mode' : 'bg-slate-100 text-slate-900 light-mode'
    } flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white`}>
      
      {/* Background Subtle Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className={`absolute -top-40 -left-40 w-96 h-96 ${theme === 'dark' ? 'bg-indigo-600/10' : 'bg-indigo-500/10'} rounded-full blur-3xl`} />
        <div className={`absolute top-1/3 -right-40 w-96 h-96 ${theme === 'dark' ? 'bg-purple-600/10' : 'bg-purple-500/10'} rounded-full blur-3xl`} />
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
          setIsAdminLoggedIn={setIsAdminLoggedIn}
          theme={theme}
          toggleTheme={toggleTheme}
          adminPin={adminPin}
          onUpdateAdminPin={handleUpdateAdminPin}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">

        {/* 💻 Desktop Sleek Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              <span>Portal</span>
              <span className="text-slate-600">/</span>
              <span>{tabDetails[activeTab]?.title || 'Overview'}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              {tabDetails[activeTab]?.title || 'Dashboard'}
            </h2>
            <p className="text-xs text-slate-400">
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
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
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

          {activeTab === 'paper' && (
            <TestPaperGenerator classes={data.classes || []} />
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
        </main>

        {/* Footer */}
        <footer className="app-footer-main relative border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 text-center text-slate-500 text-xs print:hidden">
          Al-Zia Science Academy • Online Management Portal
        </footer>

      </div>

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
