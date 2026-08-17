import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import Timetable from './components/Timetable';
import FeeManager from './components/FeeManager';
import StudyMaterial from './components/StudyMaterial';
import AttendanceSheet from './components/AttendanceSheet';
import MarksLedger from './components/MarksLedger';
import ClassStudentManager from './components/ClassStudentManager';
import StudentFeedback from './components/StudentFeedback';
import NoticeBoard from './components/NoticeBoard';
import { 
  getInitialData, 
  saveLocalData, 
  syncWithFirestore, 
  deleteFromFirestore,
  seedFirestoreData,
  getFirestoreAdminPin,
  updateAdminPinInCloud,
  subscribeToAdminPin
} from './services/academyService';

export default function App() {
  const [data, setData] = useState(getInitialData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Global Admin PIN State (Synced with localStorage & Firebase Cloud)
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('academy_admin_pin') || '1234';
  });

  const handleUpdateAdminPin = (newPin) => {
    const stringPin = String(newPin);
    setAdminPin(stringPin);
    localStorage.setItem('academy_admin_pin', stringPin);
    updateAdminPinInCloud(stringPin);
  };

  // Auto-seed existing student data & subscribe to real-time Admin PIN from Firestore
  useEffect(() => {
    seedFirestoreData(data);
    
    // Subscribe to real-time cloud PIN changes
    const unsubscribePin = subscribeToAdminPin(remotePin => {
      if (remotePin) {
        setAdminPin(String(remotePin));
        localStorage.setItem('academy_admin_pin', String(remotePin));
      }
    });

    return () => {
      if (unsubscribePin) unsubscribePin();
    };
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
    setData(prev => ({
      ...prev,
      classes: [...prev.classes, newClass]
    }));

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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 dark-mode' : 'bg-slate-100 text-slate-900 light-mode'
    } flex flex-col font-sans selection:bg-indigo-500 selection:text-white`}>
      
      {/* Background Subtle Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className={`absolute -top-40 -left-40 w-96 h-96 ${theme === 'dark' ? 'bg-indigo-600/15' : 'bg-indigo-500/10'} rounded-full blur-3xl`} />
        <div className={`absolute top-1/3 -right-40 w-96 h-96 ${theme === 'dark' ? 'bg-purple-600/15' : 'bg-purple-500/10'} rounded-full blur-3xl`} />
      </div>

      {/* Top Navbar */}
      <div className="app-navbar-main print:hidden">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          classes={data.classes}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          isAdminLoggedIn={isAdminLoggedIn}
          setIsAdminLoggedIn={setIsAdminLoggedIn}
          theme={theme}
          toggleTheme={toggleTheme}
          adminPin={adminPin}
          onUpdateAdminPin={handleUpdateAdminPin}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
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
      </main>

      {/* Footer */}
      <footer className="app-footer-main relative z-10 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 text-center text-slate-500 text-xs print:hidden">
        Al-Zia Science Academy • Online Management Portal
      </footer>

    </div>
  );
}
