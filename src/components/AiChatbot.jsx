import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  User, 
  HelpCircle, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Search, 
  Phone, 
  GraduationCap,
  MessageSquare,
  UserCheck,
  Edit3,
  Check,
  Plus,
  Trash2,
  Settings,
  Sliders
} from 'lucide-react';

import { DEFAULT_FACULTY } from '../services/academyService';

export default function AiChatbot({ data, isAdminLoggedIn, onUpdateFaculty, onUpdateAiRules }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isAiRulesModalOpen, setIsAiRulesModalOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef(null);

  const defaultFaculty = DEFAULT_FACULTY;

  const defaultAiRules = [
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

  const [facultyList, setFacultyList] = useState(data?.faculty || defaultFaculty);
  const [aiRulesList, setAiRulesList] = useState(data?.aiRules || defaultAiRules);

  useEffect(() => {
    if (data?.faculty && Array.isArray(data.faculty)) {
      setFacultyList(data.faculty);
    }
  }, [data?.faculty]);

  useEffect(() => {
    if (data?.aiRules && Array.isArray(data.aiRules)) {
      setAiRulesList(data.aiRules);
    }
  }, [data?.aiRules]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Assalamu Alaikum! Welcome to Al-Zia Science Academy AI Assistant 🎓. How can I help you today? You can ask about academy timings, admissions, courses, faculty teachers, or fee structures!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    { label: '👨‍🏫 Teachers', text: 'Who teaches Computer Science and other subjects?' },
    { label: '🕒 Timings', text: 'What are the academy timings?' },
    { label: '🎓 Courses', text: 'Which classes and subjects are offered?' },
    { label: '💳 Fee Info', text: 'What is the monthly fee structure?' },
    { label: '📞 Contact', text: 'How can I contact admin for admission?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  // AI Knowledge Base & Response Engine
  const generateBotReply = (userQuery) => {
    const query = userQuery.toLowerCase().trim();
    const cleanQuery = query.replace(/[?.,!/\\()_#\-"':;]/g, ' ');
    const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

    // 1. Get real active faculty from academy database (using authentic teachers only)
    const mockNames = ['haris jabbar', 'malik umar', 'hassan raza', 'abdul ghani', 'ghulam hussain', 'zaid malik'];
    const sanitizeFaculty = (list) => {
      if (!Array.isArray(list) || list.length === 0) return DEFAULT_FACULTY;
      const filtered = list.filter(f => {
        if (!f || !f.teacher) return false;
        const lower = f.teacher.toLowerCase();
        return !mockNames.some(m => lower.includes(m)) && !['fac-1', 'fac-2', 'fac-3', 'fac-4', 'fac-5', 'fac-6'].includes(f.id);
      });
      return filtered.length > 0 ? filtered : DEFAULT_FACULTY;
    };
    const effectiveFaculty = sanitizeFaculty(data?.faculty || facultyList);
    const currentRules = data?.aiRules || aiRulesList;

    // Subject dictionary with safe whole-word aliases (prevents "physics" matching "cs")
    const subjectAliases = {
      'computer': ['computer', 'computer science', 'comp', 'computers', 'coding', 'programming'],
      'physics': ['physics', 'phy', 'fiziks', 'tabiyat'],
      'chemistry': ['chemistry', 'chem', 'kemistry', 'kimiya'],
      'mathematics': ['mathematics', 'math', 'maths', 'riyazi', 'algebra'],
      'biology': ['biology', 'bio', 'botany', 'zoology', 'medical'],
      'english': ['english', 'eng', 'angrezi', 'grammar'],
      'urdu': ['urdu'],
      'islamiat': ['islamiat', 'islamiyat', 'islamic education', 'islam'],
      'pak studies': ['pak studies', 'pak study', 'pakistan studies', 'mutalia pakistan'],
      'tarjuma': ['tarjuma', 'quran', 'tarjuma-tul-quran', 'tarjumatul quran']
    };

    // 2. CHECK GENERAL "WHO TEACHES WHAT / KON KIA PERHATA HY" QUERY
    const isGeneralTeacherQuery = 
      query.includes('kon kia') || 
      query.includes('kon kya') || 
      query.includes('kon kon') ||
      query.includes('who teach') || 
      query.includes('who is teaching') ||
      query.includes('perhata') || 
      query.includes('parhata') || 
      query.includes('parhate') ||
      query.includes('perhate') ||
      query.includes('padhata') ||
      query.includes('padhate') ||
      query.includes('teacher') || 
      query.includes('teachers') || 
      query.includes('faculty') || 
      query.includes('staff') || 
      query.includes('asatza') || 
      query.includes('asateza') ||
      query.includes('ustad');

    // Check if query is about a specific subject
    const hasSpecificSubject = Object.keys(subjectAliases).some(sub => cleanQuery.includes(sub) || queryWords.includes(sub));
    
    // Dynamically extract teacher names from active faculty list (no hardcoding)
    const dynamicTeacherWords = [];
    effectiveFaculty.forEach(fac => {
      const parts = (fac.teacher || '').toLowerCase().replace(/[()&,.-]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !['sir', 'prof', 'doctor', 'mr', 'mrs'].includes(w));
      dynamicTeacherWords.push(...parts);
    });
    const hasSpecificTeacher = dynamicTeacherWords.some(name => queryWords.includes(name) || cleanQuery.includes(name));

    // If query is specifically "kon kia perhata hy" or "teachers list" without a specific subject or teacher name
    if (isGeneralTeacherQuery && !hasSpecificSubject && !hasSpecificTeacher) {
      if (effectiveFaculty.length > 0) {
        const listText = effectiveFaculty.map((fac, i) => {
          const subLower = (fac.subject || '').toLowerCase();
          const icon = subLower.includes('physics') ? '🔬' 
            : subLower.includes('chem') ? '🧪'
            : subLower.includes('math') ? '📐'
            : subLower.includes('bio') ? '🧬'
            : subLower.includes('computer') ? '💻'
            : subLower.includes('english') || subLower.includes('urdu') ? '📖'
            : subLower.includes('director') || subLower.includes('admin') ? '🏫'
            : '👨‍🏫';

          return `${i + 1}. ${icon} ${fac.subject}: ${fac.teacher}
   • Qualification: ${fac.education || 'Subject Specialist'}
   • Classes: ${fac.classes || '9th, 10th, 11th, 12th'}${fac.phone ? `\n   • Contact / رابطہ: ${fac.phone}` : ''}`;
        }).join('\n\n');

        return `👨‍🏫 Al-Zia Science Academy - اساتذہ کرام اور ان کے مضامین (Who Teaches What):\n\n${listText}\n\n💡 Agar kisi aik teacher ya subject (maslan "Physics", "Sir Haris", "Chemistry", "Math") k bary mn mazeed pochna ho to unka naam likhein!`;
      }
    }

    // 3. CHECK DYNAMIC SUBJECT OR TEACHER MATCH AGAINST REGISTERED FACULTY
    const matchedTeachers = [];

    effectiveFaculty.forEach(fac => {
      if (!fac || !fac.subject) return;
      const facSub = (fac.subject || '').toLowerCase();
      const facTeacher = (fac.teacher || '').toLowerCase();

      let isMatch = false;

      // (a) Exact or substring match of subject name
      if (facSub.length >= 3 && cleanQuery.includes(facSub)) {
        isMatch = true;
      }

      // (b) Word-level match against subject words
      const subWords = facSub.replace(/[()&,/-]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
      if (subWords.some(w => queryWords.includes(w) || cleanQuery.includes(w))) {
        isMatch = true;
      }

      // (c) Word-boundary Alias check (prevents physics matching cs)
      for (const [canonicalKey, aliases] of Object.entries(subjectAliases)) {
        if (facSub.includes(canonicalKey) || canonicalKey.includes(facSub)) {
          const aliasHit = aliases.some(alias => {
            if (alias.length <= 4) {
              return queryWords.includes(alias);
            }
            return cleanQuery.includes(alias);
          });
          if (aliasHit) {
            isMatch = true;
            break;
          }
        }
      }

      // Special check: if user typed "cs" as a standalone word
      if (queryWords.includes('cs') && facSub.includes('computer')) {
        isMatch = true;
      }

      // (d) Teacher Name search: user asked e.g. "Irfan", "Zain", "Rafiq", "Shakoor", "Najeeb", "Ijaz", "Zia"
      const teacherWords = facTeacher.replace(/[()&,.-]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !['sir', 'prof', 'doctor'].includes(w));
      if (teacherWords.some(w => queryWords.includes(w) || cleanQuery.includes(w))) {
        isMatch = true;
      }

      // Teacher Name spelling variants (e.g. najib/najeeb, shakoor/shakooor, rafiq/rafeeq, ijaz/ejaz)
      if ((cleanQuery.includes('najib') || cleanQuery.includes('najeeb')) && (facTeacher.includes('najeeb') || facTeacher.includes('najib'))) isMatch = true;
      if ((cleanQuery.includes('shakoor') || cleanQuery.includes('shakooor') || cleanQuery.includes('shakur')) && facTeacher.includes('shakoor')) isMatch = true;
      if ((cleanQuery.includes('rafiq') || cleanQuery.includes('rafeeq')) && facTeacher.includes('rafiq')) isMatch = true;
      if ((cleanQuery.includes('ijaz') || cleanQuery.includes('ejaz')) && facTeacher.includes('ijaz')) isMatch = true;
      if ((cleanQuery.includes('irfan') || cleanQuery.includes('erfan')) && facTeacher.includes('irfan')) isMatch = true;
      if ((cleanQuery.includes('zain') || cleanQuery.includes('abideen')) && facTeacher.includes('zain')) isMatch = true;
      if (cleanQuery.includes('zia') && facTeacher.includes('zia')) isMatch = true;
      if (cleanQuery.includes('haris') && facTeacher.includes('haris')) isMatch = true;

      if (isMatch && !matchedTeachers.some(t => t.id === fac.id)) {
        matchedTeachers.push(fac);
      }
    });

    // If one or more teachers matched the query
    if (matchedTeachers.length > 0) {
      const teacherCards = matchedTeachers.map(fac => {
        const subLower = (fac.subject || '').toLowerCase();
        const icon = subLower.includes('physics') ? '🔬' 
          : subLower.includes('chem') ? '🧪'
          : subLower.includes('math') ? '📐'
          : subLower.includes('bio') ? '🧬'
          : subLower.includes('computer') ? '💻'
          : subLower.includes('english') || subLower.includes('urdu') ? '📖'
          : '👨‍🏫';

        return `${icon} مضمون / Subject: ${fac.subject}
👨‍🏫 استاد / Teacher: ${fac.teacher}
🎓 Qualification: ${fac.education || 'Senior Subject Specialist'}
⭐ Experience: ${fac.experience || 'Experienced Faculty'}
🏫 Classes: ${fac.classes || '9th, 10th, 11th, 12th'}${fac.phone ? `\n📞 Contact / رابطہ: ${fac.phone}` : ''}`;
      }).join('\n\n────────────────\n\n');

      return `👨‍🏫 Al-Zia Science Academy Faculty Details:\n\n${teacherCards}\n\n💡 Mazeed kisi subject ya admission ki maloomat k liye aap sawal puch sakty hain!`;
    }

    // 4. CHECK IF SUBJECT IS OFFERED IN ACADEMY CURRICULUM (Even if teacher card is not yet added)
    const allAcademySubjects = Array.from(new Set((data?.classes || []).flatMap(c => c.subjects || [])));
    const matchingSubject = allAcademySubjects.find(s => {
      const sLower = s.toLowerCase();
      return cleanQuery.includes(sLower) || queryWords.some(w => w.length >= 4 && sLower.includes(w));
    });

    if (matchingSubject) {
      return `📚 Subject: ${matchingSubject}
Yeh subject Al-Zia Science Academy me ba-qaida parhaya jata hai (Classes: 9th, 10th, 11th, 12th).

Is subject ke faculty teacher aur batch timings ki mazeed maloomat ke liye aap Admin Office se rabta kar sakte hain:
📞 0334 6683236
🏢 Evening Shift: 3:00 PM – 6:30 PM`;
    }

    // 5. Admin Custom Q&A Rules Check
    for (const rule of currentRules) {
      if (!rule.keywords || !rule.response) continue;
      const kwArray = rule.keywords.toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
      const isMatch = kwArray.some(kw => {
        if (kw.length <= 3) return queryWords.includes(kw);
        return cleanQuery.includes(kw);
      });
      if (isMatch) {
        return rule.response;
      }
    }

    // 6. Default Fallback Response
    return `Assalamu Alaikum! 😊 
Aap Al-Zia Science Academy AI Assistant se kisi bhi subject ka naam pooch sakte hain:

• Kisi bhi subject ka naam likhein (e.g. "Physics", "Math", "Biology", "Computer Science", "Chemistry") to pata chal jaye ga k usay kon parhata hai!
• Academy Timings (3:00 PM – 6:30 PM)
• Admissions & Contact (+92 334 6683236)
• Fee Structure (2,000 – 4,000 Rs)

Neeche diye gaye buttons par click karein ya apna sawal likhein!`;
  };

  const handleSendMessage = (textToSend = null) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Simulate AI response delay
    setTimeout(() => {
      const botReplyText = generateBotReply(messageText);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  // Faculty Edit Handlers
  const handleTeacherChange = (id, field, value) => {
    setFacultyList(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleAddFacultyRow = () => {
    const newRow = {
      id: 'fac-' + Date.now(),
      subject: 'New Subject',
      teacher: 'Teacher Name',
      education: 'Degree Name',
      experience: 'Teaching Experience',
      classes: 'All Classes'
    };
    setFacultyList(prev => [...prev, newRow]);
  };

  const handleDeleteFacultyRow = (id) => {
    setFacultyList(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveFaculty = () => {
    if (typeof onUpdateFaculty === 'function') {
      onUpdateFaculty(facultyList);
    }
    setIsFacultyModalOpen(false);
  };

  // AI Rules Edit Handlers
  const handleRuleChange = (id, field, value) => {
    setAiRulesList(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddAiRuleRow = () => {
    const newRule = {
      id: 'rule-' + Date.now(),
      category: 'General Query',
      keywords: 'keyword1, keyword2',
      response: 'Write your custom AI response here...'
    };
    setAiRulesList(prev => [...prev, newRule]);
  };

  const handleDeleteAiRuleRow = (id) => {
    setAiRulesList(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveAiRules = () => {
    if (typeof onUpdateAiRules === 'function') {
      onUpdateAiRules(aiRulesList);
    }
    setIsAiRulesModalOpen(false);
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) - Sleek High-End Capsule */}
      <div className="fixed bottom-5 right-5 z-[9999] print:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer shadow-xl backdrop-blur-xl ${
            isOpen
              ? 'w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-slate-950/50'
              : 'px-3.5 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white border border-indigo-400/30 shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
          }`}
          title="Al-Zia Academy AI Assistant"
        >
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span className="text-xs font-bold tracking-tight">
                Portal Guide
              </span>
            </div>
          )}

          {/* Unread Ping Badge - Clean & Compact */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          )}
        </button>
      </div>

      {/* AI Chatbot Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[9999] w-[92vw] sm:w-[420px] max-h-[80vh] h-[550px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
                  Al-Zia Portal Assistant
                </h3>
                <p className="text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-normal">Academy Portal Guide</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isAdminLoggedIn && (
                <>
                  <button
                    onClick={() => setIsFacultyModalOpen(true)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    title="Admin: Edit Subject Faculty & Teachers List"
                  >
                    <Edit3 className="w-3 h-3" /> Teachers
                  </button>
                  <button
                    onClick={() => setIsAiRulesModalOpen(true)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    title="Admin: Manage AI Assistant Q&A Rules"
                  >
                    <Settings className="w-3 h-3" /> Rules
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.text)}
                className="px-2.5 py-1 bg-slate-800/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-500 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shadow-sm"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none whitespace-pre-line'
                  }`}>
                    {msg.text ? msg.text.replace(/\*\*/g, '').replace(/`/g, '') : ''}
                  </div>
                  <span className="text-[9px] text-slate-500 px-1 font-mono block">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI Assistant..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Admin Faculty Management Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-amber-400">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>Admin: Edit Subject Faculty & Teachers</span>
              </div>
              <button
                onClick={() => setIsFacultyModalOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Update subject teacher names, qualifications & experience below. When users ask AI Assistant, it will dynamically reply with your updated teacher records!
            </p>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {facultyList.map(fac => (
                <div key={fac.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 relative">
                  <button
                    onClick={() => handleDeleteFacultyRow(fac.id)}
                    className="absolute top-2 right-2 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    title="Delete Teacher Row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <div>
                      <label className="text-[10px] font-bold text-amber-400 uppercase font-mono">Subject Name</label>
                      <input
                        type="text"
                        value={fac.subject || ''}
                        onChange={(e) => handleTeacherChange(fac.id, 'subject', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Teacher Name</label>
                      <input
                        type="text"
                        value={fac.teacher || ''}
                        onChange={(e) => handleTeacherChange(fac.id, 'teacher', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                        placeholder="e.g. Sir Najeeb-ullah Bhatti"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-indigo-300 uppercase font-mono">Qualification / Education</label>
                      <input
                        type="text"
                        value={fac.education || ''}
                        onChange={(e) => handleTeacherChange(fac.id, 'education', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. BSCS (Gold Medalist)"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-purple-300 uppercase font-mono">Experience / Bio</label>
                      <input
                        type="text"
                        value={fac.experience || ''}
                        onChange={(e) => handleTeacherChange(fac.id, 'experience', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. 6+ Years Board Specialist"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleAddFacultyRow}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" /> Add Teacher
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFaculty}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Faculty Info
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin AI Knowledge Base Q&A Rules Modal */}
      {isAiRulesModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-auto relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-indigo-400">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Admin: Manage AI Assistant Q&A Knowledge Rules</span>
              </div>
              <button
                onClick={() => setIsAiRulesModalOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Add or edit custom AI Q&A rules. Enter trigger keywords (comma separated). When a user's question contains any of these keywords, the AI Assistant will respond with your exact answer!
            </p>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {aiRulesList.map(rule => (
                <div key={rule.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 relative">
                  <button
                    onClick={() => handleDeleteAiRuleRow(rule.id)}
                    className="absolute top-2 right-2 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    title="Delete AI Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <div>
                      <label className="text-[10px] font-bold text-amber-400 uppercase font-mono">Category / Topic</label>
                      <input
                        type="text"
                        value={rule.category || ''}
                        onChange={(e) => handleRuleChange(rule.id, 'category', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                        placeholder="e.g. Location"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Trigger Keywords (comma separated)</label>
                      <input
                        type="text"
                        value={rule.keywords || ''}
                        onChange={(e) => handleRuleChange(rule.id, 'keywords', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        placeholder="e.g. location, address, pata"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-indigo-300 uppercase font-mono">AI Response Text</label>
                    <textarea
                      rows={3}
                      value={rule.response || ''}
                      onChange={(e) => handleRuleChange(rule.id, 'response', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                      placeholder="Write exact response text that AI Assistant will output..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleAddAiRuleRow}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-400" /> Add New AI Q&A Rule
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiRulesModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAiRules}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save AI Rules
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
