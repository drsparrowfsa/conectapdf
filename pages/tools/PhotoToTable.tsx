import React, { useState } from 'react';
import { Table, Wand2, Loader2, AlertCircle, Copy, Download, Cpu, Activity, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { useTranslation } from 'react-i18next';
import Dropzone from '../../components/Dropzone';
import { geminiService } from '../../services/geminiService';

const PhotoToTable: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar' || i18n.language === 'he';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const markdown = await geminiService.extractTableFromImage(base64, selectedFile.type);
          setResult(markdown);
        } catch (err: any) {
          setError(err.message || t('common.error'));
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert(t('photoToTable.copied'));
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
              <Table size={32} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('photoToTable.title')}</h1>
          </div>
          <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
            {t('photoToTable.subtitle')}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <Dropzone
            onFileSelect={handleFileSelect}
            accept="image/*"
            title={t('photoToTable.dropzone')}
          />

          <div className="mt-8">
            <button
              onClick={processImage}
              disabled={!selectedFile || loading}
              className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl 
              ${!selectedFile || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> {t('photoToTable.processing')}
                </>
              ) : (
                <>
                  <Wand2 /> {t('photoToTable.extract')}
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle /> {error}
            </div>
          )}

          {result && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('photoToTable.success')}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Copy size={16} /> {t('photoToTable.copy')}
                  </button>
                </div>
              </div>
              <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto">
                <pre className="font-mono text-sm whitespace-pre-wrap">{result}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Cpu size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('photoToTable.features.ai.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{t('photoToTable.features.ai.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Activity size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('photoToTable.features.precision.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{t('photoToTable.features.precision.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <Share2 size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('photoToTable.features.export.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{t('photoToTable.features.export.desc')}</p>
          </div>
        </div>


      </div>
    </div>
  );
};

export default PhotoToTable;
