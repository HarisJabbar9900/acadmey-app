import { db, storage } from '../firebase/config';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

export const DEFAULT_NOTICES = [
  {
    id: 'ntc-oct-testing-2026',
    createdAt: Date.now(),
    title: 'یکم اکتوبر سے تمام کلاسز کے سلیبس ٹیسٹ کا باقاعدہ آغاز',
    englishTitle: 'Commencement of Monthly Syllabus Tests for All Classes from 1st October',
    category: 'Exam Notice',
    targetClass: 'All Classes (9th, 10th, 11th, 12th)',
    urduLead: 'تمام طلباء و طالبات کو باقاعدہ مطلع کیا جاتا ہے کہ یکم اکتوبر (1st October) سے اکیڈمی کی تمام کلاسز (9th, 10th, 11th, 12th) کے مکمل سلیبس کے مطابق ماہانہ ٹیسٹ سیشن کا باضابطہ آغاز کیا جا رہا ہے۔',
    instructions: [
      {
        title: 'سلیبس و روزانہ شیڈول',
        text: 'تمام طلباء اپنے روزانہ کے ٹائم ٹیبل اور اساتذہ کے دیے گئے سلیبس کے مطابق مکمل تیاری کے ساتھ کلاس میں تشریف لائیں۔'
      },
      {
        title: '100% لازمی حاضری',
        text: 'ٹیسٹ سیشن کے دوران کسی قسم کی غیر حاضری قبول نہیں کی جائے گی۔ تمام طلباء بروقت اکیڈمی پہنچیں۔'
      },
      {
        title: 'آن لائن رزلٹ و رپورٹ کارڈز',
        text: 'ہر ٹیسٹ کے نمبرز فوری طور پر پورٹل میں درج ہوں گے اور ماہانہ پرفارمنس رپورٹ کارڈز والدین کو جاری کیے جائیں گے۔'
      }
    ],
    englishNote: 'Monthly syllabus evaluation & testing series for all classes (9th, 10th, 11th, 12th) commences from 1st October 2026. All students are advised to prepare thoroughly and maintain regular attendance.',
    content: 'تمام طلباء و طالبات کو مطلع کیا جاتا ہے کہ یکم اکتوبر (1st October) سے اکیڈمی کی تمام کلاسز (9th, 10th, 11th, 12th) کے باقاعدہ سلیبس ٹیسٹ کا سلسلہ شروع ہو رہا ہے۔\n\n📌 ضروری ہدایات برائے طلباء:\n1. تمام اسٹوڈنٹس روزانہ کے ٹائم ٹیبل اور سبجیکٹ سلیبس کے مطابق مکمل تیاری کے ساتھ تشریف لائیں۔\n2. ٹیسٹ سیشن کے دوران 100% حاضری لازمی ہے۔\n3. ٹیسٹ رزلٹ اور مارکس باقاعدگی سے پورٹل پر اپڈیٹ ہوں گے اور والدین کو رپورٹ کارڈ جاری کیے جائیں گے۔\n\nAll students are hereby notified that comprehensive syllabus testing will officially start from 1st October across all classes. Ensure 100% attendance and diligent preparation.',
    date: '18 September 2026',
    startDate: '1 October 2026',
    isPinned: true
  }
];

export const DEFAULT_FACULTY = [
  {
    id: 'teacher-1789495282064',
    teacher: 'Sir Muhammad Irfan',
    subject: 'Mathematics',
    classes: '9th, 10th, 11th, 12th',
    education: 'BS. Mathematics',
    experience: '6+ Years Experience',
    phone: ''
  },
  {
    id: 'teacher-1789495724706',
    teacher: 'Sir Zain Ul Abideen',
    subject: 'Biology',
    classes: '9th, 10th, 11th, 12th',
    education: 'BS Botany',
    experience: '5+ Years Experience',
    phone: ''
  },
  {
    id: 'teacher-1789495847287',
    teacher: 'Sir Malik Rafiq Ahmad',
    subject: 'English',
    classes: '9th, 10th, 11th, 12th',
    education: 'M.A. English',
    experience: 'Senior Lecturer',
    phone: ''
  },
  {
    id: 'teacher-1789495966052',
    teacher: 'Sir Abdul Shakoor',
    subject: 'Urdu',
    classes: '9th, 10th, 11th, 12th',
    education: 'M.A. Arabic, Lughat',
    experience: 'Senior Lecturer',
    phone: ''
  },
  {
    id: 'teacher-1789496022091',
    teacher: 'Sir Najeeb-ullah Bhatti',
    subject: 'Physics',
    classes: '9th, 10th, 11th, 12th',
    education: 'M.Sc. Physics, B.Ed',
    experience: '7+ Years Experience',
    phone: ''
  },
  {
    id: 'teacher-1789496157585',
    teacher: 'Sir Zia-ur-Rehman Qureshi',
    subject: 'اسلامیات + ترجمتہ القرآن + مطالعہ پاکستان',
    classes: '9th, 10th, 11th, 12th',
    education: 'M.A., B.Ed.',
    experience: 'Director & Senior Lecturer',
    phone: '0334-6683236'
  },
  {
    id: 'teacher-1789496312508',
    teacher: 'Sir Ijaz',
    subject: 'Chemistry',
    classes: '9th, 10th, 11th, 12th',
    education: 'M.Phil. Chemistry',
    experience: '4+ Years Experience',
    phone: ''
  },
  {
    id: 'teacher-1789565664938',
    teacher: 'Sir Haris Ali',
    subject: 'Computer science',
    classes: '9th, 10th, 11th, 12th',
    education: 'BS Computer Science',
    experience: '1+ Year Experience',
    phone: ''
  }
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

    if (!Array.isArray(parsed.notices) || parsed.notices.length === 0) {
      parsed.notices = DEFAULT_NOTICES;
    } else {
      parsed.notices = parsed.notices.filter(Boolean);
      if (!parsed.notices.some(n => n && n.id === 'ntc-oct-testing-2026')) {
        parsed.notices = [...DEFAULT_NOTICES, ...parsed.notices];
      }
    }

    const mockNames = ['haris jabbar', 'malik umar', 'hassan raza', 'abdul ghani', 'ghulam hussain', 'zaid malik'];
    if (Array.isArray(parsed.faculty)) {
      const cleanList = parsed.faculty.filter(f => {
        if (!f || !f.teacher) return false;
        const lower = f.teacher.toLowerCase();
        return !mockNames.some(m => lower.includes(m)) && !['fac-1', 'fac-2', 'fac-3', 'fac-4', 'fac-5', 'fac-6'].includes(f.id);
      });
      parsed.faculty = cleanList.length > 0 ? cleanList : DEFAULT_FACULTY;
    } else {
      parsed.faculty = DEFAULT_FACULTY;
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
      faculty: DEFAULT_FACULTY,
    };
  }
};

// --- IndexedDB for Heavy PDF & Material Files (50MB+ without LocalStorage quota issues) ---
const IDB_NAME = 'alzia_academy_storage';
const IDB_VERSION = 1;
const IDB_STORE = 'study_materials';

const openIDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const dbInstance = e.target.result;
      if (!dbInstance.objectStoreNames.contains(IDB_STORE)) {
        dbInstance.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const saveFileToIndexedDB = async (fileId, fileBlobOrData, fileName) => {
  try {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({ id: fileId, data: fileBlobOrData, name: fileName, timestamp: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
    return false;
  }
};

export const getFileFromIndexedDB = async (fileId) => {
  try {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(fileId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB get failed:', err);
    return null;
  }
};

export const deleteFileFromIndexedDB = async (fileId) => {
  try {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.delete(fileId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
    return false;
  }
};

// --- Google Drive & Cloud Link Auto-Resolver ---
export const parseDriveOrCloudUrl = (rawUrl = '') => {
  if (!rawUrl || typeof rawUrl !== 'string') return { viewUrl: '', downloadUrl: '', isGoogleDrive: false };
  const trimmed = rawUrl.trim();

  // Match Google Drive links
  // e.g. https://drive.google.com/file/d/1A2B3C/view?usp=sharing
  // or https://drive.google.com/open?id=1A2B3C
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = (driveFileMatch && driveFileMatch[1]) || (driveIdMatch && driveIdMatch[1]);

  if (fileId) {
    return {
      viewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
      isGoogleDrive: true,
      fileId
    };
  }

  // Dropbox direct link
  if (trimmed.includes('dropbox.com')) {
    return {
      viewUrl: trimmed.replace(/[?&]dl=1/, '?dl=0'),
      downloadUrl: trimmed.replace(/[?&]dl=0/, '?dl=1'),
      isDropbox: true
    };
  }

  return {
    viewUrl: trimmed,
    downloadUrl: trimmed,
    isStandard: true
  };
};

// --- Study Material Upload Handler (Firebase Storage with IndexedDB Fallback) ---
export const uploadStudyMaterialFile = async (file, resourceId) => {
  if (!file) throw new Error('No file selected.');

  // 1. Try Firebase Storage if active
  if (storage) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `materials/${resourceId}_${sanitizedName}`);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/pdf'
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      if (downloadUrl) {
        // Also cache in IndexedDB for instant offline access
        await saveFileToIndexedDB(resourceId, file, file.name);
        return {
          success: true,
          url: downloadUrl,
          fileName: file.name,
          source: 'cloud'
        };
      }
    } catch (storageErr) {
      console.warn('Firebase Storage upload failed, falling back to IndexedDB:', storageErr);
    }
  }

  // 2. Fallback: Save to IndexedDB (supports 100MB+ files smoothly)
  try {
    await saveFileToIndexedDB(resourceId, file, file.name);
    return {
      success: true,
      url: `idb://${resourceId}`,
      fileName: file.name,
      source: 'local_indexeddb'
    };
  } catch (idbErr) {
    console.error('IndexedDB storage failure:', idbErr);
    throw new Error('Failed to store file locally. Please try a Google Drive link.');
  }
};

// --- Robust File Downloader for PDF / Material Files ---
export const triggerFileDownload = async (fileUrl, fileName = 'document.pdf', resourceId = null) => {
  // 1. Check IndexedDB first if resourceId exists or if URL is idb://
  if (resourceId || (fileUrl && fileUrl.startsWith('idb://'))) {
    const targetId = resourceId || fileUrl.replace('idb://', '');
    const idbItem = await getFileFromIndexedDB(targetId);
    if (idbItem && idbItem.data) {
      const blob = idbItem.data instanceof Blob
        ? idbItem.data
        : new Blob([idbItem.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || idbItem.name || 'study-material.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return true;
    }
  }

  // 2. Base64 Data URL
  if (fileUrl && fileUrl.startsWith('data:')) {
    try {
      const parts = fileUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'study-material.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return true;
    } catch (err) {
      console.warn('Data URL download error:', err);
    }
  }

  // 3. Google Drive Link
  const parsed = parseDriveOrCloudUrl(fileUrl);
  if (parsed.isGoogleDrive) {
    window.open(parsed.downloadUrl, '_blank', 'noopener,noreferrer');
    return true;
  }

  // 4. Standard HTTPS URL
  if (fileUrl && fileUrl.startsWith('http')) {
    try {
      // Attempt blob fetch to force download prompt
      const response = await fetch(fileUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        return true;
      }
    } catch {
      // Fallback: Open in new window if CORS forbids direct fetch
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return true;
    }
  }

  if (fileUrl) {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
    return true;
  }

  throw new Error('No valid file link found.');
};

export const saveLocalData = (data) => {
  try {
    // Strip giant base64 or heavy blob URLs before saving to localStorage to prevent QuotaExceededError
    const safeResources = (data.resources || []).map(r => {
      const isHuge = r.fileUrl && (r.fileUrl.startsWith('data:') && r.fileUrl.length > 50000);
      return isHuge ? { ...r, fileUrl: `idb://${r.id}`, hasLocalFile: true } : r;
    });
    const safeData = { ...data, resources: safeResources };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
  } catch (e) {
    console.warn('LocalStorage quota warning:', e);
    try {
      const minimalResources = (data.resources || []).map(r => ({
        ...r,
        fileUrl: r.fileUrl && r.fileUrl.startsWith('http') ? r.fileUrl : `idb://${r.id}`
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, resources: minimalResources }));
    } catch (err) {
      console.error('Critical localStorage save error:', err);
    }
  }
};

export const syncWithFirestore = async (collectionName, docId, data) => {
  if (isFirebaseActive() && db) {
    try {
      // Guard: Firestore document size limit is 1MB. Do NOT send giant base64 strings.
      let payload = data;
      if (collectionName === 'resources' && data.fileUrl && data.fileUrl.startsWith('data:') && data.fileUrl.length > 300000) {
        payload = { ...data, fileUrl: '' };
      }
      await setDoc(doc(db, collectionName, docId), payload, { merge: true });
    } catch (error) {
      console.warn(`Firestore sync error on ${collectionName}/${docId}:`, error);
    }
  }
};

export const deleteFromFirestore = async (collectionName, docId) => {
  if (isFirebaseActive() && db) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      if (collectionName === 'resources') {
        await deleteFileFromIndexedDB(docId);
      }
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

