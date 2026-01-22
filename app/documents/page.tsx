'use client';

import { useState, useRef, useEffect } from 'react';
import {
    FileText, Filter, Bell, Plus, Search, Download, File, Image, Video, FolderOpen, X, Upload, Edit2, Trash2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FloatingChat from '@/components/FloatingChat';
import Card from '@/components/ui/Card';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface Document {
    id: string;
    name: string;
    type: string;
    category: string;
    size: string;
    uploadedAt: string;
    uploadedBy?: string;
}

const MOCK_DOCUMENTS: Document[] = [
    { id: '1', name: 'Sunday Service Order', type: 'PDF', category: 'SERVICE', size: '2.4 MB', uploadedAt: '2024-05-19', uploadedBy: 'Pastor John' },
    { id: '2', name: 'Annual Budget 2024', type: 'EXCEL', category: 'FINANCE', size: '1.8 MB', uploadedAt: '2024-01-15', uploadedBy: 'Treasurer' },
    { id: '3', name: 'Youth Camp Photos', type: 'IMAGE', category: 'MEDIA', size: '45.2 MB', uploadedAt: '2024-04-20', uploadedBy: 'Media Team' },
    { id: '4', name: 'Easter Service Recording', type: 'VIDEO', category: 'MEDIA', size: '1.2 GB', uploadedAt: '2024-03-31', uploadedBy: 'Media Team' },
    { id: '5', name: 'Member Directory', type: 'PDF', category: 'ADMIN', size: '5.6 MB', uploadedAt: '2024-05-01', uploadedBy: 'Admin' },
    { id: '6', name: 'Church Constitution', type: 'WORD', category: 'LEGAL', size: '890 KB', uploadedAt: '2023-08-15', uploadedBy: 'Pastor John' },
    { id: '7', name: 'Worship Set List', type: 'PDF', category: 'SERVICE', size: '420 KB', uploadedAt: '2024-05-18', uploadedBy: 'Worship Leader' },
    { id: '8', name: 'Building Permits', type: 'PDF', category: 'LEGAL', size: '3.2 MB', uploadedAt: '2024-02-10', uploadedBy: 'Admin' },
];

const CATEGORIES = ['All', 'SERVICE', 'FINANCE', 'MEDIA', 'ADMIN', 'LEGAL'];
const FILE_TYPES = ['PDF', 'WORD', 'EXCEL', 'IMAGE', 'VIDEO'];

export default function DocumentsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; docId: string | null }>({ isOpen: false, docId: null });
    const [newDocName, setNewDocName] = useState('');
    const [newDocType, setNewDocType] = useState('PDF');
    const [newDocCategory, setNewDocCategory] = useState('SERVICE');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const localDocs = storage.get<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
        if (localDocs.length > 0) {
            setDocuments(localDocs);
        } else {
            setDocuments(MOCK_DOCUMENTS);
            storage.set(STORAGE_KEYS.DOCUMENTS, MOCK_DOCUMENTS);
        }
    }, []);

    const getDocIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <File className="w-6 h-6" />;
            case 'IMAGE': return <Image className="w-6 h-6" />;
            case 'VIDEO': return <Video className="w-6 h-6" />;
            default: return <FileText className="w-6 h-6" />;
        }
    };

    const getDocColor = (type: string) => {
        switch (type) {
            case 'PDF': return 'bg-rose-50 text-rose-600';
            case 'IMAGE': return 'bg-purple-50 text-purple-600';
            case 'VIDEO': return 'bg-amber-50 text-amber-600';
            case 'EXCEL': return 'bg-emerald-50 text-emerald-600';
            case 'WORD': return 'bg-indigo-50 text-indigo-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSaveDocument = () => {
        let updatedDocs: Document[];

        if (editingDoc) {
            updatedDocs = documents.map(d =>
                d.id === editingDoc.id
                    ? { ...editingDoc, name: newDocName, type: newDocType, category: newDocCategory }
                    : d
            );
        } else {
            const newDoc: Document = {
                id: Date.now().toString(),
                name: newDocName || 'Untitled Document',
                type: newDocType,
                category: newDocCategory,
                size: '1.2 MB',
                uploadedAt: new Date().toISOString().split('T')[0],
                uploadedBy: 'Current User'
            };
            updatedDocs = [newDoc, ...documents];
        }

        setDocuments(updatedDocs);
        storage.set(STORAGE_KEYS.DOCUMENTS, updatedDocs);
        closeModal();
    };

    const handleEditDocument = (doc: Document) => {
        setEditingDoc(doc);
        setNewDocName(doc.name);
        setNewDocType(doc.type);
        setNewDocCategory(doc.category);
        setSelectedDoc(null);
        setIsModalOpen(true);
    };

    const handleDeleteDocument = (docId: string) => {
        setDeleteConfirm({ isOpen: true, docId });
        setSelectedDoc(null);
    };

    const confirmDelete = () => {
        if (!deleteConfirm.docId) return;

        const updatedDocs = documents.filter(d => d.id !== deleteConfirm.docId);
        setDocuments(updatedDocs);
        storage.set(STORAGE_KEYS.DOCUMENTS, updatedDocs);
        setDeleteConfirm({ isOpen: false, docId: null });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDoc(null);
        setNewDocName('');
        setNewDocType('PDF');
        setNewDocCategory('SERVICE');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100">
            <Sidebar isOpen={isSidebarOpen} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 md:h-24 px-4 md:px-10 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xl z-30 border-b border-slate-50/50">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="h-10 w-[1px] bg-slate-100 hidden sm:block"></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Documents</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Document Library • {documents.length} Files</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <AnimatedButton onClick={() => setIsModalOpen(true)}>
                            <Upload className="w-5 h-5" />
                            <span className="hidden sm:inline">Upload File</span>
                        </AnimatedButton>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    <div className="space-y-8 animate-in">
                        {/* Category Pills & Search */}
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                            <div className="flex flex-wrap gap-3">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${selectedCategory === cat
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white border border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="relative group">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 w-full md:w-72 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Document Grid */}
                        <Card title="All Files" icon={FolderOpen}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredDocuments.map(doc => (
                                    <div
                                        key={doc.id}
                                        onClick={() => setSelectedDoc(doc)}
                                        className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 hover:bg-white transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-5">
                                            <div className={`p-4 rounded-2xl ${getDocColor(doc.type)} group-hover:scale-110 transition-transform`}>
                                                {getDocIcon(doc.type)}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditDocument(doc); }}
                                                    className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                                    className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-800 mb-1 truncate">{doc.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">
                                            {doc.type} • {doc.size}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); }}
                                                className="p-2 hover:bg-indigo-50 rounded-xl text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filteredDocuments.length === 0 && (
                                <div className="text-center py-16">
                                    <FolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">No files found</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>

            {/* Upload File Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden zoom-in">
                        <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingDoc ? 'Edit Document' : 'Upload File'}
                                </h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                                    {editingDoc ? 'Update Document Details' : 'Add to Cloud Drive'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-10 space-y-6">
                            {/* Drag and Drop Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
                            >
                                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="font-bold text-slate-600 mb-1">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-400">PDF, Word, Excel, Images, Videos</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setNewDocName(e.target.files[0].name);
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Name</label>
                                <input
                                    type="text"
                                    value={newDocName}
                                    onChange={(e) => setNewDocName(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold"
                                    placeholder="Document name..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {FILE_TYPES.slice(0, 3).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewDocType(type)}
                                                className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${newDocType === type
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                    <select
                                        value={newDocCategory}
                                        onChange={(e) => setNewDocCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all font-bold text-sm"
                                    >
                                        {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <AnimatedButton onClick={closeModal} variant="secondary" className="flex-1">Cancel</AnimatedButton>
                                <AnimatedButton onClick={handleSaveDocument} className="flex-1">
                                    {editingDoc ? 'Update' : 'Upload'}
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Details Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedDoc(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden zoom-in">
                        <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-slate-50 to-white flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className={`p-5 rounded-2xl ${getDocColor(selectedDoc.type)}`}>
                                    {getDocIcon(selectedDoc.type)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedDoc.name}</h3>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedDoc.type} • {selectedDoc.size}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-10">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uploaded</p>
                                    <p className="font-bold text-slate-800">{new Date(selectedDoc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uploaded By</p>
                                    <p className="font-bold text-slate-800">{selectedDoc.uploadedBy || 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-5 mb-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                <p className="font-bold text-slate-800">{selectedDoc.category}</p>
                            </div>
                            <div className="flex gap-4">
                                <AnimatedButton onClick={() => handleEditDocument(selectedDoc)} variant="secondary" className="flex-1">
                                    <Edit2 className="w-4 h-4" /> Edit
                                </AnimatedButton>
                                <AnimatedButton onClick={() => handleDeleteDocument(selectedDoc.id)} variant="danger" className="flex-1">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, docId: null })}
                variant="danger"
            />

            <FloatingChat />
        </div>
    );
}
