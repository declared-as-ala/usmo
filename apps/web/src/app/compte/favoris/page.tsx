'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api-client';
import { useApp } from '../../../context/AppContext';
import { Heart, Loader2, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface WishlistEntry {
  _id: string;
  productId: string;
  product: { name: string; slug?: string; coverImage?: string; price: number };
}

export default function MyWishlistPage() {
  const { toggleWishlist } = useApp();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await api.getMyWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    toggleWishlist(productId);
  };

  return (
    <div className="space-y-6">
      <div className="usm-card border border-usm-border p-6 bg-gradient-to-r from-white to-usm-blue-soft flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary shrink-0">
          <Heart size={18} className="fill-current" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">Mes Favoris</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Les articles de la boutique officielle que vous avez sauvegardés.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 border border-usm-border rounded-2xl">
          <Loader2 className="animate-spin text-usm-blue-primary mb-2" size={24} />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chargement de vos favoris...</span>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="usm-card border border-usm-border overflow-hidden group">
              <Link href={item.product.slug ? `/product/${item.product.slug}` : '/boutique'} className="block">
                <div className="relative aspect-square bg-usm-blue-soft">
                  {item.product.coverImage ? (
                    <Image
                      src={item.product.coverImage}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-3 space-y-1.5">
                <p className="text-xs font-bold text-usm-blue-dark line-clamp-1">{item.product.name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-usm-blue-primary">
                    {((item.product.price || 0) / 1000).toFixed(0)} TND
                  </span>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-white/30 border border-usm-border rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-full bg-usm-blue-soft border border-usm-border flex items-center justify-center mx-auto text-slate-500">
            <Heart size={16} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-usm-blue-dark">Aucun favori</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Ajoutez des articles à vos favoris depuis la boutique officielle.</p>
          </div>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-usm-blue-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-usm-blue-hover transition-colors"
          >
            Visiter la boutique
          </Link>
        </div>
      )}
    </div>
  );
}
