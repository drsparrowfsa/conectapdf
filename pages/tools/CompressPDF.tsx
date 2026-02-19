
import React, { useState } from 'react';
import { Minimize2, Download, Loader2, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import MultiDropzone from '../../components/MultiDropzone';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import Seo from '../../components/Seo';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import { setupPdfWorker } from '../../utils/pdfWorker';

// Configure worker
setupPdfWorker();

type CompressionLevel = 'low' | 'medium' | 'high';

const CompressPDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
    const [progress, setProgress] = useState(0);

    const getCompressionQuality = (level: CompressionLevel) => {
        switch (level) {
            case 'low': return 0.7; // Better quality, less compression
            case 'medium': return 0.5; // Balanced
            case 'high': return 0.3; // Maximum compression, lower quality
            default: return 0.5;
        }
    };

    const handleCompress = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setProgress(0);
        setIsSuccess(false);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();

                // Load PDF with PDF.js to render pages
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const newPdfDoc = await PDFDocument.create();
                const totalPages = pdf.numPages;

                const quality = getCompressionQuality(compressionLevel);

                for (let j = 1; j <= totalPages; j++) {
                    const page = await pdf.getPage(j);
                    const viewport = page.getViewport({ scale: 1.5 }); // Reasonable scale for readability

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) throw new Error('Failed to create canvas context');

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                        canvas: canvas
                    }).promise;

                    // Compress to JPEG
                    const imageBlob = await new Promise<Blob | null>(resolve =>
                        canvas.toBlob(resolve, 'image/jpeg', quality)
                    );

                    if (!imageBlob) throw new Error('Failed to compress page');

                    const imageBytes = await imageBlob.arrayBuffer();
                    const embeddedImage = await newPdfDoc.embedJpg(imageBytes);

                    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                    newPage.drawImage(embeddedImage, {
                        x: 0,
                        y: 0,
                        width: viewport.width,
                        height: viewport.height,
                    });

                    // Update progress (per page estimation)
                    setProgress(Math.round(((i * totalPages + j) / (files.length * totalPages)) * 100));
                }

                const pdfBytes = await newPdfDoc.save();
                const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `comprimido_${file.name}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            setIsSuccess(true);
            toast.success(t('compress.success', 'Arquivos comprimidos com sucesso!'));
        } catch (err) {
            console.error('Error compressing PDF:', err);
            toast.error(t('compress.error'));
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const reset = () => {
        setFiles([]);
        setIsSuccess(false);
        setProgress(0);
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Seo
                title={`${t('compress.title')} - ConectaPDF`}
                description={t('compress.description')}
                url="https://conectapdf.com/compress-pdf"
            />
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Minimize2 size={32} />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{t('compress.title')}</h1>
                    </div>
                    <p className="text-slate-600 text-base sm:text-lg">
                        {t('compress.description')}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    {!isSuccess ? (
                        <div className="p-8">
                            <MultiDropzone
                                files={files}
                                onFilesChange={setFiles}
                                accept="application/pdf"
                            />

                            {/* Compression Level Selector */}
                            {files.length > 0 && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(['low', 'medium', 'high'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setCompressionLevel(level)}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                                ${compressionLevel === level
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}
                                        >
                                            <Settings size={24} className={compressionLevel === level ? 'text-indigo-600' : 'text-slate-400'} />
                                            <span className="font-bold capitalize">{t(`compress.level.${level}`, level)}</span>
                                            <span className="text-xs text-center opacity-80">
                                                {level === 'low' && t('compress.qualityHigh', 'Qualidade Alta')}
                                                {level === 'medium' && t('compress.qualityBalanced', 'Balanceado')}
                                                {level === 'high' && t('compress.qualityLow', 'Compactação Máxima')}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleCompress}
                                disabled={files.length === 0 || isProcessing}
                                className={`w-full mt-8 h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl 
                                    ${files.length === 0 || isProcessing
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200 active:scale-95'
                                    }`}
                            >
                                {isProcessing ? (
                                    <><Loader2 size={24} className="animate-spin" /> {t('compress.processing')} {progress > 0 && `${progress}%`}</>
                                ) : (
                                    <><Minimize2 size={24} /> {t('compress.compressButton')}</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 text-center animate-in zoom-in-95 duration-500 space-y-8">
                            <div className="max-w-md mx-auto">
                                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mx-auto">
                                    <CheckCircle className="text-white" size={32} />
                                </div>
                                <h2 className="text-xl sm:text-3xl font-black text-slate-900 mb-4">{t('compress.success')}</h2>
                                <p className="text-slate-500 font-medium text-lg mb-10">{t('compress.successDescription', 'Seus arquivos foram comprimidos com sucesso!')}</p>
                            </div>

                            <button
                                onClick={reset}
                                className="w-full h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl hover:bg-slate-200 transition-colors"
                            >
                                <Minimize2 size={24} /> {t('compress.compressMore', 'Comprimir mais arquivos')}
                            </button>

                            <Link
                                to="/ferramentas"
                                className="block w-full text-center py-4 text-indigo-600 font-bold hover:underline"
                            >
                                Voltar para Hub
                            </Link>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Qualidade Preservada</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Otimizamos a estrutura interna do PDF para reduzir o tamanho sem comprometer a legibilidade.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Loader2 size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">100% Privado</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Seus arquivos nunca saem do seu navegador. Todo o processamento é feito localmente.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <Download size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Processamento Rápido</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Poderoso motor de processamento client-side para resultados instantâneos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompressPDF;
