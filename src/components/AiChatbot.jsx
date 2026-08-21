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
  MessageSquare
} from 'lucide-react';

export default function AiChatbot({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Assalamu Alaikum! Welcome to Al-Zia Science Academy AI Assistant 🎓. How can I help you today? You can ask about academy timings, admissions, courses, fee structures, or type a student Roll Number to check results!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    { label: '🕒 Timings', text: 'What are the academy timings?' },
    { label: '🎓 Courses', text: 'Which classes and subjects are offered?' },
    { label: '💳 Fee Info', text: 'What is the monthly fee structure?' },
    { label: '📞 Contact', text: 'How can I contact admin for admission?' },
    { label: '🔍 Check Result', text: 'How can I check student result?' }
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

    // 1. Roll Number Search (e.g., "401", "roll 401", "result 103", "check 201")
    const rollMatch = query.match(/\b(\d{1,4})\b/);
    if (rollMatch) {
      const rollNum = rollMatch[1];
      const student = (data?.students || []).find(s => String(s.rollNo) === String(rollNum));

      if (student) {
        const cls = (data?.classes || []).find(c => c.id === student.classId);
        
        // Calculate latest performance
        const studentMarks = (data?.marks || []).filter(m => m.studentId === student.id);
        let totalObtained = 0;
        let totalMax = 0;

        studentMarks.forEach(m => {
          totalObtained += Number(m.obtainedMarks) || 0;
          totalMax += Number(m.totalMarks) || 100;
        });

        const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

        return `📊 **Student Record Found**:
👤 **Name**: ${student.name}
👨‍👦 **Father**: ${student.fname || 'N/A'}
🏫 **Class**: ${cls?.name || 'N/A'} (Roll #${student.rollNo})
📈 **Latest Score Percentage**: ${percentage}% (${totalObtained}/${totalMax} Marks)
✅ **Status**: Active Student at Al-Zia Science Academy.`;
      }
    }

    // 2. Timings & Schedule
    if (query.includes('timing') || query.includes('time') || query.includes('schedule') || query.includes('hours') || query.includes('wakt')) {
      return `🕒 **Al-Zia Science Academy Timings**:
• **Evening Shift Only**: 3:00 PM – 6:30 PM
• **Days**: Monday to Saturday (Sunday Closed).`;
    }

    // 3. Courses & Classes Offered
    if (query.includes('class') || query.includes('course') || query.includes('subject') || query.includes('matric') || query.includes('fsc')) {
      return `🎓 **Classes & Subjects Offered**:
• **Class 9th & 10th (Matric Science)**: Physics, Chemistry, Mathematics, Biology, Computer Science.
• **Class 11th & 12th (FSc Pre-Medical / Pre-Engineering / ICS)**: Physics, Chemistry, Biology, Mathematics, Computer.
• Regular monthly test series & board examination preparation!`;
    }

    // 4. Fee Structure & Payments
    if (query.includes('fee') || query.includes('fees') || query.includes('dues') || query.includes('paisa') || query.includes('cost')) {
      return `💳 **Fee Structure Information**:
• Monthly Tuition Fee ranges between **Rs. 2,000 – Rs. 4,000** depending on Class level.
• Fee receipts are generated monthly and can be paid via Cash, JazzCash, EasyPaisa, or Bank Transfer.
• Admin login gives full digital receipt download & printing.`;
    }

    // 5. Contact & Admissions
    if (query.includes('contact') || query.includes('admission') || query.includes('phone') || query.includes('address') || query.includes('location') || query.includes('number')) {
      return `📞 **Admissions & Contact Details**:
• **Academy Name**: Al-Zia Science Academy
• **Admissions Status**: Admissions OPEN for Session 2026-2027!
• **Visit Us**: Admin Office during Evening Shift (3:00 PM – 6:30 PM).
• You can also submit queries in the **Feedback** tab on this portal!`;
    }

    // 6. Result & Report Cards
    if (query.includes('result') || query.includes('report') || query.includes('marks') || query.includes('card') || query.includes('position')) {
      return `📊 **Checking Student Results**:
Simply type the **Roll Number** (e.g., \`401\` or \`103\`) directly in this chat! I will instantly fetch the student's monthly performance, total marks, and percentage for you!`;
    }

    // 7. About Academy Portal
    if (query.includes('app') || query.includes('website') || query.includes('portal') || query.includes('al-zia') || query.includes('alzia')) {
      return `✨ **About Al-Zia Academy Portal**:
This is the official digital portal for Al-Zia Science Academy. It provides:
1. 📊 Monthly Marks Accumulation Ledger & Wall of Honor Ranks
2. 📅 Class-wise Attendance Tracker
3. 💳 Student Monthly Fee Manager & Receipt Generator
4. 📜 Class Topper Certificate of Excellence Generator
5. 📝 AI Test Paper Generator & Study Material Library!`;
    }

    // Default Fallback Response
    return `Thank you for your question! 😊 
You can ask me about:
• **Academy Timings & Batches**
• **Classes & Subjects (9th, 10th, 11th, 12th)**
• **Fee Structure & Receipts**
• **Student Roll Number Search (e.g. \`401\`)**

Or click one of the quick options below!`;
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

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-[9999] print:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 transform hover:scale-105 cursor-pointer border border-indigo-400/30"
          title="Al-Zia Academy AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 animate-pulse text-amber-300" />
              <span className="hidden sm:inline-block font-extrabold text-xs tracking-wide">
                Ask AI Assistant
              </span>
            </div>
          )}

          {/* Unread Ping Badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-white items-center justify-center">1</span>
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
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  Al-Zia AI Assistant <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online • Academy Portal Guide
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
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
                    {msg.text}
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
              placeholder="Ask AI or type Roll No (e.g. 401)..."
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
    </>
  );
}
