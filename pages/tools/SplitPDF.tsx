import React, { useState } from 'react';
import { Scissors, FileText, Hash, List, Columns4, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import Dropzone from '../../components/Dropzone';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';
import Seo from '../../components/Seo';
import { toast } from 'sonner';

type SplitMode = 'pages' | 'range' | 'specific';

const SplitPDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [mode, setMode] = useState<SplitMode>('pages');

    // Options state
    const [pagesPerFile, setPagesPerFile] = useState(1);
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(1);
    const [specificPages, setSpecificPages] = useState('');

    const handleFileSelect = async (files: File | File[]) => {
        const selectedFile = Array.isArray(files) ? files[0] : files;
        if (!selectedFile) {
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
        setComplete(false);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const count = pdf.getPageCount();
            setTotalPages(count);
            setEndPage(count);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError(t('split.error'));
            setFile(null);
        }
    };

    const parsePageNumbers = (str: string, maxPages: number): number[] => {
        if (!str.trim()) return [];
        const parts = str.split(',');
        let pages: number[] = [];

        for (let part of parts) {
            part = part.trim();
            if (/^\d+$/.test(part)) {
                const n = parseInt(part);
                if (n >= 1 && n <= maxPages) pages.push(n - 1);
            } else if (/^(\d+)-(\d+)$/.test(part)) {
                let [start, end] = part.split('-').map(Number);
                if (start > end) [start, end] = [end, start];
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= maxPages) pages.push(i - 1);
                }
            }
        }
        return Array.from(new Set(pages)).sort((a, b) => a - b);
    };

    const downloadBlob = (bytes: Uint8Array, filename: string) => {
        const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleSplit = async () => {
        if (!file || !totalPages) return;

        setLoading(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadedPdf = await PDFDocument.load(arrayBuffer);
            const fileNameBase = file.name.replace(/\.pdf$/i, '');

            if (mode === 'pages') {
                const perFile = Math.max(1, pagesPerFile);
                for (let i = 0; i < totalPages; i += perFile) {
                    const newPdf = await PDFDocument.create();
                    const end = Math.min(i + perFile, totalPages);
                    const pageIndices = Array.from({ length: end - i }, (_, idx) => i + idx);
                    const copiedPages = await newPdf.copyPages(loadedPdf, pageIndices);
                    copiedPages.forEach(page => newPdf.addPage(page));
                    const bytes = await newPdf.save();
                    downloadBlob(bytes, `${fileNameBase}_part_${Math.floor(i / perFile) + 1}.pdf`);
                }
            } else if (mode === 'range') {
                const s = Math.max(1, startPage) - 1;
                const e = Math.min(totalPages, endPage) - 1;
                if (s > e) throw new Error('Range start must be less than end');

                const newPdf = await PDFDocument.create();
                const pageIndices = Array.from({ length: e - s + 1 }, (_, i) => s + i);
                const copiedPages = await newPdf.copyPages(loadedPdf, pageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));
                const bytes = await newPdf.save();
                downloadBlob(bytes, `${fileNameBase}_${s + 1}-${e + 1}.pdf`);
            } else if (mode === 'specific') {
                const pageIndices = parsePageNumbers(specificPages, totalPages);
                if (pageIndices.length === 0) throw new Error('No valid pages selected');

                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(loadedPdf, pageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));
                const bytes = await newPdf.save();
                downloadBlob(bytes, `${fileNameBase}_selected.pdf`);
            }

            setComplete(true);
        } catch (err: any) {
            console.error('Error splitting PDF:', err);
            toast.error(err.message || t('split.error'));
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setComplete(false);
        setFile(null);
        setTotalPages(0);
        setError(null);
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Seo
                title={`${t('split.title')} - ConectaPDF`}
                description={t('split.description')}
                url="https://conectapdf.com/split-pdf"
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Scissors size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('split.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
                        {t('split.description')}
                    </p>
                </div>

                <div className="bg-white p-1 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 overflow-hidden">
                    {!complete ? (
                        <div className="space-y-8 p-6 md:p-0">
                            <Dropzone
                                onFileSelect={handleFileSelect}
                                accept="application/pdf"
                                title={file ? file.name : t('split.dropzoneTitle')}
                                subtitle={t('split.dropzoneSubtitle', 'Suporta apenas PDF')}
                            />

                            {file && (
                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                                        <FileText className="text-red-500" />
                                        {t('split.optionsTitle')} ({totalPages} {totalPages === 1 ? 'página' : 'páginas'})
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(['pages', 'range', 'specific'] as SplitMode[]).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 group
                        ${mode === m
                                                        ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100'
                                                        : 'border-slate-100 hover:border-slate-200 bg-white'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                        ${mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                    {m === 'pages' && <Hash size={20} />}
                                                    {m === 'range' && <Columns4 size={20} />}
                                                    {m === 'specific' && <List size={20} />}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${mode === m ? 'text-indigo-900' : 'text-slate-900'}`}>{t(`split.mode${m.charAt(0).toUpperCase() + m.slice(1)}`)}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                        {mode === 'pages' && (
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-slate-700">{t('split.pagesPerFile')}:</span>
                                                <input
                                                    type="number"
                                                    value={pagesPerFile}
                                                    onChange={(e) => setPagesPerFile(parseInt(e.target.value) || 1)}
                                                    min="1"
                                                    max={totalPages}
                                                    className="w-24 h-12 rounded-xl border border-slate-200 px-4 font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        )}

                                        {mode === 'range' && (
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-700">{t('split.fromPage')}:</span>
                                                    <input
                                                        type="number"
                                                        value={startPage}
                                                        onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                                                        min="1"
                                                        max={totalPages}
                                                        className="w-24 h-12 rounded-xl border border-slate-200 px-4 font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-700">{t('split.toPage')}:</span>
                                                    <input
                                                        type="number"
                                                        value={endPage}
                                                        onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                                                        min="1"
                                                        max={totalPages}
                                                        className="w-24 h-12 rounded-xl border border-slate-200 px-4 font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {mode === 'specific' && (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={specificPages}
                                                    onChange={(e) => setSpecificPages(e.target.value)}
                                                    placeholder={t('split.specificLabel')}
                                                    className="w-full h-14 rounded-xl border border-slate-200 px-6 font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <p className="text-sm font-semibold text-slate-500">{t('split.specificHint')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in duration-300">
                                    <AlertCircle size={20} />
                                    <p className="font-bold">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSplit}
                                disabled={!file || loading}
                                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl 
                ${!file || loading
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200 active:scale-95'
                                    }`}
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" /> {t('split.processing')}</>
                                ) : (
                                    <><Scissors /> {t('split.splitButton')}</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 text-center animate-in zoom-in-95 duration-500 space-y-8">
                            <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <CheckCircle className="text-green-600 w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4">{t('split.success')}</h2>
                                <p className="text-slate-500 font-medium text-lg mb-10">{t('split.description')}</p>
                            </div>

                            <div className="space-y-4 max-w-sm mx-auto">
                                <button
                                    onClick={reset}
                                    className="w-full h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xl hover:bg-indigo-700 hover:-translate-y-1 shadow-2xl shadow-indigo-200 transition-all active:scale-95"
                                >
                                    {t('split.another')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Section - Feature Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Columns4 size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('split.features.precision.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('split.features.precision.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('split.features.privacy.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('split.features.privacy.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <Download size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('split.features.speed.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('split.features.speed.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitPDF;
