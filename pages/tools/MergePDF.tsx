import React, { useState } from 'react';
import { Merge, Download, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import MultiDropzone from '../../components/MultiDropzone';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/BackButton';
import Seo from '../../components/Seo';
import { toast } from 'sonner';

const MergePDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);

    const handleMerge = async () => {
        if (files.length < 2) return;

        setLoading(true);
        setError(null);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            setMergedBlobUrl(url);
            setComplete(true);
        } catch (err) {
            console.error('Error merging PDFs:', err);
            toast.error(t('merge.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (mergedBlobUrl) {
            const a = document.createElement('a');
            a.href = mergedBlobUrl;
            a.download = 'PDFs_Unidos_ConectaPDF.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const reset = () => {
        setComplete(false);
        setFiles([]);
        setError(null);
        if (mergedBlobUrl) {
            URL.revokeObjectURL(mergedBlobUrl);
            setMergedBlobUrl(null);
        }
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Seo
                title={`${t('merge.title')} - ConectaPDF`}
                description={t('merge.description')}
                url="https://conectapdf.com/merge-pdf"
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Merge size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('merge.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
                        {t('merge.description')}
                    </p>
                </div>

                <div className="bg-white p-1 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 overflow-hidden">
                    {!complete ? (
                        <div className="space-y-8 p-6 md:p-0">
                            <MultiDropzone
                                files={files}
                                onFilesChange={setFiles}
                                accept="application/pdf"
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in duration-300">
                                    <AlertCircle size={20} />
                                    <p className="font-bold">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleMerge}
                                disabled={files.length < 2 || loading}
                                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl 
                ${files.length < 2 || loading
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200 active:scale-95'
                                    }`}
                            >
                                {loading ? (
                                    <><Loader2 size={24} className="animate-spin" /> {t('merge.processing')}</>
                                ) : (
                                    <><Merge size={24} /> {t('merge.mergeButton')}</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 text-center animate-in zoom-in-95 duration-500 space-y-8">
                            <div className="max-w-md mx-auto">
                                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mx-auto">
                                    <Merge className="text-white" size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4">{t('merge.success')}</h2>
                                <p className="text-slate-500 font-medium text-lg mb-10">{t('merge.description')}</p>
                            </div>

                            <div className="space-y-4 max-w-sm mx-auto">
                                <button
                                    onClick={handleDownload}
                                    className="w-full h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xl hover:bg-indigo-700 hover:-translate-y-1 shadow-2xl shadow-indigo-200 transition-all active:scale-95"
                                >
                                    <Download size={24} /> {t('merge.download')}
                                </button>

                                <button
                                    onClick={reset}
                                    className="w-full py-4 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                                >
                                    {t('merge.another')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('merge.features.perfect.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('merge.features.perfect.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Loader2 size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('merge.features.privacy.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('merge.features.privacy.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <Download size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('merge.features.speed.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('merge.features.speed.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MergePDF;
