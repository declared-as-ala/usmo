'use client';

import { useState } from 'react';
import { CheckCircle2, FolderOpen, Image as ImageIcon, Upload } from 'lucide-react';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { MediaLibrary } from '../../components/Admin/MediaLibrary';
import { MediaUploader } from '../../components/Admin/MediaUploader';

interface SelectedMedia {
  _id: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  type?: 'image' | 'video' | 'document';
  folder?: string;
  mimeType?: string;
  createdAt?: string;
}

export default function AdminMediaLibrary() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [latest, setLatest] = useState<SelectedMedia | null>(null);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bibliothèque média"
        description="Centralisez les images et vidéos stockées dans MinIO."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-usm-blue-primary">
              <Upload aria-hidden="true" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Ajouter un média</h2>
              <p className="text-sm text-slate-500">Images jusqu’à 10 Mo, vidéos jusqu’à 300 Mo.</p>
            </div>
          </div>
          <MediaUploader folder="media/photos" onUpload={setLatest} />
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Dernier fichier</h2>
          {latest ? (
            <div className="mt-4 space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={latest.thumbnailUrl || latest.url} alt={latest.originalName} className="size-full object-cover" />
              </div>
              <p className="truncate text-sm font-semibold text-slate-800">{latest.originalName}</p>
              <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 aria-hidden="true" size={15} /> Stocké dans MinIO
              </p>
            </div>
          ) : (
            <div className="mt-4 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
              <ImageIcon aria-hidden="true" size={28} />
              <p className="mt-2 text-sm">Aucun ajout récent</p>
            </div>
          )}
        </aside>
      </div>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">Parcourir tous les fichiers</h2>
          <p className="mt-1 text-sm text-slate-300">Recherchez, filtrez, prévisualisez ou supprimez un média.</p>
        </div>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <FolderOpen aria-hidden="true" size={18} /> Ouvrir la bibliothèque
        </button>
      </section>

      <MediaLibrary
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(file) => setLatest(file)}
        typeFilter="all"
      />
    </div>
  );
}
