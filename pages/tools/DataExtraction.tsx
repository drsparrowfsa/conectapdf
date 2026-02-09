import React, { useState } from 'react';
import {
    FileText,
    Search,
    Loader2,
    AlertCircle,
    Copy,
    CheckCircle,
    Database,
    Mail,
    Phone,
    Calendar,
    Hash,
    MapPin,
    User,
    FileSpreadsheet,
    FileJson,
    Files,
    Zap,
    Target,
    Shield
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

type ExtractionType = 'emails' | 'phones' | 'dates' | 'numbers' | 'addresses' | 'names';

const DataExtraction: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState<'extracting' | 'analyzing' | null>(null);
    const [result, setResult] = useState<Record<string, string[]> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<ExtractionType[]>(['emails', 'phones', 'dates', 'numbers']);

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile) {
            setFile(null);
            setResult(null);
            setError(null);
            return;
        }

        if (selectedFile.type !== 'application/pdf') {
            setError(t('dataExtraction.error'));
            return;
        }
        setFile(selectedFile);
        setError(null);
        setResult(null);
    };

    const toggleType = (type: ExtractionType) => {
        if (selectedTypes.includes(type)) {
            setSelectedTypes(selectedTypes.filter(t => t !== type));
        } else {
            setSelectedTypes([...selectedTypes, type]);
        }
    };

    const extractText = async (pdfFile: File): Promise<string> => {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        const maxPages = Math.min(pdf.numPages, 10); // Limit items for speed

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

    const handleExtract = async () => {
        if (!file || selectedTypes.length === 0) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            setLoadingStage('extracting');
            const text = await extractText(file);

            if (!text || text.length < 10) {
                if (!text || text.length < 10) {
                    throw new Error(t('dataExtraction.errorExtract'));
                }
            }

            setLoadingStage('analyzing');
            const data = await geminiService.extractDataFromText(text, selectedTypes);
            setResult(data);
        } catch (err: any) {
            console.error('Extraction error:', err);
            toast.error(err.message || t('common.error'));
        } finally {
            setLoading(false);
            setLoadingStage(null);
        }
    };

    const exportToFormat = (format: 'csv' | 'json') => {
        if (!result) return;

        let content = '';
        let fileName = `extração_${new Date().getTime()}`;
        let mimeType = '';

        if (format === 'csv') {
            content = 'Categoria,Valor\n';
            Object.entries(result).forEach(([category, values]) => {
                values.forEach(val => {
                    content += `${category},"${val.replace(/"/g, '""')}"\n`;
                });
            });
            fileName += '.csv';
            mimeType = 'text/csv';
        } else {
            content = JSON.stringify(result, null, 2);
            fileName += '.json';
            mimeType = 'application/json';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        }
    };

    const typeIcons: Record<ExtractionType, React.ReactNode> = {
        emails: <Mail size={18} />,
        phones: <Phone size={18} />,
        dates: <Calendar size={18} />,
        numbers: <Hash size={18} />,
        addresses: <MapPin size={18} />,
        names: <User size={18} />
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Seo
                title={`${t('dataExtraction.title')} - ConectaPDF`}
                description={t('dataExtraction.subtitle')}
                url="https://conectapdf.com/data-extraction"
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Database size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('dataExtraction.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
                        {t('dataExtraction.subtitle')}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <Dropzone
                        onFileSelect={handleFileSelect}
                        accept="application/pdf"
                        title={t('dataExtraction.dropzone')}
                    />

                    {!result && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('dataExtraction.optionsTitle')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(Object.keys(typeIcons) as ExtractionType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleType(type)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm
                      ${selectedTypes.includes(type)
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                                    >
                                        <span className={selectedTypes.includes(type) ? 'text-indigo-600' : 'text-slate-400'}>
                                            {typeIcons[type]}
                                        </span>
                                        {t(`dataExtraction.types.${type}`)}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleExtract}
                                disabled={!file || loading || selectedTypes.length === 0}
                                className={`w-full mt-8 h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-md
                  ${!file || loading || selectedTypes.length === 0
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:-translate-y-1 shadow-indigo-100'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {loadingStage === 'extracting' ? 'Lendo PDF...' : 'Analisando com IA...'}
                                    </>
                                ) : (
                                    <>
                                        <Search size={24} /> {t('dataExtraction.extract')}
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
                                <div className="flex items-center gap-3 text-green-600">
                                    <CheckCircle size={24} />
                                    <h2 className="text-2xl font-bold text-slate-900">{t('dataExtraction.success')}</h2>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => exportToFormat('csv')}
                                        className="flex-1 sm:flex-none p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                                    >
                                        <FileSpreadsheet size={16} /> CSV
                                    </button>
                                    <button
                                        onClick={() => exportToFormat('json')}
                                        className="flex-1 sm:flex-none p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                                    >
                                        <FileJson size={16} /> JSON
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex-1 sm:flex-none p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                                    >
                                        <Copy size={16} /> {t('dataExtraction.copy')}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(result).map(([category, values]) => (
                                    <div key={category} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 capitalize">
                                            {category === 'emails' && <Mail size={20} className="text-indigo-500" />}
                                            {category === 'phones' && <Phone size={20} className="text-indigo-500" />}
                                            {category === 'dates' && <Calendar size={20} className="text-indigo-500" />}
                                            {category === 'numbers' && <Hash size={20} className="text-indigo-500" />}
                                            {category === 'addresses' && <MapPin size={20} className="text-indigo-500" />}
                                            {category === 'names' && <User size={20} className="text-indigo-500" />}
                                            {t(`dataExtraction.types.${category}`) || category}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {values.map((val, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-slate-600 font-mono text-sm break-all">
                                                    {val}
                                                </div>
                                            ))}
                                            {values.length === 0 && (
                                                <div className="text-slate-400 italic text-sm">Nenhum dado encontrado.</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { setResult(null); setFile(null); }}
                                className="w-full mt-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                <Files size={18} className="inline mr-2" />
                                {t('ocr.another')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Feature Cards Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Zap size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('dataExtraction.features.efficiency.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('dataExtraction.features.efficiency.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Target size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('dataExtraction.features.precision.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('dataExtraction.features.precision.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <Shield size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('dataExtraction.features.privacy.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('dataExtraction.features.privacy.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataExtraction;
