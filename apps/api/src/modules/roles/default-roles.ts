export const SYSTEM_PERMISSIONS = {
  // Admin Management (SUPER_ADMIN ONLY)
  ADMINS_VIEW: 'admins.view',
  ADMINS_CREATE: 'admins.create',
  ADMINS_EDIT: 'admins.edit',
  ADMINS_DELETE: 'admins.delete',
  ADMINS_ASSIGN_ROLES: 'admins.assign_roles',
  ADMINS_ASSIGN_PERMISSIONS: 'admins.assign_permissions',

  // Users & Fans
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  USERS_SUSPEND: 'users.suspend',
  USERS_EXPORT: 'users.export',

  // Catalog & Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',

  // Orders
  ORDERS_VIEW: 'orders.view',
  ORDERS_EDIT: 'orders.edit',
  ORDERS_CONFIRM: 'orders.confirm',
  ORDERS_CANCEL: 'orders.cancel',
  ORDERS_EXPORT: 'orders.export',

  // News
  NEWS_VIEW: 'news.view',
  NEWS_CREATE: 'news.create',
  NEWS_EDIT: 'news.edit',
  NEWS_PUBLISH: 'news.publish',
  NEWS_DELETE: 'news.delete',

  // Media
  MEDIA_VIEW: 'media.view',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_EDIT: 'media.edit',
  MEDIA_DELETE: 'media.delete',
  MEDIA_PUBLISH: 'media.publish',

  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',

  // Security & Audit
  SECURITY_AUDIT_LOGS: 'security.audit_logs',
  SECURITY_LOGIN_HISTORY: 'security.login_history',
  SECURITY_SESSIONS: 'security.sessions',
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  'Super Admin': ['*'],
  ADMIN: [
    'users.view', 'users.edit', 'users.suspend', 'users.export',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'orders.view', 'orders.edit', 'orders.confirm', 'orders.cancel', 'orders.export',
    'news.view', 'news.create', 'news.edit', 'news.publish', 'news.delete',
    'media.view', 'media.upload', 'media.edit', 'media.delete', 'media.publish',
    'analytics.view', 'analytics.export',
    'settings.view', 'settings.edit',
  ],
  Admin: [
    'users.view', 'users.edit', 'users.suspend', 'users.export',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'orders.view', 'orders.edit', 'orders.confirm', 'orders.cancel', 'orders.export',
    'news.view', 'news.create', 'news.edit', 'news.publish', 'news.delete',
    'media.view', 'media.upload', 'media.edit', 'media.delete', 'media.publish',
    'analytics.view', 'analytics.export',
    'settings.view', 'settings.edit',
  ],
  USER: [],
  User: [],
  Fan: [],
};
