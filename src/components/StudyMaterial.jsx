import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  PlusCircle,
  Upload,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Book,
  HelpCircle,
  Eye,
  Sparkles,
  FileCheck,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
  FolderOpen,
  Maximize2
} from 'lucide-react';
import {
  uploadStudyMaterialFile,
  triggerFileDownload,
  parseDriveOrCloudUrl,
  getFileFromIndexedDB
} from '../services/academyService';

export default function StudyMaterial({ data, selectedClassId, isAdminLoggedIn, onAddResource, onUpdateResource, onDeleteResource }) {
  const [activeClassFilter, setActiveClassFilter] = useState(selectedClassId || 'ALL');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [notification, setNotification] = useState(null);

  // Download & Reader States
  const [downloadingId, setDownloadingId] = useState(null);
  const [readingResource, setReadingResource] = useState(null);
  const [readingUrl, setReadingUrl] = useState('');
  const [isLoadingReader, setIsLoadingReader] = useState(false);

  // Form State - Add Resource
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Book'); // 'Book' | 'Notes' | 'MCQs'
  const [targetClassId, setTargetClassId] = useState(data.classes[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [fileError, setFileError] = useState('');

  // Form State - Edit Resource
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Book');
  const [editTargetClassId, setEditTargetClassId] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [isEditUploading, setIsEditUploading] = useState(false);

  // Live reader loader effect
  useEffect(() => {
    let activeBlobUrl = null;
    if (readingResource) {
      setIsLoadingReader(true);
      const url = readingResource.fileUrl || '';

      if (url.startsWith('idb://') || !url) {
        const targetId = url.replace('idb://', '') || readingResource.id;
        getFileFromIndexedDB(targetId)
          .then(item => {
            if (item && item.data) {
              const blob = item.data instanceof Blob ? item.data : new Blob([item.data], { type: 'application/pdf' });
              activeBlobUrl = URL.createObjectURL(blob);
              setReadingUrl(activeBlobUrl);
            } else {
              setReadingUrl('');
            }
          })
          .catch(() => setReadingUrl(''))
          .finally(() => setIsLoadingReader(false));
      } else {
        const parsed = parseDriveOrCloudUrl(url);
        setReadingUrl(parsed.viewUrl || url);
        setIsLoadingReader(false);
      }
    } else {
      setReadingUrl('');
      setIsLoadingReader(false);
    }

    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [readingResource]);

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setEditTitle(res.title || '');
    setEditCategory(res.category || 'Book');
    setEditTargetClassId(res.classId || data.classes[0]?.id || '');
    setEditSubject(res.subject || '');
    setEditFileUrl(res.fileUrl || '');
    setEditFileName(res.fileName || '');
    setEditSelectedFile(null);
  };

  const handleFileSelection = (e, isEdit = false) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) return;

    if (isEdit) {
      setEditSelectedFile(file);
      setEditFileName(file.name);
    } else {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category || !targetClassId) return;

    const classObj = data.classes.find(c => c.id === targetClassId);
    const newResId = 'res-' + Date.now();

    setIsUploading(true);
    setUploadStatus('Processing document...');

    try {
      let finalUrl = fileUrl.trim();
      let finalFileName = fileName || (selectedFile ? selectedFile.name : `${title.replace(/\s+/g, '_')}.pdf`);

      // If user selected a file from their device
      if (selectedFile) {
        setUploadStatus('Uploading PDF to secure cloud storage...');
        const uploadResult = await uploadStudyMaterialFile(selectedFile, newResId);
        if (uploadResult && uploadResult.url) {
          finalUrl = uploadResult.url;
          finalFileName = uploadResult.fileName || finalFileName;
        }
      }

      // If Google Drive link was pasted, normalize it
      if (finalUrl && finalUrl.includes('drive.google.com')) {
        const parsed = parseDriveOrCloudUrl(finalUrl);
        finalUrl = parsed.viewUrl || finalUrl;
      }

      const newResource = {
        id: newResId,
        title: title.trim(),
        category,
        classId: targetClassId,
        subject: subject.trim() || 'General',
        fileName: finalFileName,
        fileUrl: finalUrl || `idb://${newResId}`,
        date: new Date().toISOString().split('T')[0]
      };

      onAddResource(newResource);
      setIsModalOpen(false);

      // Reset form
      setTitle('');
      setCategory('Book');
      setSubject('');
      setFileUrl('');
      setFileName('');
      setSelectedFile(null);
      setUploadStatus('');

      setNotification(`"${newResource.title}" published successfully for Class ${classObj?.name || ''}!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error('Resource upload failed:', err);
      setFileError('Upload failed: ' + (err.message || 'Please check your connection or use a Google Drive link.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEditResource = async (e) => {
    e.preventDefault();
    if (!editingResource || !editTitle.trim() || !editCategory || !editTargetClassId) return;

    setIsEditUploading(true);

    try {
      let finalUrl = editFileUrl.trim() || editingResource.fileUrl;
      let finalFileName = editFileName || editingResource.fileName;

      if (editSelectedFile) {
        const uploadResult = await uploadStudyMaterialFile(editSelectedFile, editingResource.id);
        if (uploadResult && uploadResult.url) {
          finalUrl = uploadResult.url;
          finalFileName = uploadResult.fileName || finalFileName;
        }
      }

      const updatedResource = {
        ...editingResource,
        title: editTitle.trim(),
        category: editCategory,
        classId: editTargetClassId,
        subject: editSubject.trim() || 'General',
        fileName: finalFileName,
        fileUrl: finalUrl
      };

      onUpdateResource(updatedResource);
      setEditingResource(null);
      setEditSelectedFile(null);

      setNotification(`"${updatedResource.title}" updated successfully!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Edit update failed:', err);
      alert('Could not update document: ' + (err.message || 'Error occurred'));
    } finally {
      setIsEditUploading(false);
    }
  };

  const handleDelete = (resourceId, resourceTitle) => {
    if (window.confirm(`Are you sure you want to delete "${resourceTitle}"?`)) {
      onDeleteResource(resourceId);
      setNotification(`"${resourceTitle}" deleted.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDownload = async (res) => {
    try {
      setDownloadingId(res.id);
      await triggerFileDownload(res.fileUrl, res.fileName, res.id);
    } catch (err) {
      console.warn('Download handler caught:', err);
      const parsed = parseDriveOrCloudUrl(res.fileUrl);
      if (parsed.viewUrl) {
        window.open(parsed.viewUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('File is opening in reader mode.');
        setReadingResource(res);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter resources
  const resources = data.resources || [];
  const filteredResources = resources.filter(res => {
    const isClassMatch = activeClassFilter === 'ALL' || res.classId === activeClassFilter;
    const isCategoryMatch = activeCategoryFilter === 'ALL' || res.category === activeCategoryFilter;
    const isSearchMatch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.subject && res.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.fileName && res.fileName.toLowerCase().includes(searchQuery.toLowerCase()));

    return isClassMatch && isCategoryMatch && isSearchMatch;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Book':
        return { label: '📘 Book', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
      case 'Notes':
        return { label: '📝 Notes', bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' };
      case 'MCQs':
        return { label: '❓ MCQs', bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30' };
      default:
        return { label: '📄 Material', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner Header */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class-Wise Digital Library</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>Study Material & PDF Downloads</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Class Textbooks 📘, Chapter Notes 📝, and Solved MCQs ❓ for all classes.
          </p>
        </div>

        {/* Action Button for Admin */}
        <div>
          {isAdminLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                setFileError('');
                setSelectedFile(null);
                setFileName('');
                setFileUrl('');
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF Resource</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <span>👁️ Student View</span>
            </div>
          )}
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 px-5 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-xl shadow-emerald-950/40 animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* Filters & Search Control Bar */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Material:
            </span>
            {[
              { id: 'ALL', label: 'All Resources' },
              { id: 'Book', label: '📘 Books' },
              { id: 'Notes', label: '📝 Notes' },
              { id: 'MCQs', label: '❓ MCQs' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeCategoryFilter === cat.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search books, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

        </div>

        {/* Class Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Filter by Class:</span>
          <button
            onClick={() => setActiveClassFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeClassFilter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
          >
            All Classes ({resources.length})
          </button>
          {data.classes.map(c => {
            const count = resources.filter(r => r.classId === c.id).length;
            const isSelected = activeClassFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveClassFilter(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white'
                  }`}
              >
                <span>Class {c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSelected ? 'bg-indigo-950/60 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map(res => {
            const classObj = data.classes.find(c => c.id === res.classId);
            const badge = getCategoryBadge(res.category);
            const isDownloading = downloadingId === res.id;
            const parsedUrl = parseDriveOrCloudUrl(res.fileUrl);

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-indigo-500/10"
              >
                <div>
                  {/* Category & Class Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-slate-300 border border-indigo-200 dark:border-slate-700 shadow-xs">
                      Class {classObj?.name || 'All'}
                    </span>
                  </div>

                  {/* Resource Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug">
                    {res.title}
                  </h3>

                  {/* Metadata */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> {res.subject || 'General'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{res.date}</span>
                  </div>

                  {isAdminLoggedIn && parsedUrl.isGoogleDrive && (
                    <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>☁️ Cloud Verified (Google Drive)</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Read Online Button */}
                    <button
                      onClick={() => setReadingResource(res)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95 shadow-xs"
                      title="Read Document Online"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-500" /> Read
                    </button>

                    {/* Download PDF Button */}
                    <button
                      disabled={isDownloading}
                      onClick={() => handleDownload(res)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                      title="Download PDF to Device"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" /> Download
                        </>
                      )}
                    </button>
                  </div>

                  {/* Admin Edit & Delete Actions */}
                  {isAdminLoggedIn && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                        title="Edit PDF Resource"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(res.id, res.title)}
                        className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                        title="Delete PDF Resource"
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
        <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <BookOpen className="w-10 h-10 text-indigo-500/50 mx-auto mb-3" />
          <h4 className="text-slate-800 dark:text-white font-bold text-base mb-1">No Study Material Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? 'No books or notes matched your search query.'
              : 'Upload textbooks, chapter notes, and past papers so students can read or download them anytime.'}
          </p>
          {isAdminLoggedIn && !searchQuery && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Upload First Resource
            </button>
          )}
        </div>
      )}

      {/* Reader Modal (In-Browser PDF / Document Viewer) */}
      {readingResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">

            {/* Reader Top Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-white text-sm sm:text-base truncate">
                    {readingResource.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Class {data.classes.find(c => c.id === readingResource.classId)?.name || 'General'} • {readingResource.subject}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(readingResource)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>

                {readingUrl && readingUrl.startsWith('http') && (
                  <button
                    onClick={() => window.open(readingUrl, '_blank', 'noopener,noreferrer')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                    title="Open in Separate Window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setReadingResource(null)}
                  className="p-2 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 rounded-xl transition-all cursor-pointer"
                  title="Close Reader"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reader Content Body */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
              {isLoadingReader ? (
                <div className="text-center text-slate-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                  <p className="text-xs">Loading document...</p>
                </div>
              ) : readingUrl ? (
                <iframe
                  src={readingUrl}
                  title={readingResource.title}
                  className="w-full h-full border-0 bg-slate-900"
                  allow="autoplay"
                />
              ) : (
                <div className="text-center max-w-sm p-6 text-slate-400 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h4 className="text-white font-bold text-sm">Direct Preview Unavailable</h4>
                  <p className="text-xs text-slate-400">
                    This file can be downloaded directly to your device to view.
                  </p>
                  <button
                    onClick={() => handleDownload(readingResource)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" /> Download to View
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Modal: Upload PDF Resource */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Upload PDF Study Material</h3>
              </div>
              <button onClick={() => !isUploading && setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">

              {/* Material Type Selection */}
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1">Resource Category / Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Book', label: '📘 Book' },
                    { id: 'Notes', label: '📝 Notes' },
                    { id: 'MCQs', label: '❓ MCQs' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${category === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 9th Computer Science Complete Book"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Class *</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    {data.classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Class {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics, Computer..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Option 1: Direct File Upload */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Option 1: Choose PDF File from Device (Phone or PC)
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileSelection(e, false)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                />
                {selectedFile && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <span className="truncate flex items-center gap-1.5 font-mono">
                      <FileCheck className="w-3.5 h-3.5 shrink-0" /> {selectedFile.name}
                    </span>
                    <span className="shrink-0 font-bold">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>

              {/* Option 2: Cloud / Google Drive Link */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Option 2: Google Drive / OneDrive / Web PDF Link
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/... or https://site.com/book.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  💡 Tip: For heavy 50MB+ textbooks, upload to Google Drive, set sharing to <em>"Anyone with link"</em>, and paste link above. Both View and Download will work automatically!
                </p>
              </div>

              {fileError && (
                <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Uploading Status Progress */}
              {isUploading && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center gap-3 text-xs text-indigo-300 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{uploadStatus || 'Uploading document...'}</span>
                </div>
              )}

              {/* Footer Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!selectedFile && !fileUrl.trim())}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Save & Publish Resource
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit PDF Resource */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-auto max-h-[85vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Edit PDF Resource</h3>
              </div>
              <button onClick={() => !isEditUploading && setEditingResource(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditResource} className="space-y-4">

              {/* Material Type Selection */}
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1">Resource Category / Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Book', label: '📘 Book' },
                    { id: 'Notes', label: '📝 Notes' },
                    { id: 'MCQs', label: '❓ MCQs' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEditCategory(cat.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${editCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Class *</label>
                  <select
                    value={editTargetClassId}
                    onChange={(e) => setEditTargetClassId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    {data.classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        Class {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Replace PDF Document */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Replace PDF File from Device (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileSelection(e, true)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                />
                {editSelectedFile && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> Selected new file: {editSelectedFile.name}
                  </p>
                )}
              </div>

              {/* PDF Link Backup */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Google Drive / Web PDF Link</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={editFileUrl}
                  onChange={(e) => setEditFileUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Footer Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isEditUploading}
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditUploading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isEditUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
