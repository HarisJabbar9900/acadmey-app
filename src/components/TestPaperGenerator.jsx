import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Download, 
  RefreshCw, 
  BookOpen, 
  Clock, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  Sliders, 
  Edit3, 
  Save, 
  Copy, 
  Loader2,
  ListChecks,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';
import html2canvas from 'html2canvas';

// Intelligent Question Bank Presets by Subject & Topic
const QUESTION_BANK = {
  'Computer Science': {
    mcqs: [
      { q: "Which symbol is used for flowchart decision making?", options: ["Oval", "Rectangle", "Diamond", "Parallelogram"], ans: "Diamond" },
      { q: "Which operator is used for logical AND in C language?", options: ["&", "&&", "|", "||"], ans: "&&" },
      { q: "What is the size of an integer data type in 32-bit C compiler?", options: ["1 Byte", "2 Bytes", "4 Bytes", "8 Bytes"], ans: "4 Bytes" },
      { q: "Which loop guarantees execution at least once?", options: ["for loop", "while loop", "do-while loop", "nested loop"], ans: "do-while loop" },
      { q: "Which memory is volatile in computer systems?", options: ["ROM", "Hard Disk", "RAM", "Flash Memory"], ans: "RAM" },
      { q: "Which header file is required for printf() and scanf()?", options: ["<conio.h>", "<math.h>", "<stdio.h>", "<stdlib.h>"], ans: "<stdio.h>" },
      { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Machine Language", "Hyperlink Text Module Language", "Home Tool Markup Language"], ans: "Hyper Text Markup Language" },
      { q: "Which statement is used to terminate a loop prematurely?", options: ["exit", "stop", "break", "continue"], ans: "break" }
    ],
    shorts: [
      "Define a variable and state rules for naming variables in C language.",
      "Differentiate between compiler and interpreter with examples.",
      "Explain the difference between syntax error and logical error.",
      "What is an algorithm? Write two advantages of using flowcharts.",
      "Explain the function of CPU registers (MAR and MDR).",
      "What is the purpose of switch statement? Give syntax.",
      "Define array and explain how 1D array is declared in C."
    ],
    longs: [
      { main: "Explain different types of loops in C language with syntax and programming code examples.", parts: ["a) Differentiate between while and do-while loop.", "b) Write a program to print first 10 natural numbers using for loop."] },
      { main: "What is Data Type? Explain Primary Data Types in C in detail with memory sizes and range.", parts: ["a) Explain int, float, and char data types.", "b) Discuss type casting with an example."] }
    ]
  },
  'Physics': {
    mcqs: [
      { q: "What is the SI unit of Force?", options: ["Joule", "Pascal", "Newton", "Watt"], ans: "Newton" },
      { q: "The rate of change of momentum is equal to:", options: ["Work", "Applied Force", "Impulse", "Acceleration"], ans: "Applied Force" },
      { q: "Work done is maximum when the angle between Force and Displacement is:", options: ["0°", "45°", "90°", "180°"], ans: "0°" },
      { q: "Which instrument is used to measure potential difference?", options: ["Ammeter", "Voltmeter", "Galvanometer", "Rheostat"], ans: "Voltmeter" },
      { q: "Sound waves are which type of waves?", options: ["Transverse", "Electromagnetic", "Longitudinal", "Radio Waves"], ans: "Longitudinal" },
      { q: "Value of 'g' at the surface of Earth is approximately:", options: ["8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "12 m/s²"], ans: "9.8 m/s²" }
    ],
    shorts: [
      "State Newton's Second Law of Motion and derive its formula F = ma.",
      "Define Kinetic Energy and write its mathematical equation.",
      "Explain Pascal's Law and name two hydraulic applications.",
      "Differentiate between speed and velocity with SI units.",
      "State Hooke's Law and define Elastic Limit.",
      "What is total internal reflection? State conditions for its occurrence."
    ],
    longs: [
      { main: "Define Work. Derive the expression for Kinetic Energy (K.E = 1/2 mv²).", parts: ["a) Explain Law of Conservation of Energy with diagram.", "b) Calculate work done when 50N force moves a body through 5m."] },
      { main: "State Ohm's Law. Explain series and parallel combination of resistors with circuit diagrams.", parts: ["a) Derive equivalent resistance for series circuit.", "b) State limitations of Ohm's Law."] }
    ]
  },
  'Chemistry': {
    mcqs: [
      { q: "What is the atomic number of Carbon?", options: ["6", "8", "12", "14"], ans: "6" },
      { q: "pH of pure neutral water at 25°C is:", options: ["0", "5", "7", "14"], ans: "7" },
      { q: "The horizontal rows in the Periodic Table are called:", options: ["Groups", "Periods", "Blocks", "Families"], ans: "Periods" },
      { q: "Which chemical bond is formed by mutual sharing of electrons?", options: ["Ionic Bond", "Covalent Bond", "Metallic Bond", "Coordinate Bond"], ans: "Covalent Bond" },
      { q: "Gas law stating V ∝ T at constant pressure is:", options: ["Boyle's Law", "Charles's Law", "Avogadro's Law", "Dalton's Law"], ans: "Charles's Law" }
    ],
    shorts: [
      "State Boyle's Law and write its mathematical equation.",
      "Differentiate between Ionic and Covalent compounds with two properties.",
      "What is Avogadro's number? Write its numerical value.",
      "Explain the concept of pH and pOH.",
      "Define isotopes and give two examples of isotopes of Hydrogen.",
      "What is electronegativity? State its trend in the periodic table."
    ],
    longs: [
      { main: "Explain Rutherford's Atomic Model and state its main drawbacks.", parts: ["a) Write Bohr's Atomic Theory postulates.", "b) Compare Rutherford and Bohr atomic models."] },
      { main: "Define Chemical Equilibrium. State Le Chatelier's Principle and explain effect of concentration.", parts: ["a) Derive equilibrium constant Expression (Kc).", "b) State two applications of equilibrium constant."] }
    ]
  },
  'Mathematics': {
    mcqs: [
      { q: "Value of sin(90°) is:", options: ["0", "0.5", "1", "Undefined"], ans: "1" },
      { q: "The roots of quadratic equation ax² + bx + c = 0 are real and equal if Discriminant is:", options: ["D > 0", "D = 0", "D < 0", "D = 1"], ans: "D = 0" },
      { q: "Derivative of xⁿ with respect to x is:", options: ["xⁿ⁺¹", "n·xⁿ⁻¹", "n·xⁿ⁺¹", "xⁿ/n"], ans: "n·xⁿ⁻¹" },
      { q: "A matrix having single row is called:", options: ["Column Matrix", "Row Matrix", "Square Matrix", "Diagonal Matrix"], ans: "Row Matrix" }
    ],
    shorts: [
      "Solve the quadratic equation by factorization: x² - 5x + 6 = 0.",
      "Find the determinant of matrix A = [[2, 4], [1, 3]].",
      "State Pythagorean Theorem and write its formula.",
      "Find the 10th term of Arithmetic Progression: 2, 5, 8, 11...",
      "Evaluate: ∫ (3x² + 2x + 1) dx."
    ],
    longs: [
      { main: "Solve the system of linear equations using Cramer's Rule / Matrix Inversion Method.", parts: ["a) 2x + 3y = 12", "b) x - y = 1"] },
      { main: "Prove that: (sin θ + cos θ)² = 1 + 2 sin θ cos θ.", parts: ["a) Verify trigonometric identity for θ = 30°.", "b) State fundamental trigonometric identities."] }
    ]
  }
};

export default function TestPaperGenerator({ classes = [] }) {
  // Form Configuration State
  const [topicTitle, setTopicTitle] = useState('Chapter 1: Introduction & Core Concepts');
  const [selectedClass, setSelectedClass] = useState('10th');
  const [subject, setSubject] = useState('Computer Science');
  const [paperType, setPaperType] = useState('Monthly Test Exam');
  const [totalTime, setTotalTime] = useState('45 Minutes');
  const [totalMarks, setTotalMarks] = useState('25');
  const [mcqCount, setMcqCount] = useState(5);
  const [shortCount, setShortCount] = useState(5);
  const [longCount, setLongCount] = useState(2);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generated Paper Paper Data State
  const [generatedPaper, setGeneratedPaper] = useState(() => buildExamPaper());

  function buildExamPaper() {
    const bank = QUESTION_BANK[subject] || QUESTION_BANK['Computer Science'];
    
    // Pick MCQs
    const shuffledMcqs = [...bank.mcqs].sort(() => 0.5 - Math.random());
    const selectedMcqs = shuffledMcqs.slice(0, Math.min(mcqCount, shuffledMcqs.length));

    // Pick Short Questions
    const shuffledShorts = [...bank.shorts].sort(() => 0.5 - Math.random());
    const selectedShorts = shuffledShorts.slice(0, Math.min(shortCount, shuffledShorts.length));

    // Pick Long Questions
    const shuffledLongs = [...bank.longs].sort(() => 0.5 - Math.random());
    const selectedLongs = shuffledLongs.slice(0, Math.min(longCount, shuffledLongs.length));

    return {
      mcqs: selectedMcqs,
      shorts: selectedShorts,
      longs: selectedLongs
    };
  }

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    setGeneratedPaper(buildExamPaper());
  };

  const handlePrint = () => {
    const oldTitle = document.title;
    const cleanTopic = topicTitle.trim().replace(/\s+/g, '_');
    document.title = `AlZia_Exam_Paper_${subject}_Class_${selectedClass}_${cleanTopic}`;
    window.print();
    setTimeout(() => {
      document.title = oldTitle;
    }, 1000);
  };

  const handleDownloadPNG = async () => {
    const paperElement = document.getElementById('exam-paper-print-sheet');
    if (!paperElement) return;

    const cleanTopic = topicTitle.trim().replace(/\s+/g, '_');
    const fileName = `AlZia_Paper_${subject}_Class_${selectedClass}_${cleanTopic}.png`;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(paperElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Paper PNG Download Error:', err);
      handlePrint();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden print-hidden print:hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Exam & Test Paper Generator Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Al-Zia Exam & Test Paper Creator
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Select subject, input topic/chapter details, and instantly generate board-standard examination question papers formatted for clean single-page A4 printing!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Paper</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Controls (Left) & Live A4 Paper Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Setup Controls */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-6 print-hidden print:hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Paper Setup Controls</span>
            </h3>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full font-bold">
              BISE Format
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs font-sans">
            
            {/* Topic / Chapter Title Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Topic / Chapter Name</label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Chapter 1: Flowchart & Algorithms"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Subject & Class Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Class Batch</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="9th">Class 9th</option>
                  <option value="10th">Class 10th</option>
                  <option value="11th">Class 11th</option>
                  <option value="12th">Class 12th</option>
                  <option value="Boys">Boys Special Batch</option>
                </select>
              </div>
            </div>

            {/* Exam Type & Time Allowed */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Exam Type</label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Monthly Test Exam">Monthly Test Exam</option>
                  <option value="Chapter Evaluation Test">Chapter Test</option>
                  <option value="Grand Send-Up Exam">Send-Up Exam</option>
                  <option value="Annual Pre-Board Paper">Pre-Board Paper</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Time Allowed</label>
                <input
                  type="text"
                  value={totalTime}
                  onChange={(e) => setTotalTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Total Marks */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Total Marks</label>
              <input
                type="text"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Question Breakdown Sliders */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>Objective MCQs:</span>
                <span className="text-amber-400 font-extrabold">{mcqCount} Questions</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={mcqCount}
                onChange={(e) => setMcqCount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>Short Questions:</span>
                <span className="text-indigo-400 font-extrabold">{shortCount} Questions</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={shortCount}
                onChange={(e) => setShortCount(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>Long / Essay Questions:</span>
                <span className="text-purple-400 font-extrabold">{longCount} Questions</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={longCount}
                onChange={(e) => setLongCount(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Custom Paper Sheet</span>
            </button>

          </form>

          {/* Direct Actions: Print & Download PNG */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={handlePrint}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Paper / Save PDF</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating HD Image...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download HD PNG Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Printable A4 Examination Paper View */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Action Toolbar above Paper */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl print-hidden print:hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>A4 Examination Sheet Preview</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEditing 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Done Editing' : 'Edit Text Mode'}</span>
              </button>
            </div>
          </div>

          {/* THE OFFICIAL A4 PRINTABLE EXAMINATION PAPER */}
          <div 
            id="exam-paper-print-sheet"
            className="bg-white text-slate-950 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 mx-auto print:p-8 print:shadow-none print:w-full print:rounded-none border border-slate-200 min-h-[950px] flex flex-col justify-between font-serif"
          >
            <div>
              {/* Paper Top Header Banner */}
              <div className="border-b-4 border-double border-indigo-950 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-indigo-950">
                  <GraduationCap className="w-9 h-9" />
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-sans">
                    AL-ZIA SCIENCE ACADEMY
                  </h1>
                </div>
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-widest font-sans">
                  {paperType} — {topicTitle}
                </p>

                {/* Exam Meta Info Table */}
                <div className="grid grid-cols-4 gap-2 text-xs font-mono border-t border-slate-300 pt-3 mt-3 text-slate-900 font-bold">
                  <div className="border-r border-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Class</span>
                    <span>Class {selectedClass}</span>
                  </div>
                  <div className="border-r border-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Subject</span>
                    <span>{subject}</span>
                  </div>
                  <div className="border-r border-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Time Allowed</span>
                    <span>{totalTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-sans">Total Marks</span>
                    <span>{totalMarks} Marks</span>
                  </div>
                </div>
              </div>

              {/* Student Name & Roll No Fill Lines */}
              <div className="flex items-center justify-between text-xs font-sans font-bold border-b border-slate-300 py-3 text-slate-800">
                <div className="flex items-center gap-2 w-1/2">
                  <span>Student Name:</span>
                  <div className="flex-1 border-b border-dashed border-slate-950 h-4" />
                </div>
                <div className="flex items-center gap-2 w-1/3">
                  <span>Roll No:</span>
                  <div className="flex-1 border-b border-dashed border-slate-950 h-4" />
                </div>
              </div>

              {/* SECTION A: OBJECTIVE TYPE (MCQs) */}
              {generatedPaper.mcqs.length > 0 && (
                <div className="mt-6 space-y-3 font-sans">
                  <div className="bg-indigo-950 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider flex items-center justify-between">
                    <span>SECTION - A: OBJECTIVE TYPE (MULTIPLE CHOICE QUESTIONS)</span>
                    <span>({generatedPaper.mcqs.length} Marks)</span>
                  </div>
                  <p className="text-[11px] italic text-slate-600 font-serif">
                    Note: Select the correct option for each question. Cutting or overwriting is not allowed.
                  </p>

                  <div className="space-y-3">
                    {generatedPaper.mcqs.map((mcq, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <p className="font-bold text-slate-900">
                          Q{idx + 1}. {mcq.q}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-4 text-[11px] font-mono text-slate-800">
                          {mcq.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1.5">
                              <span className="font-bold text-indigo-950">({String.fromCharCode(65 + oIdx)})</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION B: SUBJECTIVE TYPE (SHORT QUESTIONS) */}
              {generatedPaper.shorts.length > 0 && (
                <div className="mt-6 space-y-3 font-sans">
                  <div className="bg-indigo-950 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider flex items-center justify-between">
                    <span>SECTION - B: SHORT ANSWER QUESTIONS</span>
                    <span>(Attempt any {Math.min(5, generatedPaper.shorts.length)})</span>
                  </div>

                  <div className="space-y-2">
                    {generatedPaper.shorts.map((shortQ, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="font-bold text-indigo-950 min-w-[24px]">Q{idx + 1}.</span>
                        <p className="font-semibold text-slate-900 leading-snug">{shortQ}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION C: LONG / DETAILED ESSAY QUESTIONS */}
              {generatedPaper.longs.length > 0 && (
                <div className="mt-6 space-y-3 font-sans">
                  <div className="bg-indigo-950 text-white px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider flex items-center justify-between">
                    <span>SECTION - C: DETAILED / ESSAY TYPE QUESTIONS</span>
                    <span>(Attempt all questions)</span>
                  </div>

                  <div className="space-y-4">
                    {generatedPaper.longs.map((longQ, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <p className="font-bold text-slate-950">
                          Q{idx + 1}. {longQ.main}
                        </p>
                        {longQ.parts && (
                          <div className="pl-6 space-y-1 text-slate-900 font-medium">
                            {longQ.parts.map((p, pIdx) => (
                              <p key={pIdx}>{p}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Paper Footer Signatures */}
            <div className="border-t border-slate-300 pt-6 mt-8 grid grid-cols-3 gap-4 text-center text-xs font-sans font-bold text-slate-800">
              <div>
                <div className="border-b border-slate-900 w-32 mx-auto mb-1 h-6" />
                <span className="text-[11px] text-slate-600">Subject Teacher</span>
              </div>
              <div className="text-indigo-950 flex flex-col justify-center">
                <span className="text-xs font-black uppercase">Good Luck for Exams!</span>
                <span className="text-[10px] text-slate-500 font-mono">Al-Zia Examination Board</span>
              </div>
              <div>
                <div className="border-b border-slate-900 w-32 mx-auto mb-1 h-6" />
                <span className="text-[11px] text-slate-600">Administrator</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
