'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-usm-blue-primary text-white',
  bestseller: 'bg-white text-usm-blue-dark border border-usm-border',
  limited: 'bg-usm-blue-primary text-white font-black',
  lowStock: 'bg-amber-500 text-usm-blue-dark',
  soldOut: 'bg-red-600 text-white font-bold',
  official: 'bg-white text-usm-blue-dark border border-usm-blue-primary/30',
};

const BADGE_LABELS: Record<string, { en: string; fr: string; ar: string }> = {
  new: { en: 'New', fr: 'Nouveau', ar: 'جديد' },
  bestseller: { en: 'Best Seller', fr: 'Meilleure Vente', ar: 'الأكثر مبيعاً' },
  limited: { en: 'Limited Edition', fr: 'Édition Limitée', ar: 'إصدار محدود' },
  lowStock: { en: 'Low Stock', fr: 'Stock Limité', ar: 'كمية محدودة' },
  soldOut: { en: 'Coming Soon', fr: 'Bientôt disponible', ar: 'قريباً' },
  official: { en: 'Official', fr: 'Officiel', ar: 'رسمي' },
};

interface ProductCardProps {
  product: any;
  showRank?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showRank = false, className = '' }) => {
  const { language, addToCart, wishlist, toggleWishlist } = useApp();
  const router = useRouter();
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const id = product._id || product.id;
  const liked = wishlist.includes(id);
  const hoverImage = product.hoverImage || product.images?.[0] || '';

  // Calculate stock details dynamically from variants
  const totalStock = product.variants 
    ? product.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) 
    : (product.stock || 0);

  const isOutOfStock = 
    product.stockStatus === 'OUT_OF_STOCK' || 
    (product.trackStock && (product.stockQuantity ?? 0) <= 0) || 
    product.status === 'archived' ||
    totalStock === 0;

  const soldOut = isOutOfStock;
  const lowStock = !soldOut && totalStock > 0 && totalStock <= 5;

  const rawPrice = product.price || 0;
  const rawOldPrice = product.oldPrice;

  const formatMoney = (millimes: number) => {
    return (millimes / 1000).toFixed(3) + ' DT';
  };

  const discountPct = rawOldPrice
    ? Math.round((1 - rawPrice / rawOldPrice) * 100)
    : null;

  // Unique sizes from variants with stock info
  const sizeOptions: { size: string; stock: number; isActive: boolean }[] = product.variants
    ? Array.from(new Map<string, { size: string; stock: number; isActive: boolean }>(
        product.variants
          .filter((v: any) => v.size)
          .map((v: any) => [v.size, { size: v.size, stock: v.stock || 0, isActive: v.isActive !== false }])
      ).values())
    : [];

  // Count how many sizes — if only 1, no picker needed
  const hasMultipleSizes = sizeOptions.length > 1;
  const hasSizes = sizeOptions.length > 0;

  const uniqueColors = product.variants
    ? Array.from(
        new Map(
          product.variants
            .filter((v: any) => v.color && v.colorHex)
            .map((v: any) => [v.colorHex, { name: v.color, hex: v.colorHex }])
        ).values()
      )
    : [];

  const goToProduct = () => {
    if (isOutOfStock) return;
    router.push(`/product/${product.slug}`);
  };

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowSizePicker(false);
        setSelectedSize(null);
      }
    };
    if (showSizePicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSizePicker]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soldOut) return;

    if (!hasSizes || !hasMultipleSizes) {
      // Single size or no variants — add directly
      const defaultSize = sizeOptions[0]?.size || 'One Size';
      addToCart({
        ...product,
        id: id,
        image: product.coverImage || product.image,
        price: formatMoney(rawPrice),
      }, defaultSize);
      return;
    }

    // Multiple sizes — show picker
    setShowSizePicker(true);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddWithSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize) return;

    addToCart({
      ...product,
      id: id,
      image: product.coverImage || product.image,
      price: formatMoney(rawPrice),
    }, selectedSize);

    setShowSizePicker(false);
    setSelectedSize(null);
  };

  const badges = product.badges || [];
  const visibleBadges = [...badges];
  if (lowStock && !visibleBadges.includes('lowStock')) visibleBadges.push('lowStock');
  
  const activeBadges = visibleBadges.slice(0, 2);

  return (
    <motion.div
      onClick={goToProduct}
      whileHover={isOutOfStock ? {} : { y: -6 }}
      transition={{ duration: 0.3 }}
      aria-disabled={isOutOfStock ? 'true' : undefined}
      className={`group relative flex flex-col h-full bg-white border border-usm-border rounded-2xl shadow-lg overflow-hidden ${
        isOutOfStock ? 'cursor-default' : 'hover:border-usm-blue-primary/30 cursor-pointer'
      } ${className}`}
    >
      {/* Product Image Panel */}
      <div className={`relative aspect-[4/5] overflow-hidden bg-slate-100 shrink-0 ${isOutOfStock ? 'opacity-65 [filter:grayscale(0.15)_blur(0.4px)]' : ''}`}>
        {/* Primary image */}
        <img
          src={product.coverImage || product.image}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[400ms] ease-out ${
            isOutOfStock ? '' : 'group-hover:scale-[1.02]'
          } ${hoverImage && !isOutOfStock ? 'group-hover:opacity-0' : ''}`}
          loading="lazy"
        />
        {/* Hover image */}
        {hoverImage && !isOutOfStock && (
          <img
            src={hoverImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.02] transition-all duration-[400ms] ease-out group-hover:opacity-100 group-hover:scale-100"
            loading="lazy"
          />
        )}

        {/* Rank Badge */}
        {showRank && product.rank && !isOutOfStock && (
          <span className="absolute top-3.5 left-3.5 h-7 w-7 rounded-full bg-usm-blue-primary text-white text-xs font-black flex items-center justify-center shadow-md z-10">
            #{product.rank}
          </span>
        )}

        {/* Badges Overlay */}
        {isOutOfStock ? (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-red-600 text-white shadow-sm">
              Bientôt disponible
            </span>
          </div>
        ) : activeBadges.length > 0 ? (
          <div
            className={`absolute top-3.5 flex flex-col gap-1 z-10 ${
              showRank && product.rank ? 'left-12' : 'left-3.5'
            }`}
          >
            {activeBadges.map((b) => (
              <span
                key={b}
                className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
                  BADGE_STYLES[b] || 'bg-slate-700 text-white'
                }`}
              >
                {BADGE_LABELS[b] 
                  ? tr(language, BADGE_LABELS[b].en, BADGE_LABELS[b].fr, BADGE_LABELS[b].ar)
                  : b}
              </span>
            ))}
          </div>
        ) : null}

        {/* Wishlist Button */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(id);
            }}
            className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full bg-usm-blue-soft hover:bg-usm-blue-soft backdrop-blur-md flex items-center justify-center border border-usm-border transition-colors z-10 cursor-pointer"
            title={tr(language, 'Add to wishlist', 'Ajouter aux favoris', 'إضافة إلى المفضلة')}
          >
            <Heart
              size={13}
              className={`transition-all duration-300 ${liked ? 'text-red-500 scale-110' : 'text-slate-700'}`}
              fill={liked ? 'currentColor' : 'none'}
            />
          </button>
        )}

        {/* Quick Add / Size Picker Overlay */}
        {!soldOut && (
          <>
            {/* Simple quick add button (no size picker needed) */}
            {!hasMultipleSizes && (
              <button
                onClick={handleQuickAdd}
                className="absolute bottom-0 left-0 right-0 py-3 bg-usm-blue-primary/95 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer z-10"
              >
                <ShoppingBag size={12} />
                {tr(language, 'Quick Add', 'Ajout Rapide', 'إضافة سريعة')}
              </button>
            )}

            {/* Size picker button */}
            {hasMultipleSizes && (
              <button
                onClick={handleQuickAdd}
                className="absolute bottom-0 left-0 right-0 py-3 bg-usm-blue-primary/95 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer z-10"
              >
                <ShoppingBag size={12} />
                {tr(language, 'Choose Size', 'Choisir la taille', 'اختر المقاس')}
              </button>
            )}
          </>
        )}

        {/* Size Picker Popover */}
        <AnimatePresence>
          {showSizePicker && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-usm-border p-3 z-20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-usm-blue-dark">
                  {tr(language, 'Choose Size', 'Choisir la taille', 'اختر المقاس')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSizePicker(false);
                    setSelectedSize(null);
                  }}
                  className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {sizeOptions.map((opt: { size: string; stock: number; isActive: boolean }) => {
                  const outOfStock = opt.stock <= 0 || !opt.isActive;
                  const isSelected = selectedSize === opt.size;
                  return (
                    <button
                      key={opt.size}
                      disabled={outOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!outOfStock) handleSizeSelect(opt.size);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        outOfStock
                          ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-usm-blue-primary text-white border-usm-blue-primary'
                          : 'bg-white text-usm-blue-dark border-usm-border hover:border-usm-blue-primary/50 cursor-pointer'
                      }`}
                    >
                      {opt.size}
                      {outOfStock && (
                        <span className="ml-1 text-[8px] not-italic line-through-none">
                          {tr(language, 'OOS', 'ÉPUISÉ', 'نفد')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={!selectedSize}
                onClick={handleAddWithSize}
                className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedSize
                    ? 'bg-usm-blue-primary text-white hover:bg-usm-blue-primary/90 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={11} className="inline mr-1" />
                {tr(language, 'Add to Cart', 'Ajouter au panier', 'أضف إلى السلة')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        {isOutOfStock ? (
          <div className="flex items-center gap-2 min-h-[24px]">
            <span className="text-xs sm:text-sm font-bold text-red-600 uppercase tracking-wider">
              Bientôt disponible
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-h-[24px]">
            <span className="text-sm sm:text-base font-black text-usm-blue-primary tracking-tight">
              {formatMoney(rawPrice)}
            </span>
            {rawOldPrice && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                {formatMoney(rawOldPrice)}
              </span>
            )}
            {discountPct !== null && discountPct > 0 && (
              <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">
                -{discountPct}%
              </span>
            )}
          </div>
        )}

        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
          {product.category}
        </span>
        <h3 className="text-xs font-bold text-usm-blue-dark leading-snug line-clamp-2 min-h-[2.2em]">
          {tr(language, product.name, product.nameFr, product.nameAr)}
        </h3>

        {/* Variants Colors Indicator */}
        {uniqueColors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {uniqueColors.map((c: any) => (
              <span
                key={c.hex}
                title={c.name}
                className="h-2.5 w-2.5 rounded-full border border-usm-border shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}

        {/* Low Stock Callout */}
        {lowStock && (
          <p className="text-[9px] text-amber-400 font-bold mt-0.5 animate-pulse">
            {tr(language, `Only ${totalStock} left`, `Plus que ${totalStock} en stock`, `تبقى ${totalStock} قطع فقط`)}
          </p>
        )}

        {/* Official Badge Footer */}
        <p className="text-[8px] text-slate-500 mt-auto pt-2 border-t border-usm-border flex items-center gap-1">
          <Sparkles size={10} className="text-usm-blue-primary" />
          {tr(language, 'Official USM Product', 'Produit Officiel USM', 'منتج رسمي للاتحاد')}
        </p>
      </div>
    </motion.div>
  );
};
