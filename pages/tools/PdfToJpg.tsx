
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, Loader2, CheckCircle, AlertCircle, ArrowLeft, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import Dropzone from '../../components/Dropzone';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import Seo from '../../components/Seo';
import { setupPdfWorker } from '../../utils/pdfWorker';
import { toast } from 'sonner';

// Configure worker
setupPdfWorker();

const PdfToJpg: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar' || i18n.language === 'he';
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setComplete(false);
    setProgress({ current: 0, total: 0 });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;
      setProgress({ current: 0, total: totalPages });

      const zip = new JSZip();

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        // Update progress
        setProgress(prev => ({ ...prev, current: pageNum }));

        const page = await pdf.getPage(pageNum);
        const scale = 2; // High quality
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: context.canvas,
          };
          await page.render(renderContext).promise;

          // Convert to blob
          const blob = await new Promise<Blob | null>(resolve =>
            canvas.toBlob(resolve, 'image/jpeg', 0.8)
          );

          if (blob) {
            const fileName = `page_${pageNum}.jpg`;
            zip.file(fileName, blob);
          }
        }
      }

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      setZipUrl(url);
      setComplete(true);

    } catch (err) {
      console.error('Error converting PDF:', err);
      toast.error(t('pdfToJpg.error'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setComplete(false);
    setFile(null);
    setError(null);
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
    setProgress({ current: 0, total: 0 });
  };

  const handleFileSelect = (files: File | File[]) => {
    if (Array.isArray(files)) {
      if (files.length > 0) {
        setFile(files[0]);
      } else {
        setFile(null);
      }
    } else {
      setFile(files);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Seo
        title={`${t('pdfToJpg.title')} - ConectaPDF`}
        description={t('pdfToJpg.description')}
        url="https://conectapdf.com/pdf-to-jpg"
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
              <FileImage size={32} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{t('pdfToJpg.title')}</h1>
          </div>
          <p className="text-slate-600 text-base sm:text-lg">
            {t('pdfToJpg.description')}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
          {!complete ? (
            <>
              <Dropzone
                onFileSelect={handleFileSelect}
                accept="application/pdf"
                title={t('pdfToJpg.dropzoneTitle')}
                subtitle={t('pdfToJpg.dropzoneSubtitle', 'Suporta PDF')}
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
                      {t('pdfToJpg.processing', { current: progress.current, total: progress.total || '...' })}
                    </>
                  ) : (
                    <>
                      <FileImage size={24} />
                      {t('pdfToJpg.convertButton')}
                    </>
                  )}
                </button>

                {loading && progress.total > 0 && (
                  <div className="mt-4 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="animate-in zoom-in duration-300 text-center py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2">{t('pdfToJpg.success')}</h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button
                  onClick={reset}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  {t('pdfToJpg.another')}
                </button>

                {zipUrl && (
                  <a
                    href={zipUrl}
                    download={`converted_images.zip`}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1"
                  >
                    <Download size={24} /> {t('pdfToJpg.download')}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Section - Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ImageIcon size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('pdfToJpg.features.highQuality.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('pdfToJpg.features.highQuality.desc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('pdfToJpg.features.privacy.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('pdfToJpg.features.privacy.desc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <Download size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('pdfToJpg.features.speed.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('pdfToJpg.features.speed.desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToJpg;
