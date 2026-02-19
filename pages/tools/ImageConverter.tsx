import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Download, Loader2, CheckCircle, RefreshCw, Sliders, Maximize2, RotateCw, Filter, Copy, AlertCircle, X, ChevronDown, ChevronUp, Layers, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { useTranslation } from 'react-i18next';
import Dropzone from '../../components/Dropzone';
import Seo from '../../components/Seo';
import { toast } from 'sonner';

type ResizeMode = 'none' | 'percentage' | 'fixed' | 'preset';

interface ResizeSettings {
  mode: ResizeMode;
  percentage: number;
  width: number;
  height: number;
  maintainAspect: boolean;
  preset: string;
}

interface FilterSettings {
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  blur: boolean;
}

interface ConvertedImage {
  id: string;
  originalName: string;
  convertedName: string;
  url: string;
  originalSize: number;
  convertedSize: number;
}

const ImageConverter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar' || i18n.language === 'he';

  // Basic State
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(85);

  // Advanced State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rotation, setRotation] = useState<number>(0);
  const [resize, setResize] = useState<ResizeSettings>({
    mode: 'none',
    percentage: 50,
    width: 1920,
    height: 1080,
    maintainAspect: true,
    preset: '1920x1080'
  });
  const [filters, setFilters] = useState<FilterSettings>({
    grayscale: false,
    sepia: false,
    invert: false,
    blur: false
  });

  // Processing State
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ConvertedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (newFiles: File | File[]) => {
    const fileArray = Array.isArray(newFiles) ? newFiles : [newFiles];

    // If empty array, it's a reset signal from Dropzone's clear action
    if (fileArray.length === 0) {
      setFiles([]);
      setResults([]);
      setError(null);
      return;
    }

    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'));

    if (files.length + imageFiles.length > 20) {
      setError(t('imageConverter.maxFiles', { limit: 20 }));
      return;
    }

    setFiles(prev => [...prev, ...imageFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length <= 1) setResults([]);
  };

  const getConvertedFileName = (originalName: string, mimeType: string) => {
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
    return `${nameWithoutExt}.${extension}`;
  };

  const processImage = (file: File, format: string, quality: number): Promise<ConvertedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        let { width, height } = img;

        // Apply Resize Logic
        if (resize.mode === 'percentage') {
          width = Math.round(width * (resize.percentage / 100));
          height = Math.round(height * (resize.percentage / 100));
        } else if (resize.mode === 'fixed') {
          if (resize.maintainAspect) {
            const ratio = img.width / img.height;
            if (resize.width / resize.height > ratio) {
              height = resize.height;
              width = Math.round(height * ratio);
            } else {
              width = resize.width;
              height = Math.round(width / ratio);
            }
          } else {
            width = resize.width;
            height = resize.height;
          }
        } else if (resize.mode === 'preset') {
          const [pWidth, pHeight] = resize.preset.split('x').map(Number);
          const ratio = img.width / img.height;
          const pRatio = pWidth / pHeight;
          if (pRatio > ratio) {
            height = pHeight;
            width = Math.round(height * ratio);
          } else {
            width = pWidth;
            height = Math.round(width / ratio);
          }
        }

        // Adjust for Rotation
        const isVerticalRotation = rotation === 90 || rotation === 270;
        canvas.width = isVerticalRotation ? height : width;
        canvas.height = isVerticalRotation ? width : height;

        // Apply Transformation
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();

        // Apply Filters
        let filterString = '';
        if (filters.grayscale) filterString += 'grayscale(100%) ';
        if (filters.sepia) filterString += 'sepia(100%) ';
        if (filters.invert) filterString += 'invert(100%) ';
        if (filters.blur) filterString += 'blur(2px) ';

        if (filterString) {
          ctx.filter = filterString.trim();
          ctx.drawImage(canvas, 0, 0);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const convertedName = getConvertedFileName(file.name, format);
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              originalName: file.name,
              convertedName: convertedName,
              url: URL.createObjectURL(blob),
              originalSize: file.size,
              convertedSize: blob.size
            });
          } else {
            reject(new Error('Blob generation failed'));
          }
        }, format, quality / 100);
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleBatchProcess = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setResults([]);
    setError(null);

    const newResults: ConvertedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await processImage(files[i], targetFormat, quality);
        newResults.push(result);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        console.error('Error processing file:', files[i].name, err);
        toast.error(t('common.error'));
      }
    }

    setResults(newResults);
    setProcessing(false);
  };

  const downloadAll = () => {
    results.forEach((res, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = res.url;
        link.download = res.convertedName;
        link.click();
      }, index * 200);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <Seo
        title={`${t('imageConverter.title')} - ConectaPDF`}
        description={t('imageConverter.subtitle')}
        url="https://conectapdf.com/image-converter"
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
              <ImageIcon size={32} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{t('imageConverter.title')}</h1>
          </div>
          <p className="text-slate-600 text-base sm:text-lg">
            {t('imageConverter.subtitle')}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          {/* Dropzone & File List */}
          <div className="mb-8">
            <Dropzone
              onFileSelect={handleFileSelect}
              accept="image/*"
              multiple={true}
              fileCount={files.length}
              title={t('imageConverter.dropzone')}
              subtitle={t('imageConverter.maxFiles', { limit: 20 })}
            />
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="relative group aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Format & Quality */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                  {t('imageConverter.formatLabel')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'JPG', mime: 'image/jpeg' },
                    { label: 'PNG', mime: 'image/png' },
                    { label: 'WEBP', mime: 'image/webp' },
                    { label: 'GIF', mime: 'image/gif' },
                    { label: 'BMP', mime: 'image/bmp' }
                  ].map(f => (
                    <button
                      key={f.label}
                      onClick={() => setTargetFormat(f.mime)}
                      className={`py-3 rounded-xl font-bold border-2 transition-all ${targetFormat === f.mime
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {t('imageConverter.quality')}
                  </label>
                  <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { val: 60, label: t('imageConverter.qualityLow') },
                    { val: 85, label: t('imageConverter.qualityMedium') },
                    { val: 95, label: t('imageConverter.qualityHigh') }
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => setQuality(p.val)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${quality === p.val
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="flex flex-col">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3 font-bold text-slate-700">
                  <Sliders className="text-blue-600" size={20} />
                  {t('imageConverter.advanced')}
                </div>
                {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {showAdvanced && (
                <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Resize */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Maximize2 size={14} /> {t('imageConverter.resize')}
                    </label>
                    <div className="relative group/select">
                      <select
                        value={resize.mode}
                        onChange={(e) => setResize({ ...resize, mode: e.target.value as ResizeMode })}
                        className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all cursor-pointer"
                      >
                        <option value="none">{t('imageConverter.resizeOriginal')}</option>
                        <option value="percentage">{t('imageConverter.resizePercentage')}</option>
                        <option value="fixed">{t('imageConverter.resizeFixed')}</option>
                        <option value="preset">{t('imageConverter.resizePresets')}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-blue-500 pointer-events-none transition-colors" size={16} />
                    </div>

                    {resize.mode === 'percentage' && (
                      <input
                        type="number"
                        value={resize.percentage}
                        onChange={(e) => setResize({ ...resize, percentage: parseInt(e.target.value) })}
                        placeholder={t('imageConverter.resizePercentagePlaceholder')}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                    )}

                    {resize.mode === 'fixed' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder={t('imageConverter.resizeWidth')}
                          value={resize.width}
                          onChange={(e) => setResize({ ...resize, width: parseInt(e.target.value) })}
                          className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                        />
                        <input
                          type="number"
                          placeholder={t('imageConverter.resizeHeight')}
                          value={resize.height}
                          onChange={(e) => setResize({ ...resize, height: parseInt(e.target.value) })}
                          className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                        />
                      </div>
                    )}

                    {resize.mode === 'preset' && (
                      <div className="relative group/select">
                        <select
                          value={resize.preset}
                          onChange={(e) => setResize({ ...resize, preset: e.target.value })}
                          className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all cursor-pointer"
                        >
                          <option value="1920x1080">HD (1920x1080)</option>
                          <option value="1280x720">HD (1280x720)</option>
                          <option value="1080x1080">Instagram Sq (1080x1080)</option>
                          <option value="1200x630">Facebook (1200x630)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-blue-500 pointer-events-none transition-colors" size={16} />
                      </div>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Filter size={14} /> {t('imageConverter.filters')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'grayscale', label: t('imageConverter.filterGrayscale') },
                        { id: 'sepia', label: t('imageConverter.filterSepia') },
                        { id: 'invert', label: t('imageConverter.filterInvert') },
                        { id: 'blur', label: t('imageConverter.filterBlur') }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setFilters({ ...filters, [f.id]: !filters[f.id as keyof FilterSettings] })}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all ${filters[f.id as keyof FilterSettings]
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-500 border-slate-200'
                            }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${filters[f.id as keyof FilterSettings] ? 'bg-white' : 'bg-slate-200'}`} />
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <RotateCw size={14} /> {t('imageConverter.rotation')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 90, 180, 270].map(deg => (
                        <button
                          key={deg}
                          onClick={() => setRotation(deg)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${rotation === deg
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-12">
            {!processing ? (
              <button
                onClick={handleBatchProcess}
                disabled={files.length === 0}
                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl transition-all shadow-xl
                ${files.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:-translate-y-1'}`}
              >
                <RefreshCw size={24} />
                {t('imageConverter.convert', { count: files.length })}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-3 text-slate-600 font-bold">
                  <Loader2 className="animate-spin" />
                  {t('imageConverter.processing')} ({progress}%)
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          {results.length > 0 && !processing && (
            <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={28} />
                    {t('imageConverter.resultsTitle')}
                  </h3>
                  <p className="text-slate-500 font-medium">{t('imageConverter.resultsSubtitle')}</p>
                </div>
                {results.length > 1 && (
                  <button
                    onClick={downloadAll}
                    className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    <Download size={20} /> {t('imageConverter.downloadAll')}
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                {results.map((res) => {
                  const ratio = (res.convertedSize / res.originalSize) * 100;
                  const percent = Math.abs(100 - ratio).toFixed(1);
                  const isReduced = ratio < 100;

                  return (
                    <div key={res.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group">
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                          <img src={res.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">{res.convertedName}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-wider">
                            <span className="text-slate-400">{formatSize(res.originalSize)} → {formatSize(res.convertedSize)}</span>
                            <span className={isReduced ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded-full' : 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full'}>
                              {isReduced ? t('imageConverter.reduced', { percent }) : t('imageConverter.increased', { percent })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={res.url}
                        download={res.convertedName}
                        className="mt-4 sm:mt-0 w-full sm:w-auto px-5 py-3 bg-white text-blue-600 border border-blue-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Download size={16} /> {t('imageConverter.download')}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>



        {/* Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Layers size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('imageConverter.features.format.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('imageConverter.features.format.desc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Sliders size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('imageConverter.features.quality.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('imageConverter.features.quality.desc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('imageConverter.features.batch.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('imageConverter.features.batch.desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
