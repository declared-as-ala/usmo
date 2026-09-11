'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api-client';
import {
  ShoppingBag,
  Search,
  Eye,
  SquarePen,
  Trash2,
  X,
  Save,
  ChevronDown,
  Plus,
  Minus,
  RefreshCw,
  Users,
  AlertCircle,
  Truck,
  Download,
  Calculator,
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  Sparkles,
  Package,
  Check,
} from 'lucide-react';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'tentative'
  | 'prepared'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  color?: string;
  image?: string;
  quantity: number;
  price: number; // in millimes
  subtotal: number; // in millimes
  customName?: string;
  customNumber?: string;
}

export interface BackendOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    phone2?: string;
    city: string;
    address?: string;
    email?: string;
  };
  deliveryMethod?: 'delivery' | 'pickup';
  deliveryZoneId?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  statusHistory?: { status: OrderStatus; updatedAt: string; notes?: string }[];
  shippingCompany?: string;
  trackingNumber?: string;
  privateNote?: string;
  isExchange?: boolean;
  notes?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

const TUNISIAN_GOVERNORATES = [
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Le Kef',
  'Mahdia',
  'La Manouba',
  'Médenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan',
];

const STANDARD_CLOTHING_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  'Enfant',
  'Taille Unique',
];

const getItemAvailableSizes = (item: OrderItem, catalog: any[] = []): string[] => {
  const match = catalog.find(
    (p) => (p._id || p.id) === item.productId || (p.nameFr || p.name) === item.name
  );
  const fromProduct: string[] = Array.isArray(match?.sizes)
    ? match.sizes
    : Array.isArray(match?.variants)
    ? match.variants.map((v: any) => v?.size).filter(Boolean)
    : [];

  const combined = Array.from(new Set([...fromProduct, ...STANDARD_CLOTHING_SIZES]));
  if (item.size && !combined.includes(item.size)) {
    combined.unshift(item.size);
  }
  return combined;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  tentative: 'Tentative',
  prepared: 'Préparée',
  shipped: 'En cours',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_BADGES: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-[#FEF6EE]', text: 'text-[#B54708]', border: 'border-[#F9DBAF]' },
  confirmed: { bg: 'bg-[#ECFDF3]', text: 'text-[#027A48]', border: 'border-[#A6F4C5]' },
  tentative: { bg: 'bg-[#FFFAEB]', text: 'text-[#B54708]', border: 'border-[#FEDF89]' },
  prepared: { bg: 'bg-[#F4F3FF]', text: 'text-[#5925DC]', border: 'border-[#D9D6FE]' },
  shipped: { bg: 'bg-[#EFF8FF]', text: 'text-[#175CD3]', border: 'border-[#B2DDFF]' },
  delivered: { bg: 'bg-[#ECFDF3]', text: 'text-[#027A48]', border: 'border-[#A6F4C5]' },
  cancelled: { bg: 'bg-[#FEF3F2]', text: 'text-[#B42318]', border: 'border-[#FECDCA]' },
};

const formatDt = (millimes: number) => {
  const dt = (millimes || 0) / 1000;
  return Number.isInteger(dt) ? `${dt} DT` : `${dt.toFixed(3)} DT`;
};

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [nowTimestamp] = useState(() => Date.now());

  // Export state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'new'>('edit');
  const [currentOrder, setCurrentOrder] = useState<BackendOrder | null>(null);
  const [saving, setSaving] = useState(false);

  // Drawer Form fields
  const [formStatus, setFormStatus] = useState<OrderStatus>('pending');
  const [formShippingCompany, setFormShippingCompany] = useState<string>('-');
  const [formPrivateNote, setFormPrivateNote] = useState<string>('');
  const [formIsExchange, setFormIsExchange] = useState<boolean>(false);
  const [formCustomerName, setFormCustomerName] = useState<string>('');
  const [formCustomerPhone, setFormCustomerPhone] = useState<string>('');
  const [formCustomerPhone2, setFormCustomerPhone2] = useState<string>('');
  const [formCustomerCity, setFormCustomerCity] = useState<string>('Nabeul');
  const [formCustomerAddress, setFormCustomerAddress] = useState<string>('');
  const [formCustomerEmail, setFormCustomerEmail] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formItems, setFormItems] = useState<OrderItem[]>([]);
  const [formShippingCost, setFormShippingCost] = useState<number>(8000);

  // Catalog products for adding items
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Delivery zones admin manager toggle
  const [showZoneManager, setShowZoneManager] = useState(false);
  const [zones, setZones] = useState<any[]>([]);
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});
  const [savingZoneId, setSavingZoneId] = useState<string | null>(null);

  // Load delivery zones
  const loadZones = useCallback(async () => {
    try {
      const z = await api.getDeliveryZones();
      setZones(z || []);
      const initPrices: Record<string, string> = {};
      (z || []).forEach((item: any) => {
        initPrices[item._id] = ((item.price || 0) / 1000).toString();
      });
      setEditingPrice(initPrices);
    } catch (err) {}
  }, []);

  const handleUpdateZonePrice = async (zoneId: string) => {
    const val = parseFloat(editingPrice[zoneId] || '0');
    if (isNaN(val) || val < 0) return;
    const millimes = Math.round(val * 1000);
    setSavingZoneId(zoneId);
    try {
      await api.updateDeliveryZone(zoneId, { price: millimes });
      await loadZones();
      alert('Tarif de livraison mis à jour avec succès !');
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setSavingZoneId(null);
    }
  };

  // Load catalog products for order items selection
  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      let prods: any[] = [];
      try {
        const res = await api.getAdminProducts();
        if (res?.products && Array.isArray(res.products) && res.products.length > 0) {
          prods = res.products;
        }
      } catch (adminErr) {
        console.warn('getAdminProducts notice, falling back to public products', adminErr);
      }
      if (prods.length === 0) {
        const publicRes = await api.getProducts({ limit: 100 });
        if (publicRes?.products && Array.isArray(publicRes.products)) {
          prods = publicRes.products;
        }
      }
      setCatalogProducts(prods);
    } catch (err) {
      console.error('Error loading catalog products:', err);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  // Close product dropdown on outside click
  useEffect(() => {
    if (!productDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node)
      ) {
        setProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [productDropdownOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = () => setShowExportMenu(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showExportMenu]);

  // Load Orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await api.getAdminOrders(params);
      setOrders(data.orders || []);
      setTotal(data.total || (data.orders || []).length);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => loadOrders(), 250);
    return () => clearTimeout(t);
  }, [loadOrders]);

  useEffect(() => {
    loadZones();
    loadCatalog();
  }, [loadZones, loadCatalog]);

  // Counts by status
  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders]
  );
  const confirmedCount = useMemo(
    () => orders.filter((o) => o.status === 'confirmed').length,
    [orders]
  );
  const tentativeCount = useMemo(
    () => orders.filter((o) => o.status === 'tentative').length,
    [orders]
  );
  const cancelledCount = useMemo(
    () => orders.filter((o) => o.status === 'cancelled').length,
    [orders]
  );

  // Phone frequency to detect "Client régulier"
  const phoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const p = o.customer?.phone?.replace(/\s+/g, '');
      if (p) counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filtered orders (in memory filters for product and period)
  const displayedOrders = useMemo(() => {
    return orders.filter((order) => {
      // Product filter
      if (productFilter !== 'all') {
        const hasProd = order.items.some(
          (item) => item.name?.toLowerCase() === productFilter.toLowerCase()
        );
        if (!hasProd) return false;
      }

      // Period filter
      if (periodFilter !== 'all') {
        const orderDate = new Date(order.createdAt).getTime();
        if (periodFilter === 'today') {
          const oneDay = 24 * 60 * 60 * 1000;
          if (nowTimestamp - orderDate > oneDay) return false;
        } else if (periodFilter === '7days') {
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (nowTimestamp - orderDate > sevenDays) return false;
        } else if (periodFilter === 'month') {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (nowTimestamp - orderDate > thirtyDays) return false;
        }
      }

      return true;
    });
  }, [orders, productFilter, periodFilter, nowTimestamp]);

  // Unique products for product filter dropdown
  const uniqueProductNames = useMemo(() => {
    const names = new Set<string>();
    orders.forEach((o) => o.items.forEach((i) => i.name && names.add(i.name)));
    return Array.from(names);
  }, [orders]);

  // Totals calculations for the summary bar / footer
  const totals = useMemo(() => {
    const list =
      selectedOrderIds.length > 0
        ? displayedOrders.filter((o) => selectedOrderIds.includes(o._id))
        : displayedOrders;

    const totalOrders = list.length;
    const totalQuantity = list.reduce(
      (sum, o) =>
        sum + (o.items?.reduce((iSum, it) => iSum + (Number(it.quantity) || 1), 0) || 0),
      0
    );
    const totalAmount = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      totalOrders,
      totalQuantity,
      totalAmount,
    };
  }, [displayedOrders, selectedOrderIds]);

  // Select all checkboxes
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(displayedOrders.map((o) => o._id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Drawer for Create / View / Edit
  const openDrawer = (order: BackendOrder | null, mode: 'view' | 'edit' | 'new') => {
    setCurrentOrder(order);
    setDrawerMode(mode);

    if (order) {
      setFormStatus(order.status || 'pending');
      setFormShippingCompany(order.shippingCompany || '-');
      setFormPrivateNote(order.privateNote || '');
      setFormIsExchange(!!order.isExchange);
      setFormCustomerName(order.customer?.name || '');
      setFormCustomerPhone(order.customer?.phone || '');
      setFormCustomerPhone2(order.customer?.phone2 || '');
      setFormCustomerCity(order.customer?.city || 'Monastir');
      setFormCustomerAddress(order.customer?.address || '');
      setFormCustomerEmail(order.customer?.email || '');
      setFormNotes(order.notes || '');
      setFormItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);
      setFormShippingCost(order.shippingCost ?? (order.customer?.city === 'Monastir' ? 4000 : 8000));
    } else {
      // New order defaults
      setFormStatus('pending');
      setFormShippingCompany('-');
      setFormPrivateNote('');
      setFormIsExchange(false);
      setFormCustomerName('');
      setFormCustomerPhone('');
      setFormCustomerPhone2('');
      setFormCustomerCity('Monastir');
      setFormCustomerAddress('');
      setFormCustomerEmail('');
      setFormNotes('');
      setFormItems([]);
      setFormShippingCost(4000);
    }

    setProductSearch('');
    setProductDropdownOpen(false);
    if (catalogProducts.length === 0) {
      loadCatalog();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrentOrder(null);
  };

  // Filtered catalog products for order items selection
  const filteredCatalogProducts = useMemo(() => {
    if (!productSearch.trim()) return catalogProducts.slice(0, 20);
    const q = productSearch.toLowerCase();
    return catalogProducts.filter((p) => {
      const name = (p.nameFr || p.name || '').toLowerCase();
      const cat = (p.category?.name || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || sku.includes(q);
    });
  }, [catalogProducts, productSearch]);

  // Export handlers
  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      if (format === 'excel') {
        const blob = await api.exportOrdersExcel();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commandes_usm_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await api.exportOrdersPdf();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commandes_usm_${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // Update item in drawer items table
  const handleUpdateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setFormItems((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'price') {
        const qty = Math.max(1, Number(target.quantity) || 1);
        const pr = Math.max(0, Number(target.price) || 0);
        target.quantity = qty;
        target.price = pr;
        target.subtotal = qty * pr;
      }
      next[index] = target;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProductToOrder = (prod: any) => {
    const rawPrice =
      typeof prod.price === 'number'
        ? prod.price
        : parseFloat(String(prod.price).replace(/[^\d.]/g, '')) || 0;
    const priceMillimes = rawPrice > 1000 ? rawPrice : Math.round(rawPrice * 1000);

    const defaultSize =
      Array.isArray(prod.sizes) && prod.sizes.length > 0
        ? prod.sizes[0]
        : Array.isArray(prod.variants) && prod.variants[0]?.size
        ? prod.variants[0].size
        : 'M';

    const newItem: OrderItem = {
      productId: prod._id || prod.id || `custom-${prod.name || 'item'}`,
      name: prod.nameFr || prod.name || 'Produit USM',
      size: defaultSize,
      color: prod.colors?.[0] || '',
      image: prod.coverImage || prod.imageUrl || prod.images?.[0] || '',
      quantity: 1,
      price: priceMillimes,
      subtotal: priceMillimes,
    };

    setFormItems((prev) => [...prev, newItem]);
    setProductSearch('');
    setProductDropdownOpen(false);
  };

  // Calculations for drawer summary
  const drawerSubtotal = useMemo(() => {
    return formItems.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);
  }, [formItems]);

  const drawerTotal = useMemo(() => {
    return drawerSubtotal + (Number(formShippingCost) || 0);
  }, [drawerSubtotal, formShippingCost]);

  // Save changes from Drawer
  const handleSaveDrawer = async () => {
    if (!formCustomerName.trim() || !formCustomerPhone.trim()) {
      alert('Veuillez renseigner le nom et le numéro de téléphone du client.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        status: formStatus,
        shippingCompany: formShippingCompany === '-' ? '' : formShippingCompany,
        privateNote: formPrivateNote,
        isExchange: formIsExchange,
        customer: {
          name: formCustomerName.trim(),
          phone: formCustomerPhone.trim(),
          phone2: formCustomerPhone2.trim() || undefined,
          city: formCustomerCity,
          address: formCustomerAddress.trim(),
          email: formCustomerEmail.trim() || undefined,
        },
        notes: formNotes.trim(),
        items: formItems,
        subtotal: drawerSubtotal,
        shippingCost: formShippingCost,
        total: drawerTotal,
      };

      if (formStatus === 'confirmed' && (!currentOrder || currentOrder.status !== 'confirmed')) {
        payload.confirmedAt = new Date().toISOString();
      }

      if (drawerMode === 'new') {
        payload.customerName = payload.customer.name;
        payload.customerPhone = payload.customer.phone;
        payload.customerCity = payload.customer.city;
        payload.customerAddress = payload.customer.address;
        payload.customerEmail = payload.customer.email;
        payload.deliveryMethod = 'delivery';
        await api.createOrder(payload);
      } else if (currentOrder) {
        await api.updateOrder(currentOrder._id, payload);
      }

      await loadOrders();
      closeDrawer();
    } catch (err: any) {
      alert(`Erreur lors de l'enregistrement: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete Order with confirmation
  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }
    try {
      await api.deleteOrder(id);
      await loadOrders();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      {/* ── TOP HEADER (Screenshot 1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0D63FF] flex items-center justify-center text-white shadow-sm shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Commandes
            </h1>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {total} commandes
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              = En attente ({pendingCount}) - Confirmée ({confirmedCount}) + Tentative ({tentativeCount}) + Annulée ({cancelledCount})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowZoneManager(!showZoneManager)}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-[#0D63FF] hover:border-[#0D63FF]/40 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Gérer les tarifs de livraison par région"
          >
            <Truck size={16} />
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-[#0D63FF] hover:border-[#0D63FF]/40 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 text-xs font-bold disabled:opacity-50"
            >
              <Download size={14} className={exporting ? 'animate-bounce' : ''} />
              <span>{exporting ? 'Export...' : 'Exporter'}</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 min-w-[160px]">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-emerald-600">📊</span> Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-red-600">📄</span> PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => openDrawer(null, 'new')}
            className="px-5 py-2.5 bg-[#0D63FF] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Ajouter une commande</span>
          </button>
        </div>
      </div>

      {/* ── DELIVERY ZONE ADMIN MANAGER (COLLAPSIBLE) ── */}
      {showZoneManager && zones.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Truck size={16} className="text-[#0D63FF]" />
                Tarifs de Livraison par Région
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                4.000 DT pour Monastir, 8.000 DT pour les autres gouvernorats. Modifiez les montants ci-dessous si nécessaire.
              </p>
            </div>
            <button
              onClick={() => setShowZoneManager(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {zones.map((zone) => (
              <div
                key={zone._id}
                className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{zone.nameFr || zone.name}</p>
                  <p className="text-[10px] text-slate-500">Code zone : {zone.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={editingPrice[zone._id] ?? (zone.price || 0) / 1000}
                    onChange={(e) =>
                      setEditingPrice({ ...editingPrice, [zone._id]: e.target.value })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right font-mono font-bold bg-white"
                  />
                  <span className="text-xs font-bold text-slate-600">DT</span>
                  <button
                    onClick={() => handleUpdateZonePrice(zone._id)}
                    disabled={savingZoneId === zone._id}
                    className="px-3 py-1 bg-[#0D63FF] text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingZoneId === zone._id ? '…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TABS ROW (Screenshot 1: Normal only, abandoned/supprimées omitted per instructions) ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className="bg-[#0D63FF] text-white px-6 py-2.5 rounded-2xl text-xs font-bold shadow-xs cursor-pointer transition-all hover:bg-blue-700"
        >
          Normal ({total})
        </button>
      </div>

      {/* ── SEARCH & FILTER BAR (Screenshot 1) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[260px] pl-2">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher (numéro, client, téléphone)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Toutes ({total})</option>
              <option value="pending">En attente ({pendingCount})</option>
              <option value="confirmed">Confirmée ({confirmedCount})</option>
              <option value="tentative">Tentative ({tentativeCount})</option>
              <option value="prepared">Préparée</option>
              <option value="shipped">En cours</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée ({cancelledCount})</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Product Dropdown */}
          <div className="relative">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs max-w-[170px] truncate"
            >
              <option value="all">Tous les produits</option>
              {uniqueProductNames.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Period Dropdown */}
          <div className="relative">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Toute la période</option>
              <option value="today">Aujourd'hui</option>
              <option value="7days">7 derniers jours</option>
              <option value="month">Ce mois</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={loadOrders}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── ORDERS TABLE (Screenshot 1) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {error && (
            <div className="p-8 text-center text-red-500 text-xs font-semibold flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading && !error && (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold animate-pulse">
              Chargement des commandes en cours...
            </div>
          )}

          {!loading && !error && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        displayedOrders.length > 0 &&
                        selectedOrderIds.length === displayedOrders.length
                      }
                      className="rounded border-slate-300 accent-[#0D63FF] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 whitespace-nowrap">ID</th>
                  <th className="py-3.5 px-4">CLIENT</th>
                  <th className="py-3.5 px-4">PRODUIT</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">QUANTITÉ</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">DATE & HEURE</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">TÉLÉPHONE</th>
                  <th className="py-3.5 px-4">VILLE</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">STATUT</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">TOTAL</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedOrders.map((order) => {
                  const statusStyle =
                    STATUS_BADGES[order.status] || STATUS_BADGES.pending;
                  const isChecked = selectedOrderIds.includes(order._id);
                  const cleanPhone = order.customer?.phone?.replace(/\s+/g, '') || '';
                  const isRegularCustomer = (phoneCounts[cleanPhone] || 0) > 1;
                  const orderQuantity =
                    order.items?.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) || 0;

                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(order._id)}
                          className="rounded border-slate-300 accent-[#0D63FF] cursor-pointer"
                        />
                      </td>

                      {/* 1. ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => openDrawer(order, 'edit')}
                          className="font-bold text-slate-900 hover:text-[#0D63FF] transition-colors cursor-pointer text-xs block"
                        >
                          #{order.orderNumber?.replace(/^ORD-/, '') || order.orderNumber}
                        </button>
                        {order.items?.some((it) => it.customName || it.customNumber) && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200 mt-1 whitespace-nowrap">
                            ⭐ Personnalisé
                          </span>
                        )}
                      </td>

                      {/* 2. CLIENT */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">
                            {order.customer?.name || 'Client sans nom'}
                          </span>
                          {isRegularCustomer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ECE9FE] text-[#5925DC] border border-[#D9D6FE]">
                              <Users size={10} /> Client régulier
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. PRODUIT */}
                      <td className="py-3.5 px-4 min-w-[160px] max-w-[240px]">
                        {order.items && order.items.length > 0 ? (
                          <div>
                            <p
                              className="font-semibold text-slate-900 truncate text-xs"
                              title={order.items
                                .map(
                                  (it) =>
                                    `${it.name} (${it.size || 'Unique'}) x${it.quantity || 1}`
                                )
                                .join(', ')}
                            >
                              {order.items[0]?.name || 'Article USM'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                              {order.items[0]?.size && (
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium text-slate-600">
                                  T: {order.items[0].size}
                                </span>
                              )}
                              {order.items.length > 1 && (
                                <span
                                  className="text-[10px] font-bold text-[#0D63FF] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded cursor-help"
                                  title={order.items
                                    .slice(1)
                                    .map(
                                      (it) =>
                                        `${it.name} (${it.size || '-'}) x${it.quantity || 1}`
                                    )
                                    .join(', ')}
                                >
                                  +{order.items.length - 1} autre
                                  {order.items.length > 2 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 4. QUANTITÉ */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs font-mono">
                          {orderQuantity}
                        </span>
                      </td>

                      {/* 5. DATE & HEURE */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <p className="text-slate-800 font-medium text-xs">
                            {formatDateOnly(order.createdAt)}
                            <span className="text-slate-400 font-normal font-mono ml-1.5 text-[11px]">
                              {(() => {
                                const d = new Date(order.createdAt);
                                if (isNaN(d.getTime())) return '';
                                return `${String(d.getHours()).padStart(2, '0')}:${String(
                                  d.getMinutes()
                                ).padStart(2, '0')}`;
                              })()}
                            </span>
                          </p>
                          {order.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                              Conf: {formatDateTime(order.confirmedAt || order.updatedAt || order.createdAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. TÉLÉPHONE */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {order.customer?.phone ? (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="hover:text-[#0D63FF] hover:underline"
                          >
                            {order.customer.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* 7. VILLE */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {order.customer?.city || '—'}
                      </td>

                      {/* 8. STATUT */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        {order.shippingCompany && order.shippingCompany !== '-' && (
                          <span className="block text-[9px] font-bold text-emerald-700 mt-0.5">
                            {order.shippingCompany} ✓
                          </span>
                        )}
                      </td>

                      {/* 9. TOTAL */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap font-mono">
                        {formatDt(order.total)}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDrawer(order, 'view')}
                            title="Voir la commande"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openDrawer(order, 'edit')}
                            title="Modifier la commande"
                            className="p-1.5 text-slate-400 hover:text-[#0D63FF] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <SquarePen size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Supprimer la commande"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {displayedOrders.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-slate-400 text-xs font-medium">
                      Aucune commande ne correspond à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* TABLE FOOTER / TOTAUX INTÉGRÉS */}
              {displayedOrders.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-slate-900 text-xs">
                    <td className="py-3.5 px-4" colSpan={4}>
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[10px] tracking-wider text-slate-500 font-bold">
                          Total
                        </span>
                        <span className="bg-slate-200/80 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {totals.totalOrders} commande{totals.totalOrders > 1 ? 's' : ''}
                        </span>
                        {selectedOrderIds.length > 0 && (
                          <span className="bg-blue-100 text-[#0D63FF] text-[11px] font-bold px-2 py-0.5 rounded-full">
                            ({selectedOrderIds.length} sélectionnée{selectedOrderIds.length > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Under QUANTITÉ */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-lg bg-white border border-slate-300 shadow-2xs font-mono font-black text-xs text-[#0D63FF]">
                        {totals.totalQuantity}
                      </span>
                    </td>
                    {/* Under DATE & HEURE, TÉLÉPHONE, VILLE, STATUT */}
                    <td colSpan={4} className="py-3.5 px-4 text-right text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      Montant Total :
                    </td>
                    {/* Under TOTAL */}
                    <td className="py-3.5 px-4 font-black text-slate-950 text-xs whitespace-nowrap font-mono text-[#0D63FF]">
                      {formatDt(totals.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>

        {!loading && displayedOrders.length > 0 && (
          <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between px-4 bg-white">
            <span>
              {selectedOrderIds.length > 0
                ? `${selectedOrderIds.length} sélectionnée(s)`
                : ''}
            </span>
            <span>
              Affichage de {displayedOrders.length} sur {total} commande(s)
            </span>
          </div>
        )}
      </div>

      {/* ── BARRE DE TOTAUX / SUMMARY BAR (Chiffres globaux & sélectionnés) ── */}
      {!loading && displayedOrders.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0D63FF] shrink-0">
              <Calculator size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {selectedOrderIds.length > 0
                  ? `Total des commandes sélectionnées (${selectedOrderIds.length})`
                  : `Total des commandes affichées (${totals.totalOrders})`}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedOrderIds.length > 0
                  ? `Calculé sur ${selectedOrderIds.length} commande(s) cochée(s) sur ${displayedOrders.length}`
                  : `Calculé sur l'ensemble des ${displayedOrders.length} commande(s) selon vos filtres`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Total Commandes */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                Commandes
              </span>
              <span className="text-base font-black text-slate-900 font-mono">
                {totals.totalOrders.toLocaleString()}
              </span>
            </div>

            {/* Total Quantité */}
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl px-4 py-2 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                Quantité Totale
              </span>
              <span className="text-base font-black text-amber-700 font-mono">
                {totals.totalQuantity.toLocaleString()}
              </span>
              <span className="text-[9px] text-amber-600 block -mt-0.5">articles</span>
            </div>

            {/* Total Montant */}
            <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl px-5 py-2 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                Montant Total
              </span>
              <span className="text-base font-black text-emerald-700 font-mono">
                {formatDt(totals.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER / MODAL: "MODIFIER LA COMMANDE" (Ultra-responsive & Enhanced) ── */}
      <AnimatePresence>
        {drawerOpen && (
          <React.Fragment>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-[#F8FAFC] z-50 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
            >
              {/* Drawer Top Header */}
              <div className="p-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0D63FF] shrink-0">
                    <SquarePen size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {drawerMode === 'new'
                          ? 'Ajouter une commande'
                          : drawerMode === 'view'
                          ? 'Détails de la commande'
                          : 'Modifier la commande'}
                      </h2>
                      {currentOrder && (
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          #{currentOrder.orderNumber}
                        </span>
                      )}
                      {currentOrder && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            STATUS_BADGES[formStatus]?.bg || 'bg-slate-100'
                          } ${STATUS_BADGES[formStatus]?.text || 'text-slate-700'} ${
                            STATUS_BADGES[formStatus]?.border || 'border-slate-200'
                          }`}
                        >
                          {STATUS_LABELS[formStatus] || formStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {currentOrder
                        ? `Créée le ${formatDateTime(currentOrder.createdAt)}`
                        : 'Création manuelle d’une nouvelle commande'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveDrawer}
                    disabled={saving}
                    className="px-4 py-2 bg-[#0D63FF] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{saving ? 'Enregistrement…' : 'Enregistrer'}</span>
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Fermer (Échap)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* CARD 1: STATUT & EXPÉDITION */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-[#0D63FF]" />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Statut & Expédition
                      </h3>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={formIsExchange}
                        onChange={(e) => setFormIsExchange(e.target.checked)}
                        className="rounded border-slate-300 accent-[#0D63FF] cursor-pointer"
                      />
                      <span>Commande d'échange</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* STATUT */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Statut de la commande
                      </label>
                      <div className="relative">
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none transition-all"
                        >
                          <option value="pending">⏳ En attente</option>
                          <option value="confirmed">✅ Confirmée</option>
                          <option value="tentative">⚠️ Tentative</option>
                          <option value="prepared">📦 En préparation</option>
                          <option value="shipped">🚚 En cours de livraison</option>
                          <option value="delivered">🎉 Livrée</option>
                          <option value="cancelled">❌ Annulée</option>
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* SOCIÉTÉ DE LIVRAISON */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Société de livraison
                      </label>
                      <div className="relative">
                        <select
                          value={formShippingCompany}
                          onChange={(e) => setFormShippingCompany(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none transition-all"
                        >
                          <option value="-">— Non assignée —</option>
                          <option value="Navex">Navex</option>
                          <option value="Axess Logistique">Axess Logistique</option>
                          <option value="First Delivery">First Delivery</option>
                          <option value="Autre">Autre</option>
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* NOTE PRIVÉE ADMIN */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Note interne / privée (visible uniquement par les admins)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Client a demandé une livraison après 17h, rappel prévu demain..."
                      value={formPrivateNote}
                      onChange={(e) => setFormPrivateNote(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 rounded-xl p-2.5 outline-none transition-all resize-none placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* CARD 2: DÉTAILS DU CLIENT */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User size={16} className="text-[#0D63FF]" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Informations Client & Livraison
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* NOM */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Nom et Prénom *
                      </label>
                      <input
                        type="text"
                        placeholder="Foulen ben Foulen"
                        value={formCustomerName}
                        onChange={(e) => setFormCustomerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-800 rounded-xl p-2.5 outline-none transition-all placeholder-slate-400"
                      />
                    </div>

                    {/* TÉLÉPHONE */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Téléphone Principal *
                      </label>
                      <input
                        type="tel"
                        placeholder="Ex: 54 123 456"
                        value={formCustomerPhone}
                        onChange={(e) => setFormCustomerPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs font-bold font-mono text-slate-800 rounded-xl p-2.5 outline-none transition-all placeholder-slate-400"
                      />
                    </div>

                    {/* TÉLÉPHONE 2 */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Téléphone Secondaire (Optionnel)
                      </label>
                      <input
                        type="tel"
                        placeholder="Ex: 22 345 678"
                        value={formCustomerPhone2}
                        onChange={(e) => setFormCustomerPhone2(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs font-mono text-slate-800 rounded-xl p-2.5 outline-none transition-all placeholder-slate-400"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Adresse Email
                      </label>
                      <input
                        type="email"
                        placeholder="client@domaine.tn"
                        value={formCustomerEmail}
                        onChange={(e) => setFormCustomerEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 rounded-xl p-2.5 outline-none transition-all placeholder-slate-400"
                      />
                    </div>

                    {/* GOUVERNORAT */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Gouvernorat / Ville
                      </label>
                      <div className="relative">
                        <select
                          value={formCustomerCity}
                          onChange={(e) => {
                            const newCity = e.target.value;
                            setFormCustomerCity(newCity);
                            // Set shipping cost dynamically (Monastir: 4 DT, others: 8 DT)
                            setFormShippingCost(newCity === 'Monastir' ? 4000 : 8000);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none transition-all"
                        >
                          {TUNISIAN_GOVERNORATES.map((g) => (
                            <option key={g} value={g}>
                              {g} {g === 'Monastir' ? '(Frais réduits : 4 DT)' : '(Frais standard : 8 DT)'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* FRAIS DE LIVRAISON */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Frais de livraison (DT)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={(formShippingCost || 0) / 1000}
                          onChange={(e) =>
                            setFormShippingCost(
                              Math.round((parseFloat(e.target.value) || 0) * 1000)
                            )
                          }
                          className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs font-bold font-mono text-slate-800 rounded-xl p-2.5 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          DT
                        </span>
                      </div>
                    </div>

                    {/* ADRESSE COMPLÈTE */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Adresse complète de livraison
                      </label>
                      <input
                        type="text"
                        placeholder="Rue, Numéro, Bâtiment, Code postal..."
                        value={formCustomerAddress}
                        onChange={(e) => setFormCustomerAddress(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 rounded-xl p-2.5 outline-none transition-all placeholder-slate-400"
                      />
                    </div>

                    {/* NOTE DU CLIENT */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Notes complémentaires du client
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Instructions spéciales laissées par le client..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 rounded-xl p-2.5 outline-none transition-all resize-none placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 3: SÉLECTIONNER UN PRODUIT (CATALOGUE) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-[#0D63FF]" />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Sélectionner & Ajouter un produit
                      </h3>
                    </div>
                    {catalogProducts.length > 0 && (
                      <span className="text-[11px] font-bold text-slate-400">
                        {catalogProducts.length} articles au catalogue
                      </span>
                    )}
                  </div>

                  <div ref={productDropdownRef} className="relative">
                    <div className="relative">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Rechercher un produit à ajouter (ex: Maillot officiel, Polo, Casquette)..."
                        value={productSearch}
                        onFocus={() => {
                          setProductDropdownOpen(true);
                          if (catalogProducts.length === 0) loadCatalog();
                        }}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setProductDropdownOpen(true);
                        }}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 rounded-xl pl-10 pr-28 py-3 outline-none transition-all shadow-2xs placeholder-slate-400"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {productSearch && (
                          <button
                            type="button"
                            onClick={() => setProductSearch('')}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setProductDropdownOpen((prev) => !prev);
                            if (!productDropdownOpen && catalogProducts.length === 0) loadCatalog();
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0D63FF] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Catalogue</span>
                          <ChevronDown size={13} className={productDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                        </button>
                      </div>
                    </div>

                    {/* Product Search Dropdown list */}
                    {productDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto z-30 divide-y divide-slate-100">
                        <div className="p-2.5 px-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Produits disponibles ({filteredCatalogProducts.length})</span>
                          {loadingCatalog && <span className="text-[#0D63FF] animate-pulse">Chargement…</span>}
                        </div>
                        {filteredCatalogProducts.map((prod) => (
                          <div
                            key={prod._id || prod.id}
                            className="p-3 px-4 flex items-center justify-between hover:bg-blue-50/40 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={prod.coverImage || prod.imageUrl || prod.images?.[0] || '/logo foot.png'}
                                alt=""
                                className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-100"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-900 truncate">
                                  {prod.nameFr || prod.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-slate-400">
                                    {prod.category?.name || 'Boutique'}
                                  </span>
                                  {prod.stockStatus === 'OUT_OF_STOCK' ? (
                                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                                      Rupture
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      En stock
                                    </span>
                                  )}
                                  {Array.isArray(prod.sizes) && prod.sizes.length > 0 && (
                                    <span className="text-[9px] text-slate-500 hidden sm:inline">
                                      Tailles : {prod.sizes.slice(0, 4).join(', ')}{prod.sizes.length > 4 ? '…' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-mono font-black text-xs text-slate-900">
                                {formatDt(
                                  typeof prod.price === 'number' && prod.price > 1000
                                    ? prod.price
                                    : Math.round((parseFloat(prod.price) || 0) * 1000)
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddProductToOrder(prod)}
                                className="px-3 py-1.5 bg-[#0D63FF] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                              >
                                <Plus size={13} />
                                <span>Ajouter</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        {filteredCatalogProducts.length === 0 && !loadingCatalog && (
                          <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                            <p>Aucun produit ne correspond à votre recherche.</p>
                            <button
                              type="button"
                              onClick={loadCatalog}
                              className="px-3 py-1 text-xs font-bold text-[#0D63FF] hover:underline cursor-pointer"
                            >
                              Actualiser le catalogue
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD 4: ARTICLES COMMANDÉS (RESPONSIVE TABLE & CARDS) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={16} className="text-[#0D63FF]" />
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Articles de la commande ({formItems.length})
                      </h3>
                    </div>
                    {formItems.length > 0 && (
                      <span className="text-[11px] font-bold text-slate-500">
                        {formItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0)} article(s) au total
                      </span>
                    )}
                  </div>

                  {/* DESKTOP TABLE VIEW (>= 640px) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-2.5 px-3">Produit & Flocage</th>
                          <th className="py-2.5 px-3">Taille</th>
                          <th className="py-2.5 px-3">Couleur</th>
                          <th className="py-2.5 px-3 text-center">Qté</th>
                          <th className="py-2.5 px-3 text-right">Prix Unit.</th>
                          <th className="py-2.5 px-3 text-right">Sous-total</th>
                          <th className="py-2.5 px-2 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formItems.map((item, idx) => {
                          const availableSizes = getItemAvailableSizes(item, catalogProducts);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              {/* PRODUIT & FLOCAGE */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={item.image || '/logo foot.png'}
                                    alt=""
                                    className="w-11 h-11 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                                  />
                                  <div className="min-w-0 max-w-[200px]">
                                    <span className="font-bold text-slate-900 block truncate" title={item.name}>
                                      {item.name}
                                    </span>
                                    {/* Flocage inputs */}
                                    <div className="mt-1 flex items-center gap-1">
                                      <input
                                        type="text"
                                        placeholder="Nom flocage"
                                        value={item.customName || ''}
                                        onChange={(e) => handleUpdateItem(idx, 'customName', e.target.value.toUpperCase())}
                                        className="w-24 px-1.5 py-0.5 border border-slate-200 bg-white rounded text-[10px] font-bold text-slate-700 outline-none focus:border-[#0D63FF]"
                                        title="Nom floqué"
                                      />
                                      <input
                                        type="text"
                                        placeholder="N°"
                                        maxLength={2}
                                        value={item.customNumber || ''}
                                        onChange={(e) => handleUpdateItem(idx, 'customNumber', e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-9 px-1 py-0.5 border border-slate-200 bg-white rounded text-[10px] font-bold text-center text-slate-700 outline-none focus:border-[#0D63FF]"
                                        title="Numéro floqué"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* TAILLE EDITABLE */}
                              <td className="py-3 px-3">
                                <div className="space-y-1">
                                  <select
                                    value={availableSizes.includes(item.size) ? item.size : '__custom__'}
                                    onChange={(e) => {
                                      if (e.target.value === '__custom__') {
                                        handleUpdateItem(idx, 'size', '');
                                      } else {
                                        handleUpdateItem(idx, 'size', e.target.value);
                                      }
                                    }}
                                    className="w-28 bg-white border border-slate-200 focus:border-[#0D63FF] rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                                  >
                                    {availableSizes.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                    <option value="__custom__">Autre...</option>
                                  </select>
                                  {(!availableSizes.includes(item.size) || item.size === '') && (
                                    <input
                                      type="text"
                                      placeholder="Taille..."
                                      value={item.size || ''}
                                      onChange={(e) => handleUpdateItem(idx, 'size', e.target.value)}
                                      className="w-28 px-1.5 py-0.5 bg-white border border-[#0D63FF] rounded text-[11px] font-bold text-slate-800 outline-none"
                                    />
                                  )}
                                </div>
                              </td>

                              {/* COULEUR EDITABLE */}
                              <td className="py-3 px-3">
                                <input
                                  type="text"
                                  placeholder="Couleur"
                                  value={item.color || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'color', e.target.value)}
                                  className="w-24 px-2 py-1 bg-white border border-slate-200 focus:border-[#0D63FF] rounded-lg text-xs font-semibold text-slate-700 outline-none"
                                />
                              </td>

                              {/* QTÉ STEPPER */}
                              <td className="py-3 px-3 text-center">
                                <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, (Number(item.quantity) || 1) - 1))}
                                    className="px-2 py-1 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleUpdateItem(
                                        idx,
                                        'quantity',
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-10 py-1 text-center font-bold text-xs outline-none border-x border-slate-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItem(idx, 'quantity', (Number(item.quantity) || 1) + 1)}
                                    className="px-2 py-1 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </td>

                              {/* PRIX UNITAIRE */}
                              <td className="py-3 px-3 text-right">
                                <div className="inline-flex items-center gap-1 justify-end">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={(item.price || 0) / 1000}
                                    onChange={(e) =>
                                      handleUpdateItem(
                                        idx,
                                        'price',
                                        Math.round(
                                          (parseFloat(e.target.value) || 0) * 1000
                                        )
                                      )
                                    }
                                    className="w-16 px-1.5 py-1 border border-slate-200 rounded-lg text-right font-mono font-bold text-xs outline-none focus:border-[#0D63FF]"
                                  />
                                  <span className="text-[10px] text-slate-400 font-bold">DT</span>
                                </div>
                              </td>

                              {/* TOTAL ITEM */}
                              <td className="py-3 px-3 text-right font-black font-mono text-slate-900 whitespace-nowrap">
                                {formatDt(item.subtotal || item.price * item.quantity)}
                              </td>

                              {/* REMOVE TRASH BUTTON */}
                              <td className="py-3 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Supprimer cet article"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {formItems.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-8 text-center text-slate-400 text-xs font-medium"
                            >
                              Aucun article dans cette commande. Utilisez le sélecteur ci-dessus pour ajouter des produits.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS VIEW (< 640px) */}
                  <div className="block sm:hidden space-y-3">
                    {formItems.map((item, idx) => {
                      const availableSizes = getItemAvailableSizes(item, catalogProducts);
                      return (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.image || '/logo foot.png'}
                                alt=""
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-900 truncate">
                                  {item.name}
                                </p>
                                <p className="font-mono font-bold text-xs text-[#0D63FF] mt-0.5">
                                  {formatDt(item.subtotal || item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Attributes grid */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                            {/* Taille */}
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                                Taille
                              </label>
                              <select
                                value={availableSizes.includes(item.size) ? item.size : '__custom__'}
                                onChange={(e) => {
                                  if (e.target.value === '__custom__') {
                                    handleUpdateItem(idx, 'size', '');
                                  } else {
                                    handleUpdateItem(idx, 'size', e.target.value);
                                  }
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800"
                              >
                                {availableSizes.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                                <option value="__custom__">Autre...</option>
                              </select>
                              {(!availableSizes.includes(item.size) || item.size === '') && (
                                <input
                                  type="text"
                                  placeholder="Taille personnalisée"
                                  value={item.size || ''}
                                  onChange={(e) => handleUpdateItem(idx, 'size', e.target.value)}
                                  className="w-full mt-1 px-2 py-1 bg-white border border-[#0D63FF] rounded text-xs font-bold"
                                />
                              )}
                            </div>

                            {/* Couleur */}
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                                Couleur
                              </label>
                              <input
                                type="text"
                                placeholder="Couleur"
                                value={item.color || ''}
                                onChange={(e) => handleUpdateItem(idx, 'color', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700"
                              />
                            </div>
                          </div>

                          {/* Flocage */}
                          <div className="pt-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                              Flocage (Nom & N°)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Nom floqué"
                                value={item.customName || ''}
                                onChange={(e) => handleUpdateItem(idx, 'customName', e.target.value.toUpperCase())}
                                className="flex-1 px-2 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-700"
                              />
                              <input
                                type="text"
                                placeholder="N°"
                                maxLength={2}
                                value={item.customNumber || ''}
                                onChange={(e) => handleUpdateItem(idx, 'customNumber', e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-12 px-2 py-1 border border-slate-200 bg-white rounded-lg text-xs font-bold text-center text-slate-700"
                              />
                            </div>
                          </div>

                          {/* Stepper and Price */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, (Number(item.quantity) || 1) - 1))}
                                className="px-2.5 py-1 text-slate-600"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 py-1 font-bold text-xs border-x border-slate-200">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(idx, 'quantity', (Number(item.quantity) || 1) + 1)}
                                className="px-2.5 py-1 text-slate-600"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-bold">Prix unit:</span>
                              <input
                                type="number"
                                step="0.5"
                                value={(item.price || 0) / 1000}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    idx,
                                    'price',
                                    Math.round(
                                      (parseFloat(e.target.value) || 0) * 1000
                                    )
                                  )
                                }
                                className="w-16 px-1.5 py-0.5 border border-slate-200 rounded-md text-right font-mono font-bold text-xs"
                              />
                              <span className="text-[10px] text-slate-500 font-bold">DT</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {formItems.length === 0 && (
                      <div className="p-6 text-center text-slate-400 text-xs font-medium">
                        Aucun article dans cette commande.
                      </div>
                    )}
                  </div>

                  {/* Calculations breakdown at bottom right */}
                  <div className="border-t border-slate-100 pt-4 flex justify-end">
                    <div className="w-full sm:w-72 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-bold uppercase text-[10px] tracking-wider">Sous-total articles</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatDt(drawerSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-bold uppercase text-[10px] tracking-wider">Frais de livraison ({formCustomerCity})</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatDt(formShippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                        <span className="uppercase text-xs text-slate-900">Montant Total</span>
                        <span className="font-mono text-[#0D63FF] text-lg">
                          {formatDt(drawerTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STICKY BOTTOM ACTION BAR */}
              <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 shadow-lg">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">
                    Total de la commande
                  </span>
                  <span className="text-base sm:text-xl font-black font-mono text-[#0D63FF]">
                    {formatDt(drawerTotal)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDrawer}
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#0D63FF] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save size={15} />
                    <span>{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}
