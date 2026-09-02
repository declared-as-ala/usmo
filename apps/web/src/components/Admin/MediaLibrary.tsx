'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Search, Upload, Image as ImageIcon, Film, Filter,
  CheckCircle2, Loader2, Trash2, Copy, ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { requestConfirmation } from '../Common/ConfirmDialog';

interface MediaFile {
  _id: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  type: 'image' | 'video' | 'document';
  folder: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  createdAt: string;
}

interface MediaLibraryProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when user closes the modal */
  onClose: () => void;
  /** Called when user selects a file */
  onSelect: (file: MediaFile) => void;
  /** Initial type filter */
  typeFilter?: 'image' | 'video' | 'all';
  /** Optional initial folder filter */
  folderFilter?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  isOpen,
  onClose,
  onSelect,
  typeFilter = 'image',
  folderFilter,
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'image' | 'video' | 'all'>(typeFilter);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (resetPage = false) => {
    setLoading(true);
    setError(null);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 48 };
      if (type !== 'all') params.type = type;
      if (search) params.search = search;
      if (folderFilter) params.folder = folderFilter;

      const data = await api.getMediaLibrary(params);
      setFiles(data.files || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, [page, type, search, folderFilter]);

  useEffect(() => {
    if (isOpen) load(true);
  }, [isOpen, type, search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const fileArray = Array.from(fileList);
    setUploading(true);
    setUploadError(null);

    try {
      const uploaded: MediaFile[] = [];
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folderFilter || 'temp');
        const result = await api.uploadMedia(formData);
        uploaded.push(result);
      }
      setFiles((prev) => [...uploaded, ...prev]);
      if (uploaded.length > 0) setSelected(uploaded[uploaded.length - 1]);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (file: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();
    requestConfirmation({ title: 'Supprimer ce média ?', message: `« ${file.originalName} » sera supprimé définitivement.`, confirmLabel: 'Supprimer', onConfirm: async () => {
    try {
      await api.deleteMedia(file._id);
      setFiles((prev) => prev.filter((f) => f._id !== file._id));
      if (selected?._id === file._id) setSelected(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }}});
  };

  const copyUrl = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-black text-slate-900 text-lg">Media Library</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {total} file{total !== 1 ? 's' : ''} · Select to insert
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Upload button */}
            <label className="relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                onChange={handleUpload}
                className="hidden"
              />
              <span className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase
                transition-all cursor-pointer
                ${uploading
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-usm-blue-primary text-white hover:bg-usm-blue-primary/90'}
              `}>
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? 'Uploading…' : 'Upload Files'}
              </span>
            </label>

            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
              <X size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <AlertCircle size={13} /> {uploadError}
          </div>
        )}

        {/* Filters toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files, tags, alt text…"
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-usm-blue-primary/30"
            />
          </div>

          {(['all', 'image', 'video'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`
                px-3 py-2 rounded-xl text-[11px] font-bold uppercase transition-colors cursor-pointer
                ${type === t ? 'bg-usm-blue-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-usm-blue-primary/40'}
              `}
            >
              {t === 'all' ? 'All' : t === 'image' ? '🖼 Images' : '🎬 Videos'}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* File grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={28} className="text-usm-blue-primary animate-spin" />
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
                <AlertCircle size={18} className="mr-2 text-red-400" />
                {error}
              </div>
            )}

            {!loading && !error && files.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                <ImageIcon size={32} className="mb-2 opacity-40" />
                <p className="text-sm">No files found</p>
                <p className="text-xs mt-1">Upload your first file using the button above</p>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {files.map((file) => (
                  <div
                    key={file._id}
                    onClick={() => setSelected(file)}
                    className={`
                      group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                      ${selected?._id === file._id
                        ? 'border-usm-blue-primary ring-2 ring-usm-blue-primary/30'
                        : 'border-transparent hover:border-slate-300'}
                    `}
                  >
                    {file.type === 'image' ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={file.thumbnailUrl || file.url}
                        alt={file.altText || file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-1">
                        <Film size={20} className="text-slate-500" />
                        <span className="text-[8px] text-slate-500 font-mono truncate px-1">{file.originalName}</span>
                      </div>
                    )}

                    {/* Selection indicator */}
                    {selected?._id === file._id && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 size={16} className="text-usm-blue-primary fill-white" />
                      </div>
                    )}

                    {/* Delete button (hover) */}
                    <button
                      onClick={(e) => handleDelete(file, e)}
                      className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex cursor-pointer"
                    >
                      <Trash2 size={10} className="text-usm-blue-dark" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-56 border-l border-slate-100 p-4 overflow-y-auto flex-shrink-0">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                {selected.type === 'image' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={selected.mediumUrl || selected.url} alt={selected.altText} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={32} className="text-slate-500" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-900 truncate">{selected.originalName}</p>
                <p className="text-slate-500">{formatBytes(selected.size)}</p>
                {selected.width && selected.height && (
                  <p className="text-slate-500">{selected.width} × {selected.height}px</p>
                )}
                <p className="font-mono text-[10px] text-slate-500 break-all">{selected.folder}/</p>
                <p className="text-slate-500">{new Date(selected.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="mt-3 space-y-2">
                <button
                  onClick={copyUrl}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold uppercase cursor-pointer transition-colors"
                >
                  {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>

                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold uppercase cursor-pointer transition-colors"
                >
                  <ExternalLink size={12} /> Open
                </a>

                <button
                  onClick={() => { onSelect(selected); onClose(); }}
                  className="w-full py-2 bg-usm-blue-primary text-white rounded-xl text-[11px] font-bold uppercase cursor-pointer hover:bg-usm-blue-primary/90 transition-colors"
                >
                  Use this file
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
