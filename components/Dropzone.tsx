
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, File, X, CheckCircle } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (files: File | File[]) => void;
  accept?: string;
  title?: string;
  subtitle?: string;
  multiple?: boolean;
  fileCount?: number;
}

const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  accept = "*",
  title = "Clique ou arraste um arquivo",
  subtitle,
  multiple = false,
  fileCount: externalFileCount
}) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [internalFileCount, setInternalFileCount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileCount = externalFileCount !== undefined ? externalFileCount : internalFileCount;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFiles = (files: FileList) => {
    if (files.length > 0) {
      if (multiple) {
        const fileArray = Array.from(files);
        setInternalFileCount(fileArray.length);
        onFileSelect(fileArray);
      } else {
        const file = files[0];
        setInternalFileCount(1);
        onFileSelect(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const clearFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalFileCount(0);
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect(multiple ? [] : (null as any));
  };

  return (
    <div
      className={`relative w-full min-h-[280px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group
        ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {fileCount === 0 ? (
        <>
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="text-indigo-600 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 text-center px-4">{title}</h3>
          <p className="text-slate-500 mt-2 text-center px-4 font-medium">{subtitle || t('dropzone.subtitle', 'Suporta PDF, JPG, PNG e WEBP')}</p>
        </>
      ) : (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
          <div className="bg-green-100 p-5 rounded-full mb-4">
            <CheckCircle className="text-green-600 w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 break-all px-4 text-center">
            {fileCount === 1
              ? t('common.fileSelected') || '1 arquivo selecionado'
              : t('common.filesSelected', { count: fileCount }) || `${fileCount} arquivos selecionados`}
          </h3>
          <button
            onClick={clearFiles}
            className="mt-4 flex items-center gap-2 text-red-500 font-medium hover:text-red-700 transition-colors"
          >
            <X size={18} /> {t('common.removeFiles') || 'Remover arquivos'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
