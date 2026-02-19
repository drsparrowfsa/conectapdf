import React, { useState } from 'react';
import { FileText, Wand2, Loader2, AlertCircle, Copy, CheckCircle, Brain, Clock, Target, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropzone from '../../components/Dropzone';
import { geminiService, SummaryType } from '../../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import BackButton from '../../components/BackButton';
import Seo from '../../components/Seo';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { setupPdfWorker } from '../../utils/pdfWorker';
import { toast } from 'sonner';

// Configure worker
setupPdfWorker();

const SummarizePDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState<'extracting' | 'summarizing' | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [summaryType, setSummaryType] = useState<SummaryType>('executive');

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile) {
            setFile(null);
            setResult(null);
            setError(null);
            return;
        }

        if (selectedFile.type !== 'application/pdf') {
            setError(t('aiSummary.error'));
            return;
        }
        setFile(selectedFile);
        setError(null);
        setResult(null);
    };

    const extractText = async (pdfFile: File): Promise<string> => {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        // Limit max pages to 15 to avoid context limits and keep it fast
        const maxPages = Math.min(pdf.numPages, 15);

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + ' ';
        }

        return fullText.trim();
    };

    const handleGenerateSummary = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            setLoadingStage('extracting');
            const text = await extractText(file);

            if (!text || text.length < 10) {
                if (!text || text.length < 10) {
                    throw new Error(t('aiSummary.errorExtract'));
                }
            }

            setLoadingStage('summarizing');
            const summary = await geminiService.summarizePDF(text, summaryType);
            setResult(summary);
        } catch (err: any) {
            console.error('Summarize error:', err);
            toast.error(err.message || t('common.error'));
        } finally {
            setLoading(false);
            setLoadingStage(null);
        }
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            // In a real app we'd use a toast, but keeping consistent with OcrPDF pattern
        }
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Seo
                title={`${t('aiSummary.title')} - ConectaPDF`}
                description={t('aiSummary.subtitle')}
                url="https://conectapdf.com/ai-summary"
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <FileText size={32} />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{t('aiSummary.title')}</h1>
                    </div>
                    <p className="text-slate-600 text-base sm:text-lg">
                        {t('aiSummary.subtitle')}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Dropzone
                        onFileSelect={handleFileSelect}
                        accept="application/pdf"
                        title={t('aiSummary.dropzone')}
                        subtitle={t('aiSummary.dropzoneSubtitle')}
                    />

                    {!result && (
                        <div className="mt-8 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('aiSummary.optionsTitle')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(['executive', 'detailed', 'bullet'] as SummaryType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSummaryType(type)}
                                        className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm
                      ${summaryType === type
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                    >
                                        {t(`aiSummary.${type}`)}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={!file || loading}
                                    className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-md
                    ${!file || loading
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:-translate-y-1 shadow-indigo-100 active:scale-95'}`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            {loadingStage === 'extracting' ? t('aiSummary.extracting') : t('aiSummary.summarizing')}
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={24} /> {t('aiSummary.generate')}
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-slate-400 text-xs mt-4">
                                    {t('aiSummary.limitInfo')}
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium flex gap-3 items-start">
                            <AlertCircle className="shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3 text-green-600">
                                    <CheckCircle size={24} />
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('aiSummary.success')}</h2>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold"
                                >
                                    <Copy size={18} /> {t('aiSummary.copy')}
                                </button>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative group min-h-[200px]">
                                <MarkdownRenderer content={result} className="text-base sm:text-lg" />
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => { setResult(null); setFile(null); }}
                                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    {t('ocr.another')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info panel */}
                {/* Info Section - Feature Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('aiSummary.features.efficiency.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('aiSummary.features.efficiency.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Target size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('aiSummary.features.focus.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('aiSummary.features.focus.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <Shield size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('aiSummary.features.privacy.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('aiSummary.features.privacy.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummarizePDF;
