import React, { useState } from 'react';
import {
    Languages,
    Wand2,
    Loader2,
    AlertCircle,
    Copy,
    CheckCircle,
    FileDown,
    FileText as FileIcon,
    Globe,
    Sparkles,
    LayoutTemplate,
    Languages as LanguagesIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropzone from '../../components/Dropzone';
import { geminiService } from '../../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import BackButton from '../../components/BackButton';

// Configure worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const TranslatePDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState<'extracting' | 'translating' | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [targetLanguage, setTargetLanguage] = useState('en');

    const languages = [
        { code: 'pt', name: t('pdfTranslation.languages.pt') },
        { code: 'en', name: t('pdfTranslation.languages.en') },
        { code: 'es', name: t('pdfTranslation.languages.es') },
        { code: 'ar', name: t('pdfTranslation.languages.ar') },
        { code: 'he', name: t('pdfTranslation.languages.he') },
    ];

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile) {
            setFile(null);
            setResult(null);
            setError(null);
            return;
        }

        if (selectedFile.type !== 'application/pdf') {
            setError('Por favor, selecione um arquivo PDF.');
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

        // Limit pages for speed and context window
        const maxPages = Math.min(pdf.numPages, 10);

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText.trim();
    };

    const handleTranslate = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            setLoadingStage('extracting');
            const text = await extractText(file);

            if (!text || text.length < 10) {
                throw new Error('Não foi possível extrair texto legível deste PDF.');
            }

            setLoadingStage('translating');
            const translated = await geminiService.translatePDFText(text, targetLanguage);
            setResult(translated);
        } catch (err: any) {
            console.error('Translation error:', err);
            setError(err.message || 'Erro ao traduzir documento.');
        } finally {
            setLoading(false);
            setLoadingStage(null);
        }
    };

    const downloadAsPDF = () => {
        if (!result) return;

        try {
            const doc = new jsPDF();
            const baseName = file ? file.name.replace(/\.[Pp][Dd][Ff]$/, '') : 'document';

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);

            const lines = doc.splitTextToSize(result, 180);
            let y = 20;
            const lineHeight = 7;

            lines.forEach((line: string) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 15, y);
                y += lineHeight;
            });

            doc.save(`${baseName}_translated_${targetLanguage}.pdf`);
        } catch (e) {
            console.error("PDF generation failed", e);
            downloadAsTxt();
        }
    };

    const downloadAsTxt = () => {
        if (!result) return;
        const baseName = file ? file.name.replace(/\.[Pp][Dd][Ff]$/, '') : 'document';
        const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseName}_translated_${targetLanguage}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
        }
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Languages size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('pdfTranslation.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
                        {t('pdfTranslation.subtitle')}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Dropzone
                        onFileSelect={handleFileSelect}
                        accept="application/pdf"
                        title={t('pdfTranslation.dropzone')}
                    />

                    {!result && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('pdfTranslation.optionsTitle')}</h3>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    {t('pdfTranslation.targetLang')}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setTargetLanguage(lang.code)}
                                            className={`p-3 rounded-xl border-2 transition-all font-bold text-sm flex flex-col items-center gap-2
                        ${targetLanguage === lang.code
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                        >
                                            <Globe size={18} className={targetLanguage === lang.code ? 'text-indigo-600' : 'text-slate-400'} />
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleTranslate}
                                disabled={!file || loading}
                                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-md
                  ${!file || loading
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:-translate-y-1 shadow-indigo-100'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {loadingStage === 'extracting' ? 'Lendo PDF...' : t('pdfTranslation.translating')}
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={24} /> {t('pdfTranslation.translate')}
                                    </>
                                )}
                            </button>
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
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-3 text-green-600">
                                    <CheckCircle size={24} />
                                    <h2 className="text-2xl font-bold text-slate-900">{t('pdfTranslation.success')}</h2>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    {['pt', 'en', 'es'].includes(targetLanguage) && (
                                        <button
                                            onClick={downloadAsPDF}
                                            className="flex-1 sm:flex-none p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-bold shadow-md shadow-indigo-100"
                                        >
                                            <FileDown size={18} /> PDF
                                        </button>
                                    )}
                                    <button
                                        onClick={downloadAsTxt}
                                        className="flex-1 sm:flex-none p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 font-bold"
                                    >
                                        <FileIcon size={18} /> TXT
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex-1 sm:flex-none p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Copy size={18} /> {t('pdfTranslation.copy')}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative group min-h-[300px] max-h-[600px] overflow-y-auto">
                                <div className={`prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-sans text-lg ${['ar', 'he'].includes(targetLanguage) ? 'text-right' : 'text-left'}`} dir={['ar', 'he'].includes(targetLanguage) ? 'rtl' : 'ltr'}>
                                    {result}
                                </div>
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

                {/* Feature Cards Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('pdfTranslation.features.accuracy.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('pdfTranslation.features.accuracy.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <LayoutTemplate size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('pdfTranslation.features.format.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('pdfTranslation.features.format.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <LanguagesIcon size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('pdfTranslation.features.multilingual.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('pdfTranslation.features.multilingual.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranslatePDF;
