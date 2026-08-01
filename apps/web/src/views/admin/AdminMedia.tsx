'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPageHeader } from '../../components/Admin/AdminPageHeader';
import { StatCard } from '../../components/Admin/StatCard';
import { requestConfirmation } from '../../components/Common/ConfirmDialog';
import { api } from '../../lib/api-client';
import {
  Image as ImageIcon,
  Video,
  Plus,
  X,
  Trash2,
  Edit,
  FolderOpen,
  Settings,
  Star,
  Eye,
  Upload,
  CheckSquare,
  Square,
  Lock,
  Loader2,
  Check
} from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'albums'
  | 'videos';

export default function AdminMedia() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modals state
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

  // Album fields
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [albumCover, setAlbumCover] = useState('');
  const [albumAccessLevel, setAlbumAccessLevel] = useState<'public' | 'fan' | 'premium'>('public');
  const [albumPhotosText, setAlbumPhotosText] = useState('');
  const [albumTeaserPhotosText, setAlbumTeaserPhotosText] = useState('');
  const [albumDisplayOrder, setAlbumDisplayOrder] = useState('0');
  const [albumIsActive, setAlbumIsActive] = useState(true);

  // Video fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoThumb, setVideoThumb] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTeaserUrl, setVideoTeaserUrl] = useState('');
  const [videoAccessLevel, setVideoAccessLevel] = useState<'public' | 'fan' | 'premium'>('public');
  const [videoDisplayOrder, setVideoDisplayOrder] = useState('0');
  const [videoIsActive, setVideoIsActive] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminMedia();
      setMediaItems(data || []);
    } catch (err) {
      console.error('Failed to load admin media:', err);
      showToast('Impossible de charger les médias.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleOpenAddAlbum = () => {
    setEditingAlbum(null);
    setAlbumTitle('');
    setAlbumDesc('');
    setAlbumCover('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80');
    setAlbumAccessLevel('public');
    setAlbumPhotosText('');
    setAlbumTeaserPhotosText('');
    setAlbumDisplayOrder('0');
    setAlbumIsActive(true);
    setShowAlbumModal(true);
  };

  const handleOpenEditAlbum = (album: any) => {
    setEditingAlbum(album);
    setAlbumTitle(album.title);
    setAlbumDesc(album.description || '');
    setAlbumCover(album.coverImage);
    setAlbumAccessLevel(album.accessLevel);
    setAlbumPhotosText(album.photos?.join('\n') || '');
    setAlbumTeaserPhotosText(album.teaserPhotos?.join('\n') || '');
    setAlbumDisplayOrder(String(album.displayOrder || 0));
    setAlbumIsActive(album.isActive !== false);
    setShowAlbumModal(true);
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const photos = albumPhotosText.split('\n').map(p => p.trim()).filter(Boolean);
    const teaserPhotos = albumTeaserPhotosText.split('\n').map(p => p.trim()).filter(Boolean);

    const payload = {
      title: albumTitle,
      titleFr: albumTitle,
      titleAr: albumTitle,
      description: albumDesc,
      descriptionFr: albumDesc,
      descriptionAr: albumDesc,
      type: 'album',
      accessLevel: albumAccessLevel,
      coverImage: albumCover,
      photos,
      teaserPhotos,
      displayOrder: Number(albumDisplayOrder) || 0,
      isActive: albumIsActive,
    };

    try {
      if (editingAlbum) {
        await api.updateAdminMediaItem(editingAlbum._id, payload);
        showToast('Album mis à jour avec succès.', 'success');
      } else {
        await api.createAdminMediaItem(payload);
        showToast('Album créé avec succès.', 'success');
      }
      setShowAlbumModal(false);
      fetchMedia();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoTitle('');
    setVideoDesc('');
    setVideoThumb('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80');
    setVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    setVideoTeaserUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    setVideoAccessLevel('public');
    setVideoDisplayOrder('0');
    setVideoIsActive(true);
    setShowVideoModal(true);
  };

  const handleOpenEditVideo = (video: any) => {
    setEditingVideo(video);
    setVideoTitle(video.title);
    setVideoDesc(video.description || '');
    setVideoThumb(video.coverImage);
    setVideoUrl(video.videoUrl || '');
    setVideoTeaserUrl(video.teaserUrl || '');
    setVideoAccessLevel(video.accessLevel);
    setVideoDisplayOrder(String(video.displayOrder || 0));
    setVideoIsActive(video.isActive !== false);
    setShowVideoModal(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: videoTitle,
      titleFr: videoTitle,
      titleAr: videoTitle,
      description: videoDesc,
      descriptionFr: videoDesc,
      descriptionAr: videoDesc,
      type: 'video',
      accessLevel: videoAccessLevel,
      coverImage: videoThumb,
      videoUrl,
      teaserUrl: videoTeaserUrl,
      displayOrder: Number(videoDisplayOrder) || 0,
      isActive: videoIsActive,
    };

    try {
      if (editingVideo) {
        await api.updateAdminMediaItem(editingVideo._id, payload);
        showToast('Vidéo mise à jour avec succès.', 'success');
      } else {
        await api.createAdminMediaItem(payload);
        showToast('Vidéo ajoutée avec succès.', 'success');
      }
      setShowVideoModal(false);
      fetchMedia();
    } catch (err: any) {
      showToast(err.message || 'Erreur de sauvegarde.', 'error');
    }
  };

  const handleDeleteMedia = (item: any) => {
    requestConfirmation({
      title: 'Supprimer ce média ?',
      message: `« ${item.title} » sera supprimé définitivement de la base de données.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await api.deleteAdminMediaItem(item._id);
          showToast('Média supprimé avec succès.', 'success');
          fetchMedia();
        } catch (err: any) {
          showToast(err.message || 'Erreur lors de la suppression.', 'error');
        }
      }
    });
  };

  const albums = mediaItems.filter(m => m.type === 'album');
  const videos = mediaItems.filter(m => m.type === 'video');

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen p-6 space-y-6">
      <AdminPageHeader
        title="USM Media Portal Manager"
        description="Contrôlez les albums photos, vidéos premium, niveaux d'accès et teasers."
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleOpenAddAlbum}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              <Plus size={14} /> Créer un Album
            </button>
            <button
              onClick={handleOpenAddVideo}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#020817] hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              <Video size={14} /> Ajouter une Vidéo
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
        {[
          { id: 'dashboard', label: 'Tableau de bord', icon: ImageIcon },
          { id: 'albums', label: 'Albums Photos', icon: FolderOpen },
          { id: 'videos', label: 'Vidéos', icon: Video },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-usm-blue-primary text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={28} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement des ressources...</span>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Albums Photos" value={albums.length} icon={FolderOpen} accent="blue" />
                <StatCard label="Vidéos Premium" value={videos.length} icon={Video} accent="emerald" />
                <StatCard label="Total Médias" value={mediaItems.length} icon={ImageIcon} accent="slate" />
              </div>
            </div>
          )}

          {activeTab === 'albums' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-3 px-4">Couverture / Titre</th>
                      <th className="py-3 px-4">Niveau d'accès</th>
                      <th className="py-3 px-4">Photos</th>
                      <th className="py-3 px-4">Teasers</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {albums.map((album) => (
                      <tr key={album._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                          <img src={album.coverImage} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                          <div>
                            <p className="font-bold text-slate-950">{album.title}</p>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-semibold uppercase">{album.accessLevel}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{album.photos?.length || 0}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{album.teaserPhotos?.length || 0}</td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditAlbum(album)}
                              className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteMedia(album)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-3 px-4">Miniature / Titre</th>
                      <th className="py-3 px-4">Niveau d'accès</th>
                      <th className="py-3 px-4">URL Vidéo</th>
                      <th className="py-3 px-4">Teaser URL</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {videos.map((video) => (
                      <tr key={video._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                          <img src={video.coverImage} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                          <div>
                            <p className="font-bold text-slate-950">{video.title}</p>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-semibold uppercase">{video.accessLevel}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono max-w-xs truncate">{video.videoUrl}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono max-w-xs truncate">{video.teaserUrl}</td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditVideo(video)}
                              className="p-1.5 text-slate-400 hover:text-usm-blue-primary hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteMedia(video)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ALBUM CREATE / EDIT FORM MODAL */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAlbumModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingAlbum ? 'Modifier l’Album' : 'Créer un nouvel Album'}</h3>
              <button onClick={() => setShowAlbumModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSaveAlbum} className="p-5 space-y-4 overflow-y-auto flex-grow text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre *</label>
                  <input required type="text" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image Couverture (URL) *</label>
                  <input required type="text" value={albumCover} onChange={(e) => setAlbumCover(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary h-20 resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Niveau d'accès</label>
                  <select value={albumAccessLevel} onChange={(e) => setAlbumAccessLevel(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    <option value="public">Public (Tout le monde)</option>
                    <option value="fan">Fan (Supporters connectés)</option>
                    <option value="premium">Premium (Membres actifs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordre d'affichage</label>
                  <input type="number" value={albumDisplayOrder} onChange={(e) => setAlbumDisplayOrder(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={albumIsActive} onChange={(e) => setAlbumIsActive(e.target.checked)} className="h-4 w-4 rounded text-usm-blue-primary" />
                    <span>Actif / Visible</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Photos HD (Une URL par ligne)</label>
                  <textarea value={albumPhotosText} onChange={(e) => setAlbumPhotosText(e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary h-24 font-mono resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Photos Teaser (Une URL par ligne)</label>
                  <textarea value={albumTeaserPhotosText} onChange={(e) => setAlbumTeaserPhotosText(e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary h-24 font-mono resize-none" />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-black uppercase rounded-lg transition-colors cursor-pointer mt-2">
                Enregistrer l’Album
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO CREATE / EDIT FORM MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{editingVideo ? 'Modifier la Vidéo' : 'Ajouter une Vidéo'}</h3>
              <button onClick={() => setShowVideoModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSaveVideo} className="p-5 space-y-4 overflow-y-auto flex-grow text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Titre *</label>
                  <input required type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image Miniature (URL) *</label>
                  <input required type="text" value={videoThumb} onChange={(e) => setVideoThumb(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                <textarea value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary h-20 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lien Vidéo HD (Youtube Embed ou direct URL) *</label>
                  <input required type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lien Vidéo Teaser / Trailer *</label>
                  <input required type="text" value={videoTeaserUrl} onChange={(e) => setVideoTeaserUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Niveau d'accès</label>
                  <select value={videoAccessLevel} onChange={(e) => setVideoAccessLevel(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary">
                    <option value="public">Public (Tout le monde)</option>
                    <option value="fan">Fan (Supporters connectés)</option>
                    <option value="premium">Premium (Membres actifs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ordre d'affichage</label>
                  <input type="number" value={videoDisplayOrder} onChange={(e) => setVideoDisplayOrder(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-usm-blue-primary" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={videoIsActive} onChange={(e) => setVideoIsActive(e.target.checked)} className="h-4 w-4 rounded text-usm-blue-primary" />
                    <span>Active / Visible</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-black uppercase rounded-lg transition-colors cursor-pointer mt-2">
                Enregistrer la Vidéo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
