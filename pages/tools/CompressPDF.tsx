
import React, { useState } from 'react';
import { Minimize2, Download, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import MultiDropzone from '../../components/MultiDropzone';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const CompressPDF: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompress = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);

                // Simple optimization: saving the document often reduces size 
                // by removing unused objects and optimizing the internal structure.
                const pdfBytes = await pdfDoc.save();

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
        } catch (err) {
            console.error('Error compressing PDF:', err);
            setError(t('compress.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFiles([]);
        setIsSuccess(false);
        setError(null);
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Minimize2 size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('compress.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
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

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                                    <AlertCircle size={20} />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleCompress}
                                disabled={files.length === 0 || isProcessing}
                                className={`
                                    w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl mt-8
                                    ${files.length > 0 && !isProcessing
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200 active:scale-95'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                `}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        {t('compress.processing')}
                                    </>
                                ) : (
                                    <>
                                        <Minimize2 size={24} />
                                        {t('compress.compressButton')}
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                {t('compress.success')}
                            </h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                Seus arquivos foram processados e o download deve começar automaticamente.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={reset}
                                    className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    {t('compress.another')}
                                </button>
                                <Link
                                    to="/ferramentas"
                                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200"
                                >
                                    Voltar para Hub
                                </Link>
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
