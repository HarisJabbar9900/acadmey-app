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
  }
];

const DEFAULT_STUDENTS = [];

const DEFAULT_ATTENDANCE = {};

const DEFAULT_TESTS = [];

export const DEFAULT_TIMETABLE = [
  { id: 'tt-1', time: '3:00 – 3:35 PM', '9th': 'Physics', '10th': 'Math', '11th': 'English', '12th': 'Urdu', boys: 'Computer' },
  { id: 'tt-2', time: '3:35 – 4:10 PM', '9th': 'Chemistry', '10th': 'Physics', '11th': 'Computer', '12th': 'English', boys: 'Urdu / Math' },
  { id: 'tt-3', time: '4:10 – 4:45 PM', '9th': 'Computer', '10th': 'English', '11th': 'Biology', '12th': 'Physics', boys: 'Chemistry' },
  { id: 'tt-4', time: '4:45 – 5:20 PM', '9th': 'Urdu', '10th': 'Chemistry', '11th': 'Physics', '12th': 'Computer / Biology', boys: 'English' },
  { id: 'tt-5', time: '5:20 – 5:55 PM', '9th': 'English', '10th': 'Urdu', '11th': 'Chemistry', '12th': 'Chem / Math', boys: 'Biology' },
  { id: 'tt-6', time: '5:55 – 6:30 PM', '9th': 'Math', '10th': 'Biology', '11th': 'Urdu', '12th': '-', boys: '-' }
];

const DEFAULT_RESOURCES = [];

const DEFAULT_FEES = {};

const DEFAULT_FEEDBACKS = [];

const DEFAULT_NOTICES = [];

export const DEFAULT_FACULTY = [];

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
      parsed.classes = parsed.classes
        .filter(c => c && c.id !== 'cls-boys' && c.name?.trim().toLowerCase() !== 'boys')
        .map(c => {
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

    // Auto-purge any dummy / mock data previously stored in localStorage
    const hasDummyStudents = Array.isArray(parsed.students) && parsed.students.some(s => s && (s.id === 'std-1' || s.id === 'std-2' || s.name === 'Ali Ahmed'));
    const hasDummyTests = Array.isArray(parsed.tests) && parsed.tests.some(t => t && (t.id === 'tst-1' || t.title === 'Computer Basics Test 1'));
    const hasDummyResources = Array.isArray(parsed.resources) && parsed.resources.some(r => r && (r.id === 'res-1' || r.title?.includes('Class 9th Computer Science Complete Text Book')));
    const hasDummyNotices = Array.isArray(parsed.notices) && parsed.notices.some(n => n && (n.id === 'ntc-2' || n.title?.includes('Monthly Test Series Starting Next Monday')));
    const hasDummyFeedbacks = Array.isArray(parsed.feedbacks) && parsed.feedbacks.some(f => f && (f.id === 'fb-1' || f.studentName === 'Ali Ahmed'));

    if (hasDummyStudents || hasDummyTests || hasDummyResources || hasDummyNotices || hasDummyFeedbacks) {
      parsed.students = [];
      parsed.tests = [];
      parsed.attendance = {};
      parsed.fees = {};
      parsed.resources = [];
      parsed.feedbacks = [];
      parsed.notices = [];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {}
    }

    if (!Array.isArray(parsed.students)) {
      parsed.students = [];
    } else {
      parsed.students = parsed.students.filter(s => s && s.classId !== 'cls-boys' && s.id !== 'std-1' && s.id !== 'std-2');
    }

    if (!Array.isArray(parsed.tests)) {
      parsed.tests = [];
    } else {
      parsed.tests = parsed.tests.filter(t => t && t.id !== 'tst-1' && t.id !== 'tst-2');
    }

    const isStaleTimetable = !Array.isArray(parsed.timetable) || 
      parsed.timetable.length === 0 || 
      parsed.timetable.some(t => !t || !t.boys || t.boys === 'Subject' || JSON.stringify(t).includes('Combined') || JSON.stringify(t).toLowerCase().includes('jalab'));

    if (isStaleTimetable) {
      parsed.timetable = DEFAULT_TIMETABLE;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {}
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
      parsed.faculty = [];
    } else {
      parsed.faculty = parsed.faculty.filter(f => f && !['fac-1', 'fac-2', 'fac-3', 'fac-4', 'fac-5', 'fac-6'].includes(f.id));
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
      faculty: [],
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

export const purgeAllDummyDataFromCloud = async () => {
  if (!isFirebaseActive() || !db) return;
  try {
    const collectionsToClear = ['students', 'tests', 'resources', 'feedbacks', 'notices'];
    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
    }
    await setDoc(doc(db, 'settings', 'attendance'), { map: {} }, { merge: true });
    await setDoc(doc(db, 'settings', 'fees'), { map: {} }, { merge: true });
    await setDoc(doc(db, 'settings', 'timetable'), { schedule: DEFAULT_TIMETABLE }, { merge: true });
    return true;
  } catch (err) {
    console.warn('purgeAllDummyDataFromCloud error:', err);
    return false;
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

export const subscribeToMapCollection = (collectionName, callback) => {
  if (!db) return () => {};
  try {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
      const mapObj = {};
      snapshot.forEach(docSnap => {
        mapObj[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });
      callback(mapObj);
    }, (error) => {
      console.warn(`Firestore map subscription error on ${collectionName}:`, error);
    });
  } catch (e) {
    console.warn(`Subscribe to map ${collectionName} failed:`, e);
    return () => {};
  }
};

export const subscribeToDoc = (collectionName, docId, callback) => {
  if (!db) return () => {};
  try {
    return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    }, (error) => {
      console.warn(`Firestore doc subscription error on ${collectionName}/${docId}:`, error);
    });
  } catch (e) {
    console.warn(`Subscribe to doc ${collectionName}/${docId} failed:`, e);
    return () => {};
  }
};

export const fetchCloudData = async () => {
  if (!isFirebaseActive() || !db) return null;
  try {
    const cloudData = {};

    // 1. Tests
    const testsSnap = await getDocs(collection(db, 'tests'));
    if (!testsSnap.empty) {
      cloudData.tests = [];
      testsSnap.forEach(d => cloudData.tests.push({ id: d.id, ...d.data() }));
    }

    // 2. Students
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (!studentsSnap.empty) {
      cloudData.students = [];
      studentsSnap.forEach(d => cloudData.students.push({ id: d.id, ...d.data() }));
    }

    // 3. Classes
    const classesSnap = await getDocs(collection(db, 'classes'));
    if (!classesSnap.empty) {
      cloudData.classes = [];
      classesSnap.forEach(d => cloudData.classes.push({ id: d.id, ...d.data() }));
    }

    // 4. Notices
    const noticesSnap = await getDocs(collection(db, 'notices'));
    if (!noticesSnap.empty) {
      cloudData.notices = [];
      noticesSnap.forEach(d => cloudData.notices.push({ id: d.id, ...d.data() }));
    }

    // 5. Attendance
    const attSnap = await getDocs(collection(db, 'attendance'));
    if (!attSnap.empty) {
      cloudData.attendance = {};
      attSnap.forEach(d => { cloudData.attendance[d.id] = { id: d.id, ...d.data() }; });
    }

    // 6. Fees
    const feesSnap = await getDocs(collection(db, 'fees'));
    if (!feesSnap.empty) {
      cloudData.fees = {};
      feesSnap.forEach(d => { cloudData.fees[d.id] = { id: d.id, ...d.data() }; });
    }

    // 7. Resources
    const resSnap = await getDocs(collection(db, 'resources'));
    if (!resSnap.empty) {
      cloudData.resources = [];
      resSnap.forEach(d => cloudData.resources.push({ id: d.id, ...d.data() }));
    }

    // 8. Feedbacks
    const fbSnap = await getDocs(collection(db, 'feedbacks'));
    if (!fbSnap.empty) {
      cloudData.feedbacks = [];
      fbSnap.forEach(d => cloudData.feedbacks.push({ id: d.id, ...d.data() }));
    }

    // 9. Timetable
    const ttSnap = await getDoc(doc(db, 'settings', 'timetable'));
    if (ttSnap.exists() && Array.isArray(ttSnap.data()?.schedule)) {
      cloudData.timetable = ttSnap.data().schedule;
    }

    // 10. Faculty
    const facSnap = await getDoc(doc(db, 'settings', 'faculty'));
    if (facSnap.exists() && Array.isArray(facSnap.data()?.list)) {
      cloudData.faculty = facSnap.data().list;
    }

    return cloudData;
  } catch (e) {
    console.warn('fetchCloudData warning:', e);
    return null;
  }
};

export const syncAllDataToCloud = async (currentData) => {
  if (!isFirebaseActive() || !db || !currentData) return;
  try {
    // 1. Sync tests
    if (Array.isArray(currentData.tests) && currentData.tests.length > 0) {
      for (const tst of currentData.tests) {
        if (tst?.id) {
          await setDoc(doc(db, 'tests', tst.id), tst, { merge: true });
        }
      }
    }
    // 2. Sync students
    if (Array.isArray(currentData.students) && currentData.students.length > 0) {
      for (const std of currentData.students) {
        if (std?.id) {
          await setDoc(doc(db, 'students', std.id), std, { merge: true });
        }
      }
    }
    // 3. Sync classes
    if (Array.isArray(currentData.classes) && currentData.classes.length > 0) {
      for (const cls of currentData.classes) {
        if (cls?.id) {
          await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
        }
      }
    }
    // 4. Sync notices
    if (Array.isArray(currentData.notices) && currentData.notices.length > 0) {
      for (const ntc of currentData.notices) {
        if (ntc?.id) {
          await setDoc(doc(db, 'notices', ntc.id), ntc, { merge: true });
        }
      }
    }
    // 5. Sync attendance
    if (currentData.attendance && typeof currentData.attendance === 'object') {
      for (const [key, record] of Object.entries(currentData.attendance)) {
        if (key && record) {
          await setDoc(doc(db, 'attendance', key), record, { merge: true });
        }
      }
    }
    // 6. Sync fees
    if (currentData.fees && typeof currentData.fees === 'object') {
      for (const [key, fee] of Object.entries(currentData.fees)) {
        if (key && fee) {
          await setDoc(doc(db, 'fees', key), fee, { merge: true });
        }
      }
    }
    // 7. Sync resources
    if (Array.isArray(currentData.resources) && currentData.resources.length > 0) {
      for (const res of currentData.resources) {
        if (res?.id) {
          await setDoc(doc(db, 'resources', res.id), res, { merge: true });
        }
      }
    }
    // 8. Sync timetable
    if (Array.isArray(currentData.timetable) && currentData.timetable.length > 0) {
      await setDoc(doc(db, 'settings', 'timetable'), { schedule: currentData.timetable }, { merge: true });
    }
    // 9. Sync faculty
    if (Array.isArray(currentData.faculty)) {
      await setDoc(doc(db, 'settings', 'faculty'), { list: currentData.faculty }, { merge: true });
    }
  } catch (err) {
    console.warn('syncAllDataToCloud error:', err);
  }
};

