import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileText, X, GripVertical, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MultiDropzoneProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    accept?: string;
}

const MultiDropzone: React.FC<MultiDropzoneProps> = ({ files, onFilesChange, accept = "application/pdf" }) => {
    const { t } = useTranslation();
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === accept || f.name.toLowerCase().endsWith('.pdf'));
            onFilesChange([...files, ...newFiles]);
        }
    }, [files, onFilesChange, accept]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            onFilesChange([...files, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newFiles = [...files];
            [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
            onFilesChange(newFiles);
        } else if (direction === 'down' && index < files.length - 1) {
            const newFiles = [...files];
            [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
            onFilesChange(newFiles);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full space-y-6">
            <div
                className={`relative w-full py-12 px-4 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple
                    onChange={handleChange}
                />

                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-indigo-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('merge.dropzoneTitle')}</h3>
                <p className="text-slate-500 mt-2 font-medium">{t('merge.dropzoneSubtitle')}</p>
            </div>

            {files.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="px-6 py-4 border-bottom border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={18} className="text-indigo-600" />
                            {t('merge.selectedFiles')} ({files.length})
                        </h4>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFilesChange([]); }}
                            className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 size={14} /> {t('merge.clearList')}
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="text-slate-400">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="bg-red-50 p-2 rounded-lg">
                                        <FileText size={20} className="text-red-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate pr-4">{file.name}</p>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{formatSize(file.size)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveFile(index, 'up'); }}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                                        >
                                            <Upload size={14} className="rotate-0" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveFile(index, 'down'); }}
                                            disabled={index === files.length - 1}
                                            className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                                        >
                                            <Upload size={14} className="rotate-180" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiDropzone;
