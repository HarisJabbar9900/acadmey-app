import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  Users,
  Briefcase
} from 'lucide-react';
import { DEFAULT_FACULTY } from '../services/academyService';

export default function StaffInfo({ faculty = [], isAdminLoggedIn, onUpdateFaculty }) {
  const currentFacultyList = Array.isArray(faculty) && faculty.length > 0 ? faculty : DEFAULT_FACULTY;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  
  // Modal state for Add/Edit Faculty
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    education: '',
    experience: '',
    classes: '9th, 10th, 11th, 12th',
    phone: ''
  });

  const [notificationMessage, setNotificationMessage] = useState('');

  const showNotification = (msg) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(''), 4000);
  };

  // Subject theme color helper
  const getSubjectTheme = (subject = '') => {
    const s = subject.toLowerCase();
    if (s.includes('computer')) {
      return {
        badgeBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20',
        cardGlow: 'hover:border-blue-500/40',
        accentIcon: '💻',
        pillColor: 'bg-blue-600'
      };
    }
    if (s.includes('physics')) {
      return {
        badgeBg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20',
        cardGlow: 'hover:border-purple-500/40',
        accentIcon: '🔬',
        pillColor: 'bg-purple-600'
      };
    }
    if (s.includes('chemistry')) {
      return {
        badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20',
        cardGlow: 'hover:border-emerald-500/40',
        accentIcon: '🧪',
        pillColor: 'bg-emerald-600'
      };
    }
    if (s.includes('math')) {
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20',
        cardGlow: 'hover:border-amber-500/40',
        accentIcon: '📐',
        pillColor: 'bg-amber-600'
      };
    }
    if (s.includes('bio')) {
      return {
        badgeBg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20',
        cardGlow: 'hover:border-rose-500/40',
        accentIcon: '🧬',
        pillColor: 'bg-rose-600'
      };
    }
    return {
      badgeBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20',
      cardGlow: 'hover:border-indigo-500/40',
      accentIcon: '📚',
      pillColor: 'bg-indigo-600'
    };
  };

  // Distinct subjects list for filter pills
  const availableSubjects = Array.from(new Set(currentFacultyList.map(f => f.subject))).filter(Boolean);

  // Filtered faculty list
  const filteredFaculty = currentFacultyList.filter(f => {
    const matchesSubject = selectedSubjectFilter === 'ALL' || f.subject === selectedSubjectFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      (f.teacher && f.teacher.toLowerCase().includes(query)) ||
      (f.subject && f.subject.toLowerCase().includes(query)) ||
      (f.education && f.education.toLowerCase().includes(query)) ||
      (f.experience && f.experience.toLowerCase().includes(query)) ||
      (f.classes && f.classes.toLowerCase().includes(query));
    return matchesSubject && matchesQuery;
  });

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      teacher: '',
      subject: '',
      education: '',
      experience: '',
      classes: '9th, 10th, 11th, 12th',
      phone: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (fac) => {
    setEditingId(fac.id);
    setFormData({
      teacher: fac.teacher || '',
      subject: fac.subject || '',
      education: fac.education || '',
      experience: fac.experience || '',
      classes: fac.classes || '9th, 10th, 11th, 12th',
      phone: fac.phone || ''
    });
    setIsModalOpen(true);
  };

  // Submit Add/Edit Form
  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (!formData.teacher.trim() || !formData.subject.trim() || !formData.education.trim()) {
      alert('Please fill out Teacher Name, Subject, and Education / Qualification.');
      return;
    }

    let updatedList = [];
    if (editingId) {
      updatedList = currentFacultyList.map(f => f.id === editingId ? { ...f, ...formData } : f);
      showNotification(`Faculty profile for "${formData.teacher}" updated successfully!`);
    } else {
      const newMember = {
        id: `fac-${Date.now()}`,
        ...formData
      };
      updatedList = [...currentFacultyList, newMember];
      showNotification(`New teacher "${formData.teacher}" added to Faculty Directory!`);
    }

    if (typeof onUpdateFaculty === 'function') {
      onUpdateFaculty(updatedList);
    }
    setIsModalOpen(false);
  };

  // Delete Faculty Member
  const handleDeleteFaculty = (fac) => {
    if (window.confirm(`Are you sure you want to remove "${fac.teacher}" from the Faculty Directory?`)) {
      const updatedList = currentFacultyList.filter(f => f.id !== fac.id);
      if (typeof onUpdateFaculty === 'function') {
        onUpdateFaculty(updatedList);
      }
      showNotification(`Teacher "${fac.teacher}" removed from Directory.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🌟 Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 glass-panel glow-accent-indigo p-6 rounded-2xl shadow-xl overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4" /> Academic Leadership & Faculty
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            👨‍🏫 Teaching Faculty & Staff Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive directory of our distinguished subject specialists, board examiners, and educators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Staff Counter Badge */}
          <div className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-xs">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>{currentFacultyList.length} Faculty Members</span>
          </div>

          {/* Admin Add Teacher Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Faculty Member</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Faculty
            </div>
          )}
        </div>
      </div>

      {/* 🔔 Notification Alert Banner */}
      {notificationMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* 🔎 Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher name, subject, or degree..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredFaculty.length}</strong> of {currentFacultyList.length} faculty profiles
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 uppercase">Filter:</span>
          <button
            onClick={() => setSelectedSubjectFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSubjectFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Subjects
          </button>
          {availableSubjects.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubjectFilter(sub)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubjectFilter === sub
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* 👨‍🏫 Faculty Cards Grid (Responsive 1-col mobile, 2-cols tablet, 3-cols desktop) */}
      {filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculty.map(fac => {
            const theme = getSubjectTheme(fac.subject);

            return (
              <div
                key={fac.id}
                className={`glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 ${theme.cardGlow} group relative overflow-hidden`}
              >
                {/* Top Subtle Subject Color Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.pillColor}`} />

                <div>
                  {/* Top Bar: Subject Badge & Experience */}
                  <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${theme.badgeBg} flex items-center gap-1.5 shadow-xs`}>
                      <span>{theme.accentIcon}</span>
                      <span>{fac.subject}</span>
                    </span>

                    {fac.experience && (
                      <span className="text-[11px] font-bold font-mono text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/20 flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{fac.experience}</span>
                      </span>
                    )}
                  </div>

                  {/* Teacher Name & Title */}
                  <div className="space-y-1 mb-3">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {fac.teacher}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Senior Subject Specialist ({fac.subject})</span>
                    </p>
                  </div>

                  {/* 🎓 Education & Qualification Box (Highlighted) */}
                  <div className="p-3 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-xl space-y-1 mb-3 shadow-xs">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900 dark:text-amber-400 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Education & Degree:</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-amber-200 leading-snug">
                      {fac.education}
                    </div>
                  </div>

                  {/* Classes Taught */}
                  {fac.classes && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">Classes:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{fac.classes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  {/* WhatsApp Academic Inquiry Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Assalamu Alaikum Sir ${fac.teacher}, I have an inquiry regarding ${fac.subject} classes at Al-Zia Science Academy.`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Send WhatsApp academic inquiry"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Academic Inquiry</span>
                  </button>

                  {/* Admin Edit & Delete Actions */}
                  {isAdminLoggedIn && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(fac)}
                        className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-500/20 transition-all cursor-pointer"
                        title="Edit Faculty Info"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteFaculty(fac)}
                        className="p-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Faculty Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No faculty members found matching your search.
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search keywords or clear the subject filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSubjectFilter('ALL'); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 📝 Modal: Add / Edit Faculty Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto relative animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {editingId ? 'Edit Faculty Member' : 'Add New Faculty Member'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter teacher details, subject specialization, and qualifications.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs sm:text-sm">
              
              {/* Teacher Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Name & Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sir Haris Jabbar or Prof. Malik Umar"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Specialization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science, Physics, Mathematics, Chemistry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Education / Degree */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Education & Academic Qualifications *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BS Computer Science (Gold Medalist) or M.Sc Physics"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teaching Experience & Board Roles
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6+ Years Board Specialist / Senior Lecturer"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Classes Taught */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Classes Taught
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9th, 10th, 11th, 12th"
                  value={formData.classes}
                  onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {editingId ? 'Save Changes' : '+ Add Teacher'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
