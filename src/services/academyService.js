import { db } from '../firebase/config';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';

const STORAGE_KEY = 'academy_app_data_v2';

// Standard Classes requested by Teacher/Admin
const DEFAULT_CLASSES = [
  { 
    id: 'cls-9th', 
    name: '9th', 
    subject: 'Class 9th Computer & Science',
    subjects: ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'English', 'Urdu', 'Islamiat', 'Tarjuma-tul-Quran']
  },
  { 
    id: 'cls-10th', 
    name: '10th', 
    subject: 'Class 10th Computer & Science',
    subjects: ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'English', 'Urdu', 'Pak Studies', 'Tarjuma-tul-Quran']
  },
  { 
    id: 'cls-11th', 
    name: '11th', 
    subject: 'Class 11th Computer Science',
    subjects: ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'English', 'Urdu', 'Islamic Education']
  },
  { 
    id: 'cls-12th', 
    name: '12th', 
    subject: 'Class 12th Computer Science',
    subjects: ['Physics', 'Chemistry', 'Math', 'Computer Science', 'Biology', 'English', 'Urdu', 'Pak Studies']
  },
  { 
    id: 'cls-boys', 
    name: 'Boys', 
    subject: 'Boys Special Batch',
    subjects: ['Physics', 'Chemistry', 'Math', 'Computer Science', 'English', 'Urdu']
  },
];

const DEFAULT_STUDENTS = [
  // Class 9th (4 Students)
  { id: 'std-1', classId: 'cls-9th', rollNo: '101', name: 'Ali Ahmed', fname: 'Muhammad Ahmed', fatherNumber: '+92 300 1234567' },
  { id: 'std-2', classId: 'cls-9th', rollNo: '102', name: 'Hamza Khan', fname: 'Tariq Khan', fatherNumber: '+92 301 2345678' },
  { id: 'std-3', classId: 'cls-9th', rollNo: '103', name: 'Zainab Fatima', fname: 'Ghulam Hussain', fatherNumber: '+92 300 8765432' },
  { id: 'std-4', classId: 'cls-9th', rollNo: '104', name: 'Abdullah Shah', fname: 'Syed Shah', fatherNumber: '+92 312 9876543' },

  // Class 10th (3 Students)
  { id: 'std-5', classId: 'cls-10th', rollNo: '201', name: 'Usman Ghani', fname: 'Abdul Ghani', fatherNumber: '+92 302 3456789' },
  { id: 'std-6', classId: 'cls-10th', rollNo: '202', name: 'Ayesha Bibi', fname: 'Muhammad Rafiq', fatherNumber: '+92 333 4567891' },
  { id: 'std-7', classId: 'cls-10th', rollNo: '203', name: 'Muhammad Omer', fname: 'Farooq Ahmed', fatherNumber: '+92 321 6543210' },

  // Class 11th (3 Students)
  { id: 'std-8', classId: 'cls-11th', rollNo: '301', name: 'Bilal Hassan', fname: 'Hassan Raza', fatherNumber: '+92 303 4567890' },
  { id: 'std-9', classId: 'cls-11th', rollNo: '302', name: 'Mariam Tariq', fname: 'Tariq Mehmood', fatherNumber: '+92 345 7890123' },
  { id: 'std-10', classId: 'cls-11th', rollNo: '303', name: 'Hassan Ali', fname: 'Liaquat Ali', fatherNumber: '+92 306 1122334' },

  // Class 12th & Boys (4 Students)
  { id: 'std-11', classId: 'cls-12th', rollNo: '401', name: 'Zaid Malik', fname: 'Malik Umar', fatherNumber: '+92 304 5678901' },
  { id: 'std-12', classId: 'cls-12th', rollNo: '402', name: 'Noor Fatima', fname: 'Rashid Ahmed', fatherNumber: '+92 307 2233445' },
  { id: 'std-13', classId: 'cls-12th', rollNo: '403', name: 'Shahzaib Khan', fname: 'Jahangir Khan', fatherNumber: '+92 313 5566778' },
  { id: 'std-14', classId: 'cls-boys', rollNo: '501', name: 'Saad Rashid', fname: 'Rashid Mahmood', fatherNumber: '+92 305 6789012' },
];

const DEFAULT_ATTENDANCE = {
  [`${new Date().toISOString().split('T')[0]}_cls-9th`]: {
    date: new Date().toISOString().split('T')[0],
    classId: 'cls-9th',
    records: { 'std-1': 'Present', 'std-2': 'Absent', 'std-3': 'Present', 'std-4': 'Late' }
  },
  [`${new Date().toISOString().split('T')[0]}_cls-10th`]: {
    date: new Date().toISOString().split('T')[0],
    classId: 'cls-10th',
    records: { 'std-5': 'Present', 'std-6': 'Present', 'std-7': 'Absent' }
  },
  [`${new Date().toISOString().split('T')[0]}_cls-11th`]: {
    date: new Date().toISOString().split('T')[0],
    classId: 'cls-11th',
    records: { 'std-8': 'Present', 'std-9': 'Present', 'std-10': 'Present' }
  },
  [`${new Date().toISOString().split('T')[0]}_cls-12th`]: {
    date: new Date().toISOString().split('T')[0],
    classId: 'cls-12th',
    records: { 'std-11': 'Present', 'std-12': 'Absent', 'std-13': 'Present' }
  }
};

const DEFAULT_TESTS = [
  {
    id: 'tst-1',
    classId: 'cls-9th',
    title: 'Computer Basics Test 1',
    subject: 'Computer Science',
    maxMarks: 50,
    date: '2026-08-05',
    month: '2026-08',
    scores: { 'std-1': 48, 'std-2': 42, 'std-3': 49, 'std-4': 38 }
  },
  {
    id: 'tst-2',
    classId: 'cls-10th',
    title: 'Physics Mechanics Quiz',
    subject: 'Physics',
    maxMarks: 100,
    date: '2026-08-10',
    month: '2026-08',
    scores: { 'std-5': 94, 'std-6': 88, 'std-7': 76 }
  },
  {
    id: 'tst-3',
    classId: 'cls-11th',
    title: 'Chemistry Organic Test',
    subject: 'Chemistry',
    maxMarks: 75,
    date: '2026-08-12',
    month: '2026-08',
    scores: { 'std-8': 70, 'std-9': 68, 'std-10': 62 }
  },
  {
    id: 'tst-4',
    classId: 'cls-12th',
    title: 'Mathematics Algebra & Calculus',
    subject: 'Math',
    maxMarks: 100,
    date: '2026-08-14',
    month: '2026-08',
    scores: { 'std-11': 98, 'std-12': 85, 'std-13': 91 }
  }
];

const DEFAULT_TIMETABLE = [
  { id: 'tt-1', time: '3:00 - 3:35', '9th': 'Bio/Comp (Combined 9th & 10th)', '10th': 'Bio/Comp (Combined 9th & 10th)', '11th': 'English', '12th': 'Math', 'boys': 'Urdu' },
  { id: 'tt-2', time: '3:35 - 4:10', '9th': 'Urdu', '10th': 'English', '11th': 'Math', '12th': 'Bio/Comp', 'boys': 'Physics' },
  { id: 'tt-3', time: '4:10 - 4:45', '9th': 'English', '10th': 'Urdu', '11th': 'Bio/Comp', '12th': 'Physics', 'boys': 'Math' },
  { id: 'tt-4', time: '4:45 - 5:20', '9th': 'Math', '10th': 'Physics', '11th': 'Urdu', '12th': 'English', 'boys': 'Bio/Comp' },
  { id: 'tt-5', time: '5:20 - 5:55', '9th': 'Chemistry', '10th': 'Math', '11th': 'Physics', '12th': 'Urdu', 'boys': 'English' },
  { id: 'tt-6', time: '5:55 - 6:30', '9th': 'Physics', '10th': 'Chemistry', '11th': 'Quran Pak', '12th': 'Chemistry', 'boys': 'Chemistry' }
];

const DEFAULT_RESOURCES = [
  {
    id: 'res-1',
    title: 'Class 9th Computer Science Complete Text Book',
    category: 'Book',
    classId: 'cls-9th',
    subject: 'Computer Science',
    fileName: '9th_Computer_Science_Book.pdf',
    fileUrl: '',
    date: '2026-08-16'
  },
  {
    id: 'res-2',
    title: 'Class 10th Physics Solved Numerical Notes',
    category: 'Notes',
    classId: 'cls-10th',
    subject: 'Physics',
    fileName: '10th_Physics_Notes.pdf',
    fileUrl: '',
    date: '2026-08-16'
  },
  {
    id: 'res-3',
    title: 'First Year Chemistry Top 100 Important MCQs',
    category: 'MCQs',
    classId: 'cls-11th',
    subject: 'Chemistry',
    fileName: '11th_Chemistry_MCQs.pdf',
    fileUrl: '',
    date: '2026-08-16'
  }
];

const DEFAULT_FEES = {
  [`2026-08_std-1`]: { month: '2026-08', studentId: 'std-1', monthlyFee: 2500, paidAmount: 2500, status: 'Paid', paidDate: '2026-08-05', paymentMethod: 'Cash' },
  [`2026-08_std-2`]: { month: '2026-08', studentId: 'std-2', monthlyFee: 2500, paidAmount: 0, status: 'Unpaid', paidDate: '', paymentMethod: '' },
  [`2026-08_std-3`]: { month: '2026-08', studentId: 'std-3', monthlyFee: 3000, paidAmount: 3000, status: 'Paid', paidDate: '2026-08-06', paymentMethod: 'EasyPaisa' },
  [`2026-08_std-4`]: { month: '2026-08', studentId: 'std-4', monthlyFee: 2500, paidAmount: 0, status: 'Unpaid', paidDate: '', paymentMethod: '' },
  [`2026-08_std-5`]: { month: '2026-08', studentId: 'std-5', monthlyFee: 3000, paidAmount: 3000, status: 'Paid', paidDate: '2026-08-02', paymentMethod: 'Cash' },
  [`2026-08_std-6`]: { month: '2026-08', studentId: 'std-6', monthlyFee: 3000, paidAmount: 3000, status: 'Paid', paidDate: '2026-08-04', paymentMethod: 'JazzCash' },
  [`2026-08_std-7`]: { month: '2026-08', studentId: 'std-7', monthlyFee: 3000, paidAmount: 0, status: 'Unpaid', paidDate: '', paymentMethod: '' },
  [`2026-08_std-8`]: { month: '2026-08', studentId: 'std-8', monthlyFee: 3500, paidAmount: 3500, status: 'Paid', paidDate: '2026-08-01', paymentMethod: 'Cash' },
  [`2026-08_std-9`]: { month: '2026-08', studentId: 'std-9', monthlyFee: 3500, paidAmount: 3500, status: 'Paid', paidDate: '2026-08-03', paymentMethod: 'Bank Transfer' },
  [`2026-08_std-10`]: { month: '2026-08', studentId: 'std-10', monthlyFee: 3500, paidAmount: 0, status: 'Unpaid', paidDate: '', paymentMethod: '' },
  [`2026-08_std-11`]: { month: '2026-08', studentId: 'std-11', monthlyFee: 4000, paidAmount: 4000, status: 'Paid', paidDate: '2026-08-01', paymentMethod: 'Cash' },
  [`2026-08_std-12`]: { month: '2026-08', studentId: 'std-12', monthlyFee: 4000, paidAmount: 0, status: 'Unpaid', paidDate: '', paymentMethod: '' },
  [`2026-08_std-13`]: { month: '2026-08', studentId: 'std-13', monthlyFee: 4000, paidAmount: 4000, status: 'Paid', paidDate: '2026-08-08', paymentMethod: 'Cash' },
  [`2026-08_std-14`]: { month: '2026-08', studentId: 'std-14', monthlyFee: 2500, paidAmount: 2500, status: 'Paid', paidDate: '2026-08-05', paymentMethod: 'Cash' }
};

const DEFAULT_FEEDBACKS = [
  {
    id: 'fb-1',
    studentName: 'Ali Ahmed',
    className: '9th',
    category: 'Study Material',
    comment: 'Please upload 9th class Physics solved numerical notes in PDF format.',
    date: '2026-08-16',
    status: 'Pending'
  },
  {
    id: 'fb-2',
    studentName: 'Usman Ghani',
    className: '10th',
    category: 'Timetable',
    comment: 'Is it possible to extend the computer practical lab time by 15 minutes?',
    date: '2026-08-16',
    status: 'Pending'
  }
];

const DEFAULT_NOTICES = [
  {
    id: `ntc-${Date.now()}`,
    createdAt: Date.now(),
    title: 'Monthly Test Series Starting Next Monday',
    category: 'Exam Notice',
    targetClass: 'All Classes',
    content: 'Monthly comprehensive tests for 9th, 10th, 11th, and 12th classes will begin from Monday 20th August. Attendance is mandatory.',
    date: '17 August',
    isPinned: true
  },
  {
    id: 'ntc-2',
    title: 'Academy Holiday Notice for Independence Day',
    category: 'Holiday Notice',
    targetClass: 'All Classes',
    content: 'Al-Zia Science Academy will remain closed on 14th August on account of Independence Day celebrations.',
    date: '14 August',
    isPinned: false
  }
];

const DEFAULT_FACULTY = [
  { id: 'fac-1', subject: 'Computer Science', teacher: 'Sir Haris Jabbar', education: 'BS Computer Science (BSCS - Gold Medalist)', experience: '6+ Years Board Specialist', classes: '9th, 10th, 11th, 12th' },
  { id: 'fac-2', subject: 'Physics', teacher: 'Prof. Malik Umar', education: 'M.Sc Physics (Gold Medalist)', experience: '10+ Years Board Examiner', classes: '9th, 10th, 11th, 12th' },
  { id: 'fac-3', subject: 'Chemistry', teacher: 'Sir Hassan Raza', education: 'M.Sc Applied Chemistry', experience: '7+ Years Teaching', classes: '9th, 10th, 11th, 12th' },
  { id: 'fac-4', subject: 'Mathematics', teacher: 'Prof. Abdul Ghani', education: 'M.Sc Mathematics', experience: '12+ Years Mathematics Specialist', classes: '9th, 10th, 11th, 12th' },
  { id: 'fac-5', subject: 'Biology', teacher: 'Dr. Ghulam Hussain', education: 'MBBS / M.Phil Biology', experience: '8+ Years Medical Prep Specialist', classes: '9th, 10th, 11th, 12th' },
  { id: 'fac-6', subject: 'English & Urdu', teacher: 'Sir Zaid Malik', education: 'M.A. English & Linguistics', experience: '5+ Years Senior Lecturer', classes: 'All Classes' }
];

const DEFAULT_AI_RULES = [
  {
    id: 'rule-1',
    category: 'Timings',
    keywords: 'timing, time, schedule, hours, wakt',
    response: '🕒 Al-Zia Science Academy Timings:\n• Evening Shift Only: 3:00 PM – 6:30 PM\n• Days: Monday to Saturday (Sunday Closed).'
  },
  {
    id: 'rule-2',
    category: 'Courses',
    keywords: 'class, course, subject, matric, fsc',
    response: '🎓 Classes & Subjects Offered:\n• Class 9th & 10th (Matric Science): Physics, Chemistry, Mathematics, Biology, Computer Science.\n• Class 11th & 12th (FSc Pre-Medical / Pre-Engineering / ICS): Physics, Chemistry, Biology, Mathematics, Computer.'
  },
  {
    id: 'rule-3',
    category: 'Fees',
    keywords: 'fee, fees, dues, paisa, cost',
    response: '💳 Fee Structure Information:\n• Monthly Tuition Fee ranges between Rs. 2,000 – Rs. 4,000 depending on Class level.\n• Fee receipts are generated monthly and can be paid via Cash, JazzCash, EasyPaisa, or Bank Transfer.'
  },
  {
    id: 'rule-4',
    category: 'Admissions',
    keywords: 'contact, admission, phone, address, location, number',
    response: '📞 Admissions & Contact Details:\n• Academy Name: Al-Zia Science Academy\n• Admissions Status: Admissions OPEN for Session 2026-2027!\n• Visit Us: Admin Office during Evening Shift (3:00 PM – 6:30 PM).'
  }
];

export const isFirebaseActive = () => {
  return true;
};

export const getInitialData = () => {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    let parsed = null;
    if (local) {
      try {
        parsed = JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }

    if (!Array.isArray(parsed.classes) || parsed.classes.length === 0) {
      parsed.classes = DEFAULT_CLASSES;
    } else {
      parsed.classes = parsed.classes.filter(Boolean).map(c => {
        if (!c || typeof c !== 'object') return DEFAULT_CLASSES[0];
        const defaultClass = DEFAULT_CLASSES.find(dc => dc && (dc.id === c.id || dc.name === c.name));
        return {
          ...c,
          id: c.id || `cls-${Date.now()}`,
          name: c.name || 'Class',
          subjects: Array.isArray(c.subjects) && c.subjects.length > 0 
            ? c.subjects 
            : (defaultClass?.subjects || ['Physics', 'Chemistry', 'Math', 'Computer Science', 'English', 'Urdu'])
        };
      });
    }

    if (!Array.isArray(parsed.students) || parsed.students.length === 0) {
      parsed.students = DEFAULT_STUDENTS;
    } else {
      parsed.students = parsed.students.filter(Boolean);
    }

    if (!Array.isArray(parsed.tests)) {
      parsed.tests = DEFAULT_TESTS;
    } else {
      parsed.tests = parsed.tests.filter(Boolean);
    }

    if (!Array.isArray(parsed.timetable)) {
      parsed.timetable = DEFAULT_TIMETABLE;
    } else {
      parsed.timetable = parsed.timetable.filter(Boolean);
    }

    if (!Array.isArray(parsed.resources)) {
      parsed.resources = DEFAULT_RESOURCES;
    } else {
      parsed.resources = parsed.resources.filter(Boolean);
    }

    if (!Array.isArray(parsed.feedbacks)) {
      parsed.feedbacks = DEFAULT_FEEDBACKS;
    } else {
      parsed.feedbacks = parsed.feedbacks.filter(Boolean);
    }

    if (!Array.isArray(parsed.notices)) {
      parsed.notices = DEFAULT_NOTICES;
    } else {
      parsed.notices = parsed.notices.filter(Boolean);
    }

    if (!Array.isArray(parsed.faculty)) {
      parsed.faculty = DEFAULT_FACULTY;
    } else {
      parsed.faculty = parsed.faculty.filter(Boolean);
    }

    if (!Array.isArray(parsed.aiRules)) {
      parsed.aiRules = DEFAULT_AI_RULES;
    } else {
      parsed.aiRules = parsed.aiRules.filter(Boolean);
    }

    if (!parsed.fees || typeof parsed.fees !== 'object') {
      parsed.fees = DEFAULT_FEES;
    }

    if (!parsed.attendance || typeof parsed.attendance !== 'object') {
      parsed.attendance = DEFAULT_ATTENDANCE;
    }

    return parsed;
  } catch (err) {
    console.error('Critical Error in getInitialData fallback to default:', err);
    return {
      classes: DEFAULT_CLASSES,
      students: DEFAULT_STUDENTS,
      attendance: DEFAULT_ATTENDANCE,
      tests: DEFAULT_TESTS,
      timetable: DEFAULT_TIMETABLE,
      resources: DEFAULT_RESOURCES,
      fees: DEFAULT_FEES,
      feedbacks: DEFAULT_FEEDBACKS,
      notices: DEFAULT_NOTICES,
    };
  }
};

export const saveLocalData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage quota exceeded. Sanitizing large file strings...', e);
    try {
      const sanitizedResources = (data.resources || []).map(r => ({
        ...r,
        fileUrl: r.fileUrl && r.fileUrl.length > 500000 ? '' : r.fileUrl
      }));
      const sanitizedData = { ...data, resources: sanitizedResources };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedData));
    } catch (err) {
      console.error('Critical localStorage error', err);
    }
  }
};

export const syncWithFirestore = async (collectionName, docId, data) => {
  if (isFirebaseActive() && db) {
    try {
      await setDoc(doc(db, collectionName, docId), data, { merge: true });
    } catch (error) {
      console.warn(`Firestore sync error on ${collectionName}/${docId}:`, error);
    }
  }
};

export const deleteFromFirestore = async (collectionName, docId) => {
  if (isFirebaseActive() && db) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.warn(`Firestore delete error on ${collectionName}/${docId}:`, error);
    }
  }
};

export const seedFirestoreData = async (currentData) => {
  if (isFirebaseActive() && db) {
    try {
      // Check if adminPin exists in Firestore; only seed if missing
      const pinSnap = await getDoc(doc(db, 'settings', 'adminPin'));
      if (!pinSnap.exists()) {
        const currentPin = localStorage.getItem('academy_admin_pin') || '1234';
        await setDoc(doc(db, 'settings', 'adminPin'), { pin: String(currentPin) }, { merge: true });
      }

      const snap = await getDocs(collection(db, 'students'));
      if (snap.empty) {
        console.log('Seeding initial data to Firestore database...');
        // Upload classes
        for (const cls of currentData.classes || DEFAULT_CLASSES) {
          await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
        }
        // Upload students
        for (const std of currentData.students || DEFAULT_STUDENTS) {
          await setDoc(doc(db, 'students', std.id), std, { merge: true });
        }
        // Upload tests
        for (const tst of currentData.tests || DEFAULT_TESTS) {
          await setDoc(doc(db, 'tests', tst.id), tst, { merge: true });
        }
        // Upload fees
        if (currentData.fees) {
          for (const [key, fee] of Object.entries(currentData.fees)) {
            await setDoc(doc(db, 'fees', key), fee, { merge: true });
          }
        }
        // Upload timetable
        for (const tt of currentData.timetable || DEFAULT_TIMETABLE) {
          await setDoc(doc(db, 'timetable', tt.id), tt, { merge: true });
        }
        // Upload notices
        for (const ntc of currentData.notices || DEFAULT_NOTICES) {
          await setDoc(doc(db, 'notices', ntc.id), ntc, { merge: true });
        }
        // Upload feedbacks
        for (const fb of currentData.feedbacks || DEFAULT_FEEDBACKS) {
          await setDoc(doc(db, 'feedbacks', fb.id), fb, { merge: true });
        }
      }
    } catch (err) {
      console.warn('Firestore seeding error:', err);
    }
  }
};

export const getFirestoreAdminPin = async () => {
  if (isFirebaseActive() && db) {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'adminPin'));
      if (docSnap.exists() && docSnap.data()?.pin) {
        return String(docSnap.data().pin);
      }
    } catch (e) {
      console.warn('Failed to fetch admin pin from Firestore', e);
    }
  }
  return null;
};

export const updateAdminPinInCloud = async (newPin) => {
  if (isFirebaseActive() && db) {
    try {
      await setDoc(doc(db, 'settings', 'adminPin'), { pin: String(newPin) }, { merge: true });
      console.log('Admin PIN successfully updated in Firebase Cloud:', newPin);
    } catch (e) {
      console.error('Failed to update Admin PIN in Cloud:', e);
    }
  }
};

export const subscribeToAdminPin = (callback) => {
  if (isFirebaseActive() && db) {
    return onSnapshot(doc(db, 'settings', 'adminPin'), (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.pin) {
        callback(String(docSnap.data().pin));
      }
    }, (error) => {
      console.warn('Admin PIN subscription error:', error);
    });
  }
  return () => {};
};

// ==========================================
// 🟢 Real-Time Presence / Online Users Tracker
// ==========================================

export const updatePresence = async (sessionId, deviceType = 'Desktop') => {
  if (!db || !sessionId || !isFirebaseActive()) return;
  try {
    const presenceDocRef = doc(db, 'presence', sessionId);
    await setDoc(presenceDocRef, {
      id: sessionId,
      lastActive: serverTimestamp(),
      device: deviceType,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn('Presence update failed:', e);
  }
};

export const removePresence = async (sessionId) => {
  if (!db || !sessionId || !isFirebaseActive()) return;
  try {
    const presenceDocRef = doc(db, 'presence', sessionId);
    await deleteDoc(presenceDocRef);
  } catch (e) {
    console.warn('Presence remove failed:', e);
  }
};

export const subscribeToPresence = (onUpdate) => {
  if (!db || !isFirebaseActive()) return () => {};
  try {
    const presenceColRef = collection(db, 'presence');
    return onSnapshot(presenceColRef, (snapshot) => {
      const activeSessions = [];
      const now = Date.now();
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const lastActiveTime = data.updatedAt || (data.lastActive?.toMillis ? data.lastActive.toMillis() : now);
        // Only show users active in the last 2 minutes
        if (now - lastActiveTime < 120000) {
          activeSessions.push(data);
        }
      });
      onUpdate(activeSessions);
    }, (error) => {
      console.warn('Presence subscription failed:', error);
    });
  } catch (e) {
    console.warn('Presence subscribe failed:', e);
    return () => {};
  }
};

export const cleanStalePresence = async () => {
  if (!db || !isFirebaseActive()) return;
  try {
    const presenceColRef = collection(db, 'presence');
    const qSnap = await getDocs(presenceColRef);
    const now = Date.now();
    const batch = writeBatch(db);
    let staleCount = 0;
    
    qSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const lastActiveTime = data.updatedAt || (data.lastActive?.toMillis ? data.lastActive.toMillis() : now);
      if (now - lastActiveTime > 180000) { // older than 3 minutes
        batch.delete(docSnap.ref);
        staleCount++;
      }
    });
    
    if (staleCount > 0) {
      await batch.commit();
      console.log(`Cleaned ${staleCount} stale presence sessions.`);
    }
  } catch (e) {
    console.warn('Stale presence cleanup failed:', e);
  }
};

export const subscribeToCollection = (collectionName, callback) => {
  if (!db) return () => {};
  try {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
      const itemsMap = new Map();
      snapshot.forEach(docSnap => {
        const itemData = { id: docSnap.id, ...docSnap.data() };
        itemsMap.set(docSnap.id, itemData);
      });
      callback(Array.from(itemsMap.values()));
    }, (error) => {
      console.warn(`Firestore subscription error on ${collectionName}:`, error);
    });
  } catch (e) {
    console.warn(`Subscribe to ${collectionName} failed:`, e);
    return () => {};
  }
};

