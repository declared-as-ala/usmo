'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/Shop/ProductCard';
import { tr } from '../utils/i18n';
import { api } from '../lib/api-client';
import {
  ChevronRight,
  ShoppingBag,
  Minus,
  Plus,
  Heart,
  ShieldAlert,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store,
  Ban,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  productId: string; // this parameter is the product slug
}

type Tab = 'description' | 'details' | 'sizing' | 'delivery' | 'care' | 'availability' | 'guarantee';

const TABS: { key: Tab; en: string; fr: string; ar: string }[] = [
  { key: 'description', en: 'Description', fr: 'Description', ar: 'الوصف' },
  { key: 'details', en: 'Details & Material', fr: 'Détails & Matière', ar: 'التفاصيل والخامة' },
  { key: 'sizing', en: 'Size Guide', fr: 'Guide des Tailles', ar: 'دليل المقاسات' },
  { key: 'delivery', en: 'Delivery & Pickup', fr: 'Livraison & Retrait', ar: 'التوصيل والاستلام' },
  { key: 'care', en: 'Care Instructions', fr: "Instructions d'Entretien", ar: 'تعليمات العناية' },
  { key: 'availability', en: 'Availability', fr: 'Disponibilité', ar: 'التوفر' },
  { key: 'guarantee', en: 'Official Guarantee', fr: 'Garantie Officielle', ar: 'الضمان الرسمي' },
];

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const { language, addToCart, updateCartQuantity, wishlist, toggleWishlist } = useApp();
  const router = useRouter();

  // API State
  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selector States
  const [selectedSize, setSelectedSize] = useState('One Size');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('description');

  // Load product by slug
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const prod = await api.getProductBySlug(productId);
        setProduct(prod);

        // Pre-select default variant properties
        if (prod.variants && prod.variants.length > 0) {
          setSelectedSize(prod.variants[0].size || 'One Size');
          setSelectedColor(prod.variants[0].colorHex || null);
        } else if (prod.sizes && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        }

        // Fetch related products of the same category
        const related = await api.getProducts({ category: prod.category });
        setRelatedProducts(related.products.filter((p: any) => p._id !== prod._id).slice(0, 4));
      } catch (err: any) {
        setError(err.message || 'Impossible de charger le produit');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 bg-white min-h-[70vh] flex flex-col justify-center items-center">
        <div className="h-10 w-10 border-4 border-t-usm-blue-primary border-usm-border rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-semibold">Chargement des détails du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 bg-usm-blue-primary text-white min-h-[60vh] flex flex-col justify-center items-center border border-usm-border rounded-3xl mt-6">
        <ShieldAlert className="mx-auto text-amber-500" size={44} />
        <h2 className="text-lg font-bold uppercase tracking-wider text-usm-blue-dark">
          {tr(language, 'Product Not Found', 'Produit Introuvable', 'المنتج غير موجود')}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          {tr(
            language,
            'The product you are looking for does not exist or has been removed.',
            "Le produit que vous recherchez n'existe pas ou a été retiré.",
            'المنتج الذي تبحث عنه غير موجود أو تم إزالته.'
          )}
        </p>
        <button
          onClick={() => router.push('/boutique')}
          className="px-6 py-2.5 bg-usm-blue-primary text-white text-xs font-black uppercase rounded-lg hover:bg-usm-blue-primary/90 transition-all cursor-pointer"
        >
          {tr(language, 'Return to Boutique', 'Retour à la Boutique', 'العودة إلى البوتيك')}
        </button>
      </div>
    );
  }

  // Format money helper
  const formatMoney = (millimes: number) => {
    return (millimes / 1000).toFixed(3) + ' DT';
  };

  const gallery = [product.coverImage, ...(product.images || [])];
  
  // Calculate stock dynamically from variants
  const totalStock = product.variants 
    ? product.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
    : (product.stock || 0);

  const soldOut = totalStock === 0 || product.status === 'archived';
  const lowStock = !soldOut && totalStock > 0 && totalStock <= 5;
  const liked = wishlist.includes(product._id);
  const productName = tr(language, product.name, product.nameFr, product.nameAr);

  const discountPct = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: product._id,
      price: formatMoney(product.price),
    }, selectedSize);
    if (quantity > 1) updateCartQuantity(product._id, selectedSize, quantity);
  };

  // Get unique colors
  const uniqueColors = product.variants
    ? Array.from(
        new Map(
          product.variants
            .filter((v: any) => v.color && v.colorHex)
            .map((v: any) => [v.colorHex, { name: v.color, hex: v.colorHex }])
        ).values()
      )
    : [];

  // Get unique sizes
  const uniqueSizes = product.variants
    ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean)))
    : (product.sizes || []);

  return (
    <div className="usm-premium-bg text-usm-blue-dark min-h-screen relative overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-usm-blue-primary/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <button onClick={() => router.push('/boutique')} className="hover:text-usm-blue-primary transition-colors cursor-pointer">
            {tr(language, 'Boutique', 'Boutique', 'البوتيك')}
          </button>
          <ChevronRight size={12} className="rtl:rotate-180 text-slate-600" />
          <span className="capitalize">{product.category}</span>
          <ChevronRight size={12} className="rtl:rotate-180 text-slate-600" />
          <span className="text-usm-blue-dark truncate max-w-[200px]">{productName}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* 1. GALLERY */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-usm-border shadow-lg group">
              <img
                src={gallery[activeImage]}
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {soldOut && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="bg-usm-blue-soft border border-usm-border text-usm-blue-dark text-xs font-black uppercase px-6 py-2 rounded-full tracking-widest">
                    {tr(language, 'Sold Out', 'Épuisé', 'نفدت الكمية')}
                  </span>
                </div>
              )}
              {discountPct !== null && discountPct > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-500 text-usm-blue-dark text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm">
                  -{discountPct}%
                </span>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 cursor-pointer transition-all ${
                      activeImage === idx ? 'border-usm-blue-primary' : 'border-usm-border hover:border-usm-border'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. BUYING PANEL */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] bg-usm-blue-primary/10 text-usm-blue-primary border border-usm-blue-primary/20 font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
                {product.category} · {product.sport}
              </span>
              <h1 className="font-display font-black text-3xl text-usm-blue-dark uppercase tracking-wider mt-4">
                {productName}
              </h1>
              <p className="text-[10px] text-slate-500 font-mono mt-1.5">REF: {product.sku}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-black text-usm-blue-primary">{formatMoney(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-slate-500 line-through font-mono">{formatMoney(product.oldPrice)}</span>
              )}
              {soldOut ? (
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Ban size={13} /> {tr(language, 'Out of stock', 'Rupture de stock', 'غير متوفر')}
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400">
                  {tr(language, 'In Stock', 'En Stock', 'متوفر')}
                </span>
              )}
            </div>

            {lowStock && (
              <p className="text-xs font-bold text-amber-400 animate-pulse">
                {tr(
                  language,
                  `Only ${totalStock} left — order soon`,
                  `Plus que ${totalStock} en stock — commandez vite`,
                  `تبقى ${totalStock} قطع فقط — اطلب الآن`
                )}
              </p>
            )}

            <p className="text-xs text-slate-500 leading-relaxed border-t border-usm-border pt-4">
              {tr(language, product.description, product.descriptionFr, product.descriptionAr)}
            </p>

            {/* Colors Indicator */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2 border-t border-usm-border pt-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">
                  {tr(language, 'Color', 'Couleur', 'اللون')}
                </label>
                <div className="flex items-center gap-2">
                  {uniqueColors.map((c: any) => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c.hex)}
                      title={c.name}
                      className={`h-8 w-8 rounded-full border-2 cursor-pointer transition-all ${
                        selectedColor === c.hex ? 'border-usm-blue-primary scale-110' : 'border-usm-border'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Selection */}
            {uniqueSizes.length > 0 && uniqueSizes[0] !== 'One Size' && (
              <div className="space-y-2 border-t border-usm-border pt-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">
                  {tr(language, 'Select Size', 'Choisir la Taille', 'اختر المقاس')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((sz: any) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-usm-blue-primary text-white border-usm-blue-primary'
                          : 'bg-white text-slate-600 border-usm-border hover:border-usm-blue-primary/45'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            {!soldOut && (
              <div className="space-y-4 border-t border-usm-border pt-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                    {tr(language, 'Quantity', 'Quantité', 'الكمية')}
                  </label>
                  <div className="inline-flex items-center gap-3 bg-white border border-usm-border rounded-xl p-1.5">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="p-1.5 hover:bg-usm-blue-soft rounded-lg text-slate-600 cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-mono text-sm w-6 text-center text-usm-blue-dark">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="p-1.5 hover:bg-usm-blue-soft rounded-lg text-slate-600 cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 bg-usm-blue-primary hover:bg-usm-blue-primary/95 text-white text-xs font-black uppercase rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={15} />
                    {tr(language, 'Add to Cart', 'Ajouter au Panier', 'أضف للسلة')}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      liked ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-usm-blue-soft border-usm-border text-slate-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
                    }`}
                  >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            )}

            {/* Service Icons Grid */}
            <div className="grid grid-cols-2 gap-2.5 border-t border-usm-border pt-4">
              <div className="p-3 bg-white border border-usm-border rounded-xl flex items-center gap-2">
                <ShieldCheck className="text-usm-blue-primary shrink-0" size={16} />
                <span className="text-[10px] font-bold text-slate-600 leading-tight">
                  {tr(language, 'Official USM Product', 'Produit Officiel USM', 'منتج رسمي')}
                </span>
              </div>
              <div className="p-3 bg-white border border-usm-border rounded-xl flex items-center gap-2">
                <Truck className="text-usm-blue-primary shrink-0" size={16} />
                <span className="text-[10px] font-bold text-slate-600 leading-tight">
                  {tr(language, 'Reserve Online', 'Réserver en Ligne', 'حجز أونلاين')}
                </span>
              </div>
              <div className="p-3 bg-white border border-usm-border rounded-xl flex items-center gap-2">
                <Store className="text-usm-blue-primary shrink-0" size={16} />
                <span className="text-[10px] font-bold text-slate-600 leading-tight">
                  {tr(language, 'Pickup Available', 'Retrait en Boutique', 'استلام من المتجر')}
                </span>
              </div>
              <div className="p-3 bg-white border border-usm-border rounded-xl flex items-center gap-2">
                <Ban className="text-usm-blue-primary shrink-0" size={16} />
                <span className="text-[10px] font-bold text-slate-600 leading-tight">
                  {tr(language, 'No Online Payment', 'Aucun Paiement en Ligne', 'بدون دفع إلكتروني')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABS CONTAINER */}
        <div className="bg-white border border-usm-border rounded-2xl shadow-lg">
          <div className="flex overflow-x-auto border-b border-usm-border px-4 no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 py-4 px-3 text-xs font-bold uppercase transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-usm-blue-primary text-usm-blue-primary'
                    : 'border-transparent text-slate-500 hover:text-usm-blue-primary'
                }`}
              >
                {tr(language, tab.en, tab.fr, tab.ar)}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8 text-xs text-slate-600 leading-relaxed max-w-3xl">
            {activeTab === 'description' && (
              <p>{tr(language, product.description, product.descriptionFr, product.descriptionAr)}</p>
            )}

            {activeTab === 'details' && (
              <ul className="list-disc pl-5 rtl:pr-5 rtl:pl-0 space-y-1.5 text-slate-500">
                <li>{tr(language, 'Breathable, high-quality technical fabric', 'Tissu technique respirant et haut de gamme', 'مادة عالية الجودة قابلة للتهوية')}</li>
                <li>{tr(language, 'Finely embroidered USM crest', 'Écusson USM finement brodé', 'شعار النادي مطرز بدقة')}</li>
                <li>{tr(language, 'Comfortable athletic fit', 'Coupe athlétique et confortable', 'تصميم مريح للرياضيين')}</li>
                <li>{product.material ? `Composition: ${product.material}` : 'Matière: 100% Polyester'}</li>
              </ul>
            )}

            {activeTab === 'sizing' && (
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-usm-border text-[10px] text-slate-500 font-bold uppercase">
                    <th className="pb-2">{tr(language, 'Size', 'Taille', 'المقاس')}</th>
                    <th className="pb-2">{tr(language, 'Chest (cm)', 'Poitrine (cm)', 'عرض الصدر')}</th>
                    <th className="pb-2">{tr(language, 'Length (cm)', 'Longueur (cm)', 'الطول')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-450">
                  <tr><td className="py-2">S</td><td className="py-2">48</td><td className="py-2">68</td></tr>
                  <tr><td className="py-2">M</td><td className="py-2">52</td><td className="py-2">70</td></tr>
                  <tr><td className="py-2">L</td><td className="py-2">56</td><td className="py-2">72</td></tr>
                  <tr><td className="py-2">XL</td><td className="py-2">60</td><td className="py-2">74</td></tr>
                </tbody>
              </table>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-2">
                <p>
                  {tr(
                    language,
                    'Delivery is available across Tunisia within 24–48h, or pick up your reservation directly at the official boutique next to Stade Mustapha Ben Jannet.',
                    "La livraison est disponible dans toute la Tunisie sous 24 à 48h, ou retirez votre réservation directement à la boutique officielle à côté du Stade Mustapha Ben Jannet.",
                    'التوصيل متاح في جميع أنحاء تونس خلال 24 إلى 48 ساعة. يمكنك أيضاً استلام طلبك من المغازة الرسمية بجانب ملعب مصطفى بن جنات.'
                  )}
                </p>
                <p className="font-bold text-usm-blue-primary">
                  {tr(
                    language,
                    'No online payment — settle in person or on delivery.',
                    'Aucun paiement en ligne — réglez sur place ou à la livraison.',
                    'بدون أي دفع إلكتروني — الدفع عند الاستلام فقط.'
                  )}
                </p>
              </div>
            )}

            {activeTab === 'care' && (
              <p>{product.careInstructions || 'Lavage en machine à froid 30°C. Ne pas utiliser d’adoucissant ni de sèche-linge.'}</p>
            )}

            {activeTab === 'availability' && (
              <p>
                {soldOut
                  ? 'Actuellement en rupture de stock. Contactez le service client pour une alerte réassort.'
                  : `Actuellement disponible — ${totalStock} unités restantes en stock.`}
              </p>
            )}

            {activeTab === 'guarantee' && (
              <p>
                Garantie officielle de l&apos;Union Sportive Monastirienne. Retour et échange sous 7 jours en cas de défaut.
              </p>
            )}
          </div>
        </div>

        {/* 4. RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-6">
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-usm-blue-primary" />
              <h3 className="font-display font-black text-lg text-usm-blue-dark uppercase tracking-wider">
                {tr(language, 'Related Products', 'Produits Associés', 'منتجات ذات صلة')}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Add-To-Cart bar */}
      {!soldOut && (
        <div className="lg:hidden fixed bottom-24 left-3 right-3 z-30 bg-white border border-usm-border rounded-2xl shadow-2xl p-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{productName}</p>
            <p className="font-mono font-black text-usm-blue-primary text-sm">{formatMoney(product.price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="shrink-0 px-5 py-2.5 bg-usm-blue-primary text-white text-[11px] font-black uppercase rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag size={14} />
            {tr(language, 'Add', 'Ajouter', 'أضف')}
          </button>
        </div>
      )}
    </div>
  );
};
