import {
  LayoutDashboard,
  Radio,
  Trophy,
  Newspaper,
  Image as ImageIcon,
  Handshake,
  ShoppingBag,
  ShoppingCart,
  FileText,
  Search,
  Bell,
  BarChart3,
  UserCog,
  Settings,
  Layers,
  Megaphone,
  Landmark,
  History,
  CalendarDays,
  ShieldCheck,
  GalleryHorizontal,
  Crown,
  MapPin,
  Mail,
  type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  superAdminOnly?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'analytics.view' },
    ],
  },
  {
    label: 'Pages Management',
    items: [
      { label: 'Homepage Hero', href: '/admin/homepage/hero', icon: GalleryHorizontal, permission: 'settings.edit' },
      { label: 'Boutique Catalog', href: '/admin/boutique', icon: ShoppingBag, permission: 'products.view' },
      { label: 'Football Section', href: '/admin/football', icon: Trophy },
      { label: 'Basketball Section', href: '/admin/basketball', icon: Trophy },
      { label: 'History Page', href: '/admin/history', icon: Landmark },
      { label: 'Timeline Page', href: '/admin/timeline', icon: History },
      { label: 'Palmarès Page', href: '/admin/palmares', icon: Trophy },
      { label: 'Trophies List', href: '/admin/trophies', icon: Trophy },
      { label: 'Legends', href: '/admin/legends', icon: Crown },
      { label: 'Season Stats', href: '/admin/season-performance', icon: CalendarDays },
      { label: 'Stadium Guide', href: '/admin/stadium', icon: MapPin },
      { label: 'Downloads Center', href: '/admin/downloads', icon: FileText },
      { label: 'Newsroom', href: '/admin/news', icon: Newspaper, permission: 'news.view' },
      { label: 'Media Portal', href: '/admin/media', icon: ImageIcon, permission: 'media.view' },
      { label: 'Media Files (MinIO)', href: '/admin/media-files', icon: GalleryHorizontal, permission: 'media.view' },
      { label: 'Legal Pages', href: '/admin/pages-legal', icon: ShieldCheck },
      { label: 'Custom Pages', href: '/admin/pages', icon: Layers },
    ],
  },
  {
    label: 'Operations & Community',
    items: [
      { label: 'Shop Orders', href: '/admin/orders', icon: ShoppingCart, permission: 'orders.view' },
      { label: 'Sponsors & ROI', href: '/admin/sponsors', icon: Handshake },
      { label: 'Fan Zone', href: '/admin/fanzone', icon: Megaphone },
      { label: 'Campagnes Email', href: '/admin/campaigns', icon: Mail, permission: 'users.edit' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Administrateurs', href: '/admin/administrateurs', icon: ShieldCheck, superAdminOnly: true, permission: 'admins.view' },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Users & Roles', href: '/admin/users', icon: UserCog, permission: 'users.view' },
      { label: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.view' },
      { label: 'SEO Config', href: '/admin/seo', icon: Search },
    ],
  },
];
