'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api-client';

interface UploadedFile {
  _id: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

interface MediaUploaderProps {
  /** MinIO folder prefix where files will be stored */
  folder: string;
  /** Called when single upload completes successfully */
  onUpload?: (file: UploadedFile) => void;
  /** Called when multiple uploads complete successfully */
  onMultipleUpload?: (files: UploadedFile[]) => void;
  /** Allow selecting multiple files at once */
  multiple?: boolean;
  /** Called when user removes a pending file */
  onRemove?: () => void;
  /** Current value (existing URL) to show as preview */
  currentUrl?: string;
  /** Accepted file types */
  accept?: string;
  /** Label shown on the drop zone */
  label?: string;
  /** Whether to show the compact pill style (for inline form fields) */
  compact?: boolean;
  /** Optional alt text to attach to the upload */
  altText?: string;
  /** Fires whenever an upload starts/finishes — parent forms use this to
   *  disable their submit button until the file has actually finished uploading. */
  onUploadingChange?: (uploading: boolean) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  folder,
  onUpload,
  onMultipleUpload,
  multiple = false,
  onRemove,
  currentUrl,
  accept = 'image/jpeg,image/png,image/webp,image/avif',
  label = 'Drop image(s) here or click to browse',
  compact = false,
  altText,
  onUploadingChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter(Boolean);
      if (fileArray.length === 0) return;

      if (!multiple || fileArray.length === 1) {
        const file = fileArray[0];
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setState('uploading');
        setError(null);
        setProgress(0);
        setUploadStatusText('Envoi en cours…');
        onUploadingChange?.(true);

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', folder);
          if (altText) formData.append('altText', altText);

          const result = await api.uploadMediaWithProgress(formData, setProgress);
          setState('success');
          setPreview(result.thumbnailUrl || result.url);
          onUpload?.(result);
        } catch (err: any) {
          setState('error');
          setError(err.message || 'Upload failed');
          setPreview(currentUrl || null);
          URL.revokeObjectURL(localPreview);
        } finally {
          onUploadingChange?.(false);
        }
      } else {
        // Multiple files batch upload
        setState('uploading');
        setError(null);
        setProgress(0);
        onUploadingChange?.(true);

        const results: UploadedFile[] = [];
        let completedCount = 0;

        try {
          for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            setUploadStatusText(`Envoi de la photo ${i + 1}/${fileArray.length}…`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);
            if (altText) formData.append('altText', altText);

            const res = await api.uploadMediaWithProgress(formData, (p) => {
              const overall = Math.round(((i + p / 100) / fileArray.length) * 100);
              setProgress(overall);
            });
            results.push(res);
            completedCount++;
            setProgress(Math.round((completedCount / fileArray.length) * 100));
          }

          setState('success');
          if (results.length > 0) {
            setPreview(results[results.length - 1].thumbnailUrl || results[results.length - 1].url);
          }
          onMultipleUpload?.(results);
          if (results.length > 0 && onUpload) {
            onUpload(results[results.length - 1]);
          }
        } catch (err: any) {
          setState('error');
          setError(err.message || 'Batch upload failed');
        } finally {
          onUploadingChange?.(false);
        }
      }
    },
    [folder, altText, onUpload, onMultipleUpload, multiple, currentUrl, onUploadingChange],
  );

  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setState('idle');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {preview ? (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            {state === 'uploading' && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-0.5">
                <Loader2 size={14} className="text-white animate-spin" />
                <span className="text-[9px] font-black text-white">{progress}%</span>
              </div>
            )}
            {state !== 'uploading' && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-usm-blue-soft/70 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X size={9} className="text-usm-blue-dark" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center hover:border-usm-blue-primary transition-colors cursor-pointer flex-shrink-0"
          >
            <ImageIcon size={18} className="text-slate-500" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={state === 'uploading'}
            className="text-xs text-usm-blue-primary font-bold hover:underline cursor-pointer disabled:opacity-50"
          >
            {state === 'uploading' ? (uploadStatusText || `Envoi… ${progress}%`) : preview ? (multiple ? 'Ajouter des photos' : 'Changer l’image') : (multiple ? 'Ajouter des photos (multiples)' : 'Choisir une image')}
          </button>
          {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
          <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP · max 10 MB {multiple ? '· Sélection multiple autorisée' : ''}</p>
        </div>
        <input ref={inputRef} type="file" multiple={multiple} accept={accept} onChange={handleInputChange} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => state !== 'uploading' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={`
          relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden
          ${isDragOver ? 'border-usm-blue-primary bg-usm-blue-primary/5' : 'border-slate-300 hover:border-usm-blue-primary/60 hover:bg-slate-50'}
          ${state === 'uploading' ? 'pointer-events-none' : ''}
        `}
        style={{ minHeight: preview ? '180px' : '140px' }}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="preview"
              className="w-full h-44 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <p className="text-usm-blue-dark font-bold text-sm bg-black/60 px-3 py-1.5 rounded-full">
                {multiple ? 'Cliquer pour ajouter d’autres photos' : 'Cliquer pour remplacer'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
              isDragOver ? 'bg-usm-blue-primary/10' : 'bg-slate-100'
            }`}>
              <Upload size={22} className={isDragOver ? 'text-usm-blue-primary' : 'text-slate-500'} />
            </div>
            <p className="text-sm font-semibold text-slate-700">{label}</p>
            <p className="text-xs text-slate-500 mt-1">
              JPG, PNG, WebP, AVIF · max 10 MB {multiple ? '· (Vous pouvez sélectionner plusieurs photos à la fois)' : ''}
            </p>
          </div>
        )}

        {/* Upload overlay */}
        {state === 'uploading' && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 px-10">
            <Loader2 size={28} className="text-usm-blue-primary animate-spin" />
            <p className="text-sm font-semibold text-slate-700">{uploadStatusText || 'Envoi en cours…'} ({progress}%)</p>
            <div className="w-full max-w-[220px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-usm-blue-primary rounded-full transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {state === 'success' && (
            <>
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 font-semibold">Téléchargement réussi</span>
            </>
          )}
          {state === 'error' && (
            <>
              <AlertCircle size={13} className="text-red-500" />
              <span className="text-xs text-red-600 font-semibold">{error}</span>
            </>
          )}
        </div>

        {preview && state !== 'uploading' && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X size={12} /> Réinitialiser
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};
