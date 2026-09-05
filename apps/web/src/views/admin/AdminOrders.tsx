'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  RefreshCw,
  Users,
  AlertCircle,
  Truck,
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
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

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
    try {
      const res = await api.getAdminProducts();
      setCatalogProducts(res?.products || []);
    } catch (err) {}
  }, []);

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
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrentOrder(null);
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
        const qty = Number(target.quantity) || 1;
        const pr = Number(target.price) || 0;
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

    const newItem: OrderItem = {
      productId: prod._id || prod.id || `custom-${prod.name || 'item'}`,
      name: prod.nameFr || prod.name || 'Produit USM',
      size: prod.sizes?.[0] || prod.variants?.[0]?.size || 'Taille Unique',
      color: prod.colors?.[0] || 'noir*',
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
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">CLIENT</th>
                  <th className="py-3.5 px-4">DATE</th>
                  <th className="py-3.5 px-4">TÉLÉPHONE</th>
                  <th className="py-3.5 px-4">VILLE</th>
                  <th className="py-3.5 px-4 text-center">STATUT</th>
                  <th className="py-3.5 px-4 text-center">EXPÉDITION</th>
                  <th className="py-3.5 px-4">TOTAL</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedOrders.map((order) => {
                  const statusStyle =
                    STATUS_BADGES[order.status] || STATUS_BADGES.pending;
                  const isChecked = selectedOrderIds.includes(order._id);
                  const cleanPhone = order.customer?.phone?.replace(/\s+/g, '') || '';
                  const isRegularCustomer = (phoneCounts[cleanPhone] || 0) > 1;

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

                      {/* ID */}
                      <td className="py-3.5 px-4">
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

                      {/* CLIENT */}
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

                      {/* DATE */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <p className="text-slate-700 font-medium">
                            {formatDateOnly(order.createdAt)}
                          </p>
                          {order.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5] mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                              Conf: {formatDateTime(order.confirmedAt || order.updatedAt || order.createdAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* TÉLÉPHONE */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {order.customer?.phone || '—'}
                      </td>

                      {/* VILLE */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {order.customer?.city || '—'}
                      </td>

                      {/* STATUT */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>

                      {/* EXPÉDITION */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {order.shippingCompany && order.shippingCompany !== '-' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                              {order.shippingCompany} ✓
                            </span>
                            {order.trackingNumber && (
                              <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
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
                    <td colSpan={10} className="py-16 text-center text-slate-400 text-xs font-medium">
                      Aucune commande ne correspond à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && displayedOrders.length > 0 && (
          <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between px-4">
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

      {/* ── DRAWER / MODAL: "MODIFIER LA COMMANDE" (Screenshot 2) ── */}
      <AnimatePresence>
        {drawerOpen && (
          <React.Fragment>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-opacity"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-2xl bg-[#FAFAFA] z-50 shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
            >
              {/* Drawer Top Header */}
              <div className="p-4 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {drawerMode === 'new'
                    ? 'Ajouter une commande'
                    : drawerMode === 'view'
                    ? 'Détails de la commande'
                    : 'Modifier la commande'}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDrawer}
                    disabled={saving}
                    className="px-4 py-2 bg-[#0D63FF] hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{saving ? 'Enregistrement…' : 'Enregistrer'}</span>
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Top Toggle: Échange checkbox */}
                <div className="flex justify-end">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsExchange}
                      onChange={(e) => setFormIsExchange(e.target.checked)}
                      className="rounded border-slate-300 accent-[#0D63FF] cursor-pointer"
                    />
                    <span>Échange</span>
                  </label>
                </div>

                {/* CARD 1: DÉTAILS DE LA COMMANDE */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    DÉTAILS DE LA COMMANDE
                  </h3>

                  {/* Creation Date */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Date de création :</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatDateTime(currentOrder?.createdAt || new Date().toISOString())}
                    </span>
                  </div>

                  {/* STATUT */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      STATUT
                    </label>
                    <div className="relative">
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-[#0D63FF] cursor-pointer appearance-none"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="tentative">Tentative</option>
                        <option value="prepared">En préparation</option>
                        <option value="shipped">En cours de livraison</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* SOCIÉTÉ DE LIVRAISON */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      SOCIÉTÉ DE LIVRAISON
                    </label>
                    <div className="relative">
                      <select
                        value={formShippingCompany}
                        onChange={(e) => setFormShippingCompany(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-[#0D63FF] cursor-pointer appearance-none"
                      >
                        <option value="-">-</option>
                        <option value="Navex">Navex</option>
                        <option value="Axess Logistique">Axess Logistique</option>
                        <option value="First Delivery">First Delivery</option>
                        <option value="Autre">Autre</option>
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* AJOUTER UNE NOTE PRIVÉE... */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      AJOUTER UNE NOTE PRIVÉE...
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ajouter une note privée..."
                      value={formPrivateNote}
                      onChange={(e) => setFormPrivateNote(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 rounded-xl p-3 outline-none transition-colors resize-none placeholder-slate-400"
                    />
                  </div>

                  {/* Status Pills */}
                  <div className="space-y-2 pt-1">
                    <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-500">
                      {formShippingCompany === 'Navex'
                        ? 'Assigné à Navex.'
                        : 'Pas encore envoyé à Navex.'}
                    </div>
                    <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-500">
                      {formShippingCompany === 'Axess Logistique'
                        ? 'Assigné à Axess Logistique.'
                        : 'Pas encore envoyé à Axess Logistique.'}
                    </div>
                    <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-500">
                      {formShippingCompany === 'First Delivery'
                        ? 'Assigné à First Delivery.'
                        : 'Pas encore envoyé à First Delivery.'}
                    </div>
                  </div>
                </div>

                {/* CARD 2: DÉTAILS DU CLIENT */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    DÉTAILS DU CLIENT
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* NOM */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                        NOM
                      </label>
                      <input
                        type="text"
                        placeholder="Foulen ben Foulen"
                        value={formCustomerName}
                        onChange={(e) => setFormCustomerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 rounded-xl p-3 outline-none transition-colors placeholder-slate-400"
                      />
                    </div>

                    {/* TÉLÉPHONE */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                        TÉLÉPHONE
                      </label>
                      <input
                        type="text"
                        placeholder="+216 12 34 56 78"
                        value={formCustomerPhone}
                        onChange={(e) => setFormCustomerPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 font-mono rounded-xl p-3 outline-none transition-colors placeholder-slate-400"
                      />
                    </div>

                    {/* VILLE */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                        VILLE
                      </label>
                      <div className="relative">
                        <select
                          value={formCustomerCity}
                          onChange={(e) => {
                            const newCity = e.target.value;
                            setFormCustomerCity(newCity);
                            // Set shipping cost dynamically
                            setFormShippingCost(newCity === 'Monastir' ? 4000 : 8000);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-[#0D63FF] cursor-pointer appearance-none"
                        >
                          {TUNISIAN_GOVERNORATES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* ADRESSE */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                        ADRESSE
                      </label>
                      <input
                        type="text"
                        placeholder="Rue, Immeuble, Cité"
                        value={formCustomerAddress}
                        onChange={(e) => setFormCustomerAddress(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 rounded-xl p-3 outline-none transition-colors placeholder-slate-400"
                      />
                    </div>

                    {/* TÉLÉPHONE 2 */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                        TÉLÉPHONE 2
                      </label>
                      <input
                        type="text"
                        placeholder="Entrez votre second numéro de téléphone"
                        value={formCustomerPhone2}
                        onChange={(e) => setFormCustomerPhone2(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 font-mono rounded-xl p-3 outline-none transition-colors placeholder-slate-400"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                        EMAIL
                      </label>
                      <input
                        type="email"
                        placeholder="yassinfhaiel74@gmail.com"
                        value={formCustomerEmail}
                        onChange={(e) => setFormCustomerEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 rounded-xl p-3 outline-none transition-colors placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* NOTE */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      NOTE
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Entrez les notes supplémentaires"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 rounded-xl p-3 outline-none transition-colors resize-none placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* CARD 3: SÉLECTIONNER UN PRODUIT */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 relative">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    SÉLECTIONNER UN PRODUIT
                  </h3>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Produits"
                      value={productSearch}
                      onFocus={() => setProductDropdownOpen(true)}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductDropdownOpen(true);
                      }}
                      className="w-full bg-white border border-slate-200 focus:border-[#0D63FF] text-xs text-slate-800 rounded-xl p-3 outline-none transition-colors placeholder-slate-400"
                    />

                    {/* Product Search Dropdown list */}
                    {productDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-20 divide-y divide-slate-100">
                        {catalogProducts
                          .filter((p) =>
                            (p.nameFr || p.name || '')
                              .toLowerCase()
                              .includes(productSearch.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((prod) => (
                            <button
                              key={prod._id || prod.id}
                              type="button"
                              onClick={() => handleAddProductToOrder(prod)}
                              className="w-full p-2.5 px-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.coverImage || prod.imageUrl || prod.images?.[0] || '/logo foot.png'}
                                  alt=""
                                  className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-xs text-slate-900">
                                    {prod.nameFr || prod.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    {prod.category?.name || 'Boutique officielle'}
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-xs text-[#0D63FF]">
                                {formatDt(
                                  typeof prod.price === 'number' && prod.price > 1000
                                    ? prod.price
                                    : Math.round((parseFloat(prod.price) || 0) * 1000)
                                )}
                              </span>
                            </button>
                          ))}
                        {catalogProducts.length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-400">
                            Aucun produit trouvé.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD 4: RÉSUMÉ DES COMMANDES (Table & Total) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    RÉSUMÉ DES COMMANDES
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-2.5 px-3">PRODUIT</th>
                          <th className="py-2.5 px-3 text-center">QTÉ</th>
                          <th className="py-2.5 px-3 text-center">ATTRIBUTS</th>
                          <th className="py-2.5 px-3 text-center">PRIX UNITAIRE</th>
                          <th className="py-2.5 px-3 text-right">TOTAL</th>
                          <th className="py-2.5 px-2 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {/* PRODUIT */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.image || '/logo foot.png'}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 line-clamp-2 max-w-[150px] block">
                                    {item.name}
                                  </span>
                                  {(item.customName || item.customNumber) && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1">
                                      ⭐ Flocage: {[item.customName, item.customNumber ? '#' + item.customNumber : ''].filter(Boolean).join(' ')}
                                    </span>
                                  )}
                                  {/* Inputs for admin editing of flocage */}
                                  <div className="mt-1 flex items-center gap-1">
                                    <input
                                      type="text"
                                      placeholder="Nom flocage"
                                      value={item.customName || ''}
                                      onChange={(e) => handleUpdateItem(idx, 'customName', e.target.value.toUpperCase())}
                                      className="w-24 px-1.5 py-0.5 border border-slate-200 bg-white rounded text-[10px] font-bold text-slate-700 outline-none focus:border-[#0D63FF]"
                                      title="Nom floqué sur le maillot"
                                    />
                                    <input
                                      type="text"
                                      placeholder="N°"
                                      maxLength={2}
                                      value={item.customNumber || ''}
                                      onChange={(e) => handleUpdateItem(idx, 'customNumber', e.target.value.replace(/[^0-9]/g, ''))}
                                      className="w-10 px-1.5 py-0.5 border border-slate-200 bg-white rounded text-[10px] font-bold text-center text-slate-700 outline-none focus:border-[#0D63FF]"
                                      title="Numéro floqué"
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* QTÉ */}
                            <td className="py-3 px-3 text-center">
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
                                className="w-14 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-xs outline-none focus:border-[#0D63FF]"
                              />
                            </td>

                            {/* ATTRIBUTS (Couleur, Taille & Flocage) */}
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <div className="border border-blue-200 bg-blue-50/50 rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-700">
                                  <span className="text-[9px] text-slate-400 block uppercase leading-none">
                                    Couleur
                                  </span>
                                  <span>{item.color || 'noir*'}</span>
                                </div>
                                <div className="border border-blue-200 bg-blue-50/50 rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-700">
                                  <span className="text-[9px] text-slate-400 block uppercase leading-none">
                                    Taille
                                  </span>
                                  <span>{item.size || 'Unique'}</span>
                                </div>
                                {(item.customName || item.customNumber) ? (
                                  <div className="border border-amber-300 bg-amber-50 rounded-lg px-2 py-1 text-[11px] font-bold text-amber-900 shadow-2xs">
                                    <span className="text-[9px] text-amber-600 block uppercase font-extrabold leading-none">
                                      Flocage
                                    </span>
                                    <span className="font-mono">{[item.customName, item.customNumber ? '#' + item.customNumber : ''].filter(Boolean).join(' ')}</span>
                                  </div>
                                ) : (
                                  <div className="border border-slate-200 bg-slate-50 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-400">
                                    <span>Sans flocage</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* PRIX UNITAIRE */}
                            <td className="py-3 px-3 text-center">
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
                                className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-mono font-bold text-xs outline-none focus:border-[#0D63FF]"
                              />
                            </td>

                            {/* TOTAL ITEM */}
                            <td className="py-3 px-3 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                              {formatDt(item.subtotal || item.price * item.quantity)}
                            </td>

                            {/* REMOVE TRASH BUTTON */}
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Retirer l'article"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {formItems.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-6 text-center text-slate-400 text-xs font-medium"
                            >
                              Aucun produit ajouté. Utilisez le sélecteur ci-dessus pour ajouter des articles.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations breakdown at bottom right */}
                  <div className="border-t border-slate-100 pt-4 flex justify-end">
                    <div className="w-64 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-bold uppercase text-[10px]">SOUS-TOTAL</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatDt(drawerSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-bold uppercase text-[10px]">FRAIS DE LIVRAISON</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatDt(formShippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                        <span className="uppercase text-xs text-slate-900">TOTAL</span>
                        <span className="font-mono text-[#0D63FF] text-base">
                          {formatDt(drawerTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}
