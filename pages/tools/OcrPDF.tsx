
import React, { useState } from 'react';
import { ScanText, Copy, Loader2, CheckCircle, ArrowLeft, FileImage, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Dropzone from '../../components/Dropzone';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const OcrPDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);

    const handleProcess = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setComplete(false);
        setExtractedText('');
        setProgress(0);

        try {
            let imageData: any;

            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

                // For now, we process only the first page to keep it fast and simple
                // like the legacy version, but we can iterate if needed.
                const page = await pdf.getPage(1);
                const scale = 2.0;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Could not create canvas context');

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                    canvas: context.canvas
                };
                await page.render(renderContext).promise;

                imageData = canvas;
            } else {
                // Image files
                imageData = file;
            }

            const { data: { text } } = await Tesseract.recognize(
                imageData,
                'por+eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            setExtractedText(text);
            setComplete(true);

        } catch (err: any) {
            console.error('Error during OCR:', err);
            setError(err.message || 'Erro ao extrair texto do arquivo.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (extractedText) {
            navigator.clipboard.writeText(extractedText);
            // We could add a toast here if available, but for now simple feedback
        }
    };

    const reset = () => {
        setComplete(false);
        setFile(null);
        setError(null);
        setExtractedText('');
        setProgress(0);
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/ferramentas"
                        className={`inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-4 group ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                        <ArrowLeft size={18} className={`${isRtl ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
                        {t('placeholder.back')}
                    </Link>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <ScanText size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('ocr.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
                        {t('ocr.description')}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    {!complete ? (
                        <>
                            <Dropzone
                                onFileSelect={(f) => setFile(Array.isArray(f) ? f[0] : f)}
                                accept="application/pdf,image/*"
                                title={t('ocr.dropzoneTitle')}
                                subtitle={t('ocr.dropzoneSubtitle', 'Suporta PDF, JPG, PNG e WEBP')}
                            />

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="mt-8">
                                <button
                                    onClick={handleProcess}
                                    disabled={!file || loading}
                                    className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl 
                        ${!file || loading
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200 active:scale-95'}`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            {t('ocr.processing', { progress })}
                                        </>
                                    ) : (
                                        <>
                                            <ScanText size={24} />
                                            {t('ocr.extractButton')}
                                        </>
                                    )}
                                </button>

                                {loading && (
                                    <div className="mt-4 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="animate-in zoom-in duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3 text-green-600">
                                    <CheckCircle size={24} />
                                    <h2 className="text-2xl font-bold text-slate-900">{t('ocr.success')}</h2>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold"
                                >
                                    <Copy size={18} /> {t('ocr.copyButton')}
                                </button>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono text-slate-700 leading-relaxed">
                                {extractedText || t('ocr.noneDetected')}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <button
                                    onClick={reset}
                                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    {t('ocr.another')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                {/* Info Section - Feature Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('ocr.features.accuracy.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('ocr.features.accuracy.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('ocr.features.privacy.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('ocr.features.privacy.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <ScanText size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('ocr.features.smart.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('ocr.features.smart.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OcrPDF;
