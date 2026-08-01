'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const translations: Record<string, { fr: string; ar: string }> = {
  // Titles
  'Settings': { fr: 'Paramètres', ar: 'الإعدادات' },
  'Analytics': { fr: 'Statistiques', ar: 'التحليلات' },
  'Analytics Panel': { fr: 'Statistiques & Rapports', ar: 'لوحة التحليلات' },
  'Notifications': { fr: 'Notifications', ar: 'الإشعارات' },
  'Users & Roles': { fr: 'Utilisateurs & Rôles', ar: 'المستخدمون والأدوار' },
  'Newsroom': { fr: 'Actualités & News', ar: 'غرفة الأخبار' },
  'Boutique Catalog': { fr: 'Catalogue Boutique', ar: 'كتالوج المغازة' },
  'Football Section': { fr: 'Section Football', ar: 'فرع كرة القدم' },
  'Basketball Section': { fr: 'Section Basket', ar: 'فرع كرة السلة' },
  'History Page': { fr: 'Page Histoire', ar: 'صفحة التاريخ' },
  'Timeline Page': { fr: 'Chronologie', ar: 'الخط الزمني' },
  'Palmarès Page': { fr: 'Palmarès du Club', ar: 'صفحة التتويجات' },
  'Trophies List': { fr: 'Liste des Trophées', ar: 'قائمة الكؤوس' },
  'Season Stats': { fr: 'Stats Saison', ar: 'إحصائيات الموسم' },
  'Media Portal': { fr: 'Portail Média', ar: 'معرض الصور والفيديو' },
  'Legal Pages': { fr: 'Pages Légales', ar: 'الصفحات القانونية' },
  'Custom Pages': { fr: 'Pages Personnalisées', ar: 'الصفحات المخصصة' },
  'Sponsors & ROI': { fr: 'Partenaires & ROI', ar: 'المستشهرون والنتائج' },
  'Fan Zone': { fr: 'Fan Zone', ar: 'منطقة الأحباء' },
  'Memberships': { fr: 'Adhésions', ar: 'الانخراطات' },
  'Membership Plans': { fr: 'Formules d\'adhésion', ar: 'خطط الانخراط' },
  'Donations': { fr: 'Dons', ar: 'التبرعات' },
  'SEO Config': { fr: 'Configuration SEO', ar: 'إعدادات السيو' },
  'US Monastir Administration': { fr: 'Administration US Monastir', ar: 'لوحة القيادة الرئيسية' },

  // Descriptions
  'Club information shown across the public site (footer, contact points, social links).': {
    fr: 'Informations du club affichées sur le site public (pied de page, points de contact, réseaux sociaux).',
    ar: 'معلومات النادي المعروضة عبر الموقع العام (تذييل الصفحة، نقاط الاتصال، شبكات التواصل الاجتماعي).',
  },
  'Push announcements to fans across the platform.': {
    fr: 'Envoyer des annonces et des notifications aux supporters à travers la plateforme.',
    ar: 'إرسال إعلانات وإشعارات للأحباء عبر المنصة.',
  },
  'Cross-platform performance snapshot, built from live app data where available.': {
    fr: 'Aperçu des performances multiplateformes, basé sur les données réelles de l\'application.',
    ar: 'لمحة عن الأداء عبر الأنظمة الأساسية، مبنية من بيانات التطبيق المباشرة.',
  },
  'Real-time business intelligence dashboard calculated directly from live database collections.': {
    fr: 'Tableau de bord de veille stratégique en temps réel calculé directement à partir des collections de la base de données.',
    ar: 'لوحة تحليلات البيانات في الوقت الفعلي المستمدة مباشرة من قاعدة البيانات.',
  },
  'Manage administrators and define permission roles.': {
    fr: 'Gérer les administrateurs et définir les rôles de permission.',
    ar: 'إدارة المشرفين وتحديد أدوار الصلاحيات.',
  },
  'Publish and update club news articles.': {
    fr: 'Publier et mettre à jour les articles d\'actualité du club.',
    ar: 'نشر وتحديث مقالات أخبار النادي.',
  },
  'Manage boutique products, inventory and descriptions.': {
    fr: 'Gérer les produits de la boutique, le stock et les descriptions.',
    ar: 'إدارة منتجات المغازة والمخزون والتوصيفات.',
  },
  'Manage football squad, players list and technical staff.': {
    fr: 'Gérer l\'effectif de football, la liste des joueurs et le staff technique.',
    ar: 'إدارة فريق كرة القدم، قائمة اللاعبين والإطار الفني.',
  },
  'Manage basketball squad, players list and technical staff.': {
    fr: 'Gérer l\'effectif de basket, la liste des joueurs et le staff technique.',
    ar: 'إدارة فريق كرة السلة، قائمة اللاعبين والإطار الفني.',
  },
  'Manage club historical pages, narrative text and media.': {
    fr: 'Gérer l\'histoire du club, les récits et les médias liés.',
    ar: 'إدارة تاريخ النادي، النصوص التعريفية والوسائط ذات الصلة.',
  },
  'Manage club history timeline milestones.': {
    fr: 'Gérer les étapes clés de la chronologie historique du club.',
    ar: 'إدارة المحطات الرئيسية في الخط الزمني لتاريخ النادي.',
  },
  'Manage club palmarès trophies achievements and timeline.': {
    fr: 'Gérer les trophées du palmarès du club, les succès et la chronologie.',
    ar: 'إدارة كؤوس التتويجات الخاصة بالنادي والإنجازات.',
  },
  'Manage club trophies, year of achievement and details.': {
    fr: "Gérer les trophées du club, l'année d'obtention et les détails.",
    ar: 'إدارة كؤوس النادي، سنة التتويج والتفاصيل.',
  },
  'Manage season performance statistics and matches.': {
    fr: 'Gérer les statistiques de performance de la saison et les matchs.',
    ar: 'إدارة إحصائيات أداء الموسم والمباريات.',
  },
  'Manage public SEO configuration, meta tags and titles.': {
    fr: 'Gérer la configuration SEO publique, les balises méta et les titres.',
    ar: 'إدارة إعدادات السيو العامة، الكلمات الدلالية والعناوين.',
  },
  'Onboard club sponsors, assign tiers and monitor impressions.': {
    fr: 'Gérer les partenaires du club, attribuer des niveaux et suivre les impressions.',
    ar: 'إدارة مستشهري النادي، تحديد الفئات ومتابعة المشاهدات.',
  },
  'Manage Fan Zone quizzes, votes and active community engagement.': {
    fr: 'Gérer les quiz de la Fan Zone, les votes et l\'engagement communautaire actif.',
    ar: 'إدارة مسابقات منطقة الأحباء، التصويتات والتفاعل الاجتماعي.',
  },
  'Track club memberships and adherents registers.': {
    fr: 'Suivre les adhésions au club et le registre des adhérents.',
    ar: 'متابعة انخراطات النادي وسجل المنخرطين.',
  },
  'Define membership plans, prices and benefit descriptions.': {
    fr: 'Définir les formules d\'adhésion, les prix et les descriptions des avantages.',
    ar: 'تحديد خطط الانخراط، الأسعار وتفاصيل المزايا.',
  },
  'Monitor secure donations list and transaction histories.': {
    fr: 'Suivre la liste des dons sécurisés et l\'historique des transactions.',
    ar: 'متابعة قائمة التبرعات الآمنة وسجل المعاملات.',
  },
  'Configure official website policies and legal pages contents.': {
    fr: 'Configurer les politiques officielles du site web et le contenu des pages légales.',
    ar: 'إعداد السياسات الرسمية للموقع ومحتويات الصفحات القانونية.',
  },
};

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, description, actions }) => {
  const { language } = useApp();

  const tTitle = language === 'en' ? title : translations[title]?.[language] || title;
  const tDescription = description
    ? language === 'en'
      ? description
      : translations[description]?.[language] || description
    : undefined;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">{tTitle}</h1>
        {tDescription && <p className="text-xs text-slate-500 mt-1 max-w-2xl">{tDescription}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
