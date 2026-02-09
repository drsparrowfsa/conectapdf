import React, { useState } from 'react';
import {
    Tags,
    Wand2,
    Loader2,
    AlertCircle,
    CheckCircle,
    FileJson,
    FileText,
    Gavel,
    BadgeDollarSign,
    HeartPulse,
    GraduationCap,
    Info,
    Layout,
    Users,
    ScanSearch,
    Building2,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropzone from '../../components/Dropzone';
import { geminiService } from '../../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import BackButton from '../../components/BackButton';
import Seo from '../../components/Seo';
import { setupPdfWorker } from '../../utils/pdfWorker';
import { toast } from 'sonner';

// Configure worker
setupPdfWorker();

type Category = {
    type: string;
    name: string;
    description: string;
    confidence: number;
    icon: string;
};

type ClassificationResult = {
    categories: Category[];
    tags: string[];
    analysis: string;
};

const iconMap: Record<string, React.ReactNode> = {
    FileText: <FileText className="w-8 h-8" />,
    Gavel: <Gavel className="w-8 h-8" />,
    BadgeDollarSign: <BadgeDollarSign className="w-8 h-8" />,
    HeartPulse: <HeartPulse className="w-8 h-8" />,
    GraduationCap: <GraduationCap className="w-8 h-8" />,
    Layout: <Layout className="w-8 h-8" />,
    Users: <Users className="w-8 h-8" />,
    Info: <Info className="w-8 h-8" />,
};

const getIcon = (iconName: string) => {
    // Normalize icon name or fallback
    const normalized = iconName.replace('lucide-', '').trim();
    return iconMap[normalized] || <Tags className="w-8 h-8" />;
};

const ClassifyPDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState<'extracting' | 'classifying' | null>(null);
    const [result, setResult] = useState<ClassificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const isRtl = i18n.language === 'ar' || i18n.language === 'he';

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
        const maxPages = Math.min(pdf.numPages, 10);

        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + ' ';
        }
        return fullText.trim();
    };

    const handleClassify = async () => {
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

            setLoadingStage('classifying');
            const classification = await geminiService.classifyDocument(text);
            setResult(classification);
        } catch (err: any) {
            console.error('Classification error:', err);
            toast.error(err.message || 'Erro ao classificar documento.');
        } finally {
            setLoading(false);
            setLoadingStage(null);
        }
    };

    const exportToJson = () => {
        if (!result) return;
        const baseName = file ? file.name.replace(/\.[Pp][Dd][Ff]$/, '') : 'document';
        const exportData = {
            filename: file?.name,
            timestamp: new Date().toISOString(),
            classification: result
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseName}_classification.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Seo
                title={`${t('classify.title')} - ConectaPDF`}
                description={t('classify.subtitle')}
                url="https://conectapdf.com/classify-pdf"
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Tags size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('docClassification.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
                        {t('docClassification.subtitle')}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Dropzone
                        onFileSelect={handleFileSelect}
                        accept="application/pdf"
                        title={t('docClassification.dropzone')}
                    />

                    {!result && (
                        <div className="mt-8">
                            <button
                                onClick={handleClassify}
                                disabled={!file || loading}
                                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-md
                  ${!file || loading
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:-translate-y-1 shadow-indigo-100'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {loadingStage === 'extracting' ? 'Lendo PDF...' : t('docClassification.processing')}
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={24} /> {t('docClassification.classify')}
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
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div className="flex items-center gap-3 text-indigo-600">
                                    <CheckCircle size={24} />
                                    <h2 className="text-2xl font-bold text-slate-900">{t('docClassification.success')}</h2>
                                </div>
                                <button
                                    onClick={exportToJson}
                                    className="w-full sm:w-auto p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 font-bold"
                                >
                                    <FileJson size={18} /> {t('docClassification.export')}
                                </button>
                            </div>

                            {/* Categories Grid */}
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{t('docClassification.categoriesTitle')}</h3>
                            <div className="grid gap-4 mb-10">
                                {result.categories.map((cat, idx) => (
                                    <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600 shrink-0">
                                                {getIcon(cat.icon)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">{cat.name}</h4>
                                                <p className="text-slate-500 text-sm">{cat.description}</p>
                                            </div>
                                        </div>
                                        <div className={`flex flex-col md:items-end shrink-0 ${isRtl ? 'md:border-r md:pr-6' : 'md:border-l md:pl-6'} border-slate-200`}>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-2xl font-black ${cat.confidence >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {cat.confidence}%
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('docClassification.confidence')}</span>
                                            </div>
                                            <div className="w-full md:w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${cat.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${cat.confidence}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tags Section */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 mb-10 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Tags size={20} className="text-indigo-600" />
                                    {t('docClassification.tagsTitle')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.tags.map((tag, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100/50">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Analysis Section */}
                            <div className="bg-slate-900 text-slate-50 rounded-3xl p-8 mb-10 shadow-xl shadow-indigo-900/10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-300">
                                    <Info size={20} />
                                    {t('docClassification.analysisTitle')}
                                </h3>
                                <div className="prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed text-lg">
                                    {result.analysis}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 text-center">
                                <button
                                    onClick={() => { setResult(null); setFile(null); }}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    {t('ocr.another')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Feature Cards Grid */}
                {!result && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <ScanSearch size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{t('docClassification.features.type.title')}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {t('docClassification.features.type.desc')}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Building2 size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{t('docClassification.features.sector.title')}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {t('docClassification.features.sector.desc')}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{t('docClassification.features.insight.title')}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {t('docClassification.features.insight.desc')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassifyPDF;

