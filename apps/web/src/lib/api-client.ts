// Same-origin keeps production browser requests behind Nginx and avoids
// leaking Docker-only hostnames. Local development can override this value.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchJson(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Retrieve token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // send cookies for HTTP-only JWTs
  });

  if (!response.ok) {
    let errorMessage = 'Une erreur est survenue';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Editorial homepage
  getHomepageSettings: () => fetchJson('/settings/homepage'),
  updateHomepageSettings: (data: Record<string, unknown>) => fetchJson('/admin/settings/homepage', {
    method: 'PATCH', body: JSON.stringify(data),
  }),

  // ── News / Actualities (Public) ────────────────────────────────────────────
  getNews: (params: Record<string, string | number | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/news${query ? '?' + query : ''}`);
  },
  getNewsById: (id: string) => fetchJson(`/news/${id}`),
  getNewsBySlug: (slug: string) => fetchJson(`/news/slug/${encodeURIComponent(slug)}`),

  // ── News / Actualities (Admin) ─────────────────────────────────────────────
  getAdminNews: (params: Record<string, string | number | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/news/admin/all${query ? '?' + query : ''}`);
  },
  createNews: (data: Record<string, unknown>) => fetchJson('/news', {
    method: 'POST', body: JSON.stringify(data),
  }),
  updateNews: (id: string, data: Record<string, unknown>) => fetchJson(`/news/${id}`, {
    method: 'PATCH', body: JSON.stringify(data),
  }),
  deleteNews: (id: string) => fetchJson(`/news/${id}`, {
    method: 'DELETE',
  }),
  getFanPhotos: () => fetchJson('/fan-photos'),
  getAdminFanPhotos: () => fetchJson('/admin/fan-photos'),
  createFanPhoto: (data: Record<string, unknown>) => fetchJson('/admin/fan-photos', {
    method: 'POST', body: JSON.stringify(data),
  }),
  updateFanPhoto: (id: string, data: Record<string, unknown>) => fetchJson(`/admin/fan-photos/${id}`, {
    method: 'PATCH', body: JSON.stringify(data),
  }),
  deleteFanPhoto: (id: string) => fetchJson(`/admin/fan-photos/${id}`, { method: 'DELETE' }),

  // Public Catalog
  getCategories: () => fetchJson('/categories'),
  getCollections: () => fetchJson('/collections'),
  
  // Cart & Checkout
  getDeliveryZones: () => fetchJson('/cart/delivery-zones'),
  getPickupPoints: () => fetchJson('/cart/pickup-points'),
  calculateCart: (data: {
    items: { productId: string; size: string; quantity: number }[];
    deliveryZoneId?: string;
    pickupPointId?: string;
    couponCode?: string;
  }) => fetchJson('/cart/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getProducts: (params: Record<string, string | number | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/products?${query}`);
  },
  
  getProductBySlug: (slug: string) => fetchJson(`/products/slug/${slug}`),
  incrementProductViews: (id: string) => fetchJson(`/products/${id}/views`, { method: 'POST' }),

  // Admin Catalog
  getAdminProducts: (params: Record<string, string | number | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/products/all?${query}`);
  },
  
  createProduct: (data: any) => fetchJson('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateProduct: (id: string, data: any) => fetchJson(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  deleteProduct: (id: string) => fetchJson(`/products/${id}`, {
    method: 'DELETE',
  }),

  // Auth Endpoints
  register: (data: any) => fetchJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: async (email: string, pass: string) => {
    const data = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    // Store token locally as fallback
    if (data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.access_token);
    }
    return data;
  },
  
  logout: async () => {
    await fetchJson('/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
  
  getMe: () => fetchJson('/me'),

  updateProfile: (data: any) => fetchJson('/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  changePassword: (currentPassword: string, newPassword: string) => fetchJson('/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),

  // Notifications
  getMyNotifications: () => fetchJson('/me/notifications'),
  getUnreadNotificationCount: () => fetchJson('/me/notifications/unread-count'),
  markNotificationRead: (id: string) => fetchJson(`/me/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => fetchJson('/me/notifications/read-all', { method: 'POST' }),

  // Support Center
  getMySupportTickets: () => fetchJson('/me/support-tickets'),
  getSupportTicket: (id: string) => fetchJson(`/me/support-tickets/${id}`),
  createSupportTicket: (data: { subject: string; category: string; message: string }) => fetchJson('/me/support-tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  replySupportTicket: (id: string, message: string) => fetchJson(`/me/support-tickets/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),

  updatePrivacy: (data: any) => fetchJson('/me/privacy', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  uploadAvatar: (formData: FormData) => fetchJson('/me/avatar', {
    method: 'POST',
    body: formData,
  }),

  // Membership / Abonnement Endpoints
  getMembershipPlans: () => fetchJson('/membership/plans'),
  getMyMembership: () => fetchJson('/me/membership'),
  requestMembership: (data: { planId: string; proofFile?: string }) => fetchJson('/me/membership/request', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAdminMembershipPlans: () => fetchJson('/admin/membership-plans'),
  createAdminMembershipPlan: (data: any) => fetchJson('/admin/membership-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAdminMembershipPlan: (id: string, data: any) => fetchJson(`/admin/membership-plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteAdminMembershipPlan: (id: string) => fetchJson(`/admin/membership-plans/${id}`, {
    method: 'DELETE',
  }),
  getAdminMemberships: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/memberships${query ? '?' + query : ''}`);
  },
  approveMembership: (id: string, data: { startDate?: string; endDate?: string; note?: string }) => fetchJson(`/admin/memberships/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  rejectMembership: (id: string, data: { note?: string }) => fetchJson(`/admin/memberships/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  renewMembership: (id: string, data: { note?: string }) => fetchJson(`/admin/memberships/${id}/renew`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  suspendMembership: (id: string, data: { note?: string }) => fetchJson(`/admin/memberships/${id}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  cancelMembership: (id: string, data: { note?: string }) => fetchJson(`/admin/memberships/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Fan Zone Endpoints
  getActiveVote: () => fetchJson('/fan-zone/votes/active'),
  castVote: (voteId: string, optionKey: string) => fetchJson(`/fan-zone/votes/${voteId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionKey }),
  }),
  getFanRanking: () => fetchJson('/fan-zone/ranking'),
  getFanZoneDashboard: () => fetchJson('/fan-zone/dashboard'),
  getMyPointsHistory: () => fetchJson('/fan-zone/points/history'),

  // Badges
  getBadges: () => fetchJson('/badges'),
  getMyBadges: () => fetchJson('/me/badges'),

  // Rewards
  getRewards: () => fetchJson('/rewards'),
  getMyRewardRedemptions: () => fetchJson('/me/rewards'),
  redeemReward: (id: string) => fetchJson(`/rewards/${id}/redeem`, { method: 'POST' }),

  // Media Endpoints
  getPublicMedia: () => fetchJson('/media'),
  getPublicMediaItem: (id: string) => fetchJson(`/media/${id}`),
  getAdminMedia: () => fetchJson('/admin/media'),
  createAdminMediaItem: (data: any) => fetchJson('/admin/media', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAdminMediaItem: (id: string, data: any) => fetchJson(`/admin/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteAdminMediaItem: (id: string) => fetchJson(`/admin/media/${id}`, {
    method: 'DELETE',
  }),

  // Donation Endpoints
  createDonation: (data: any) => fetchJson('/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  confirmDonation: (id: string, ref: string) => fetchJson(`/donations/${id}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ paymentReference: ref }),
  }),
  getPublicDonations: () => fetchJson('/donations/public'),
  getDonationsLeaderboard: () => fetchJson('/donations/leaderboard'),
  getMyDonations: () => fetchJson('/donations/my'),
  getAdminDonations: () => fetchJson('/admin/donations'),

  // Orders — Public
  createOrder: (data: any) => fetchJson('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  trackOrder: (orderNumber: string) => fetchJson(`/orders/track/${orderNumber}`),
  getMyOrders: () => fetchJson('/orders/my'),

  // Addresses — Me
  getMyAddresses: () => fetchJson('/me/addresses'),
  createAddress: (data: any) => fetchJson('/me/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAddress: (id: string, data: any) => fetchJson(`/me/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteAddress: (id: string) => fetchJson(`/me/addresses/${id}`, {
    method: 'DELETE',
  }),

  // Wishlist — Me
  getMyWishlist: () => fetchJson('/me/wishlist'),
  addToWishlist: (productId: string) => fetchJson('/me/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  removeFromWishlist: (productId: string) => fetchJson(`/me/wishlist/${productId}`, {
    method: 'DELETE',
  }),

  // Orders — Admin
  getAdminOrders: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/orders?${query}`);
  },
  updateOrderStatus: (id: string, status: string, notes?: string) => fetchJson(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  }),
  deleteOrder: (id: string) => fetchJson(`/orders/${id}`, {
    method: 'DELETE',
  }),

  // Cart admin — delivery zones & pickup points admin
  createDeliveryZone: (data: any) => fetchJson('/cart/delivery-zones', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDeliveryZone: (id: string, data: any) => fetchJson(`/cart/delivery-zones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteDeliveryZone: (id: string) => fetchJson(`/cart/delivery-zones/${id}`, {
    method: 'DELETE',
  }),
  createPickupPoint: (data: any) => fetchJson('/cart/pickup-points', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePickupPoint: (id: string, data: any) => fetchJson(`/cart/pickup-points/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deletePickupPoint: (id: string) => fetchJson(`/cart/pickup-points/${id}`, {
    method: 'DELETE',
  }),

  // Categories — admin
  getAdminCategories: () => fetchJson('/categories/all'),

  createCategory: (data: any) => fetchJson('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCategory: (id: string, data: any) => fetchJson(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteCategory: (id: string) => fetchJson(`/categories/${id}`, {
    method: 'DELETE',
  }),

  // Collections — admin
  createCollection: (data: any) => fetchJson('/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCollection: (id: string, data: any) => fetchJson(`/collections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteCollection: (id: string) => fetchJson(`/collections/${id}`, {
    method: 'DELETE',
  }),

  // ── Media Storage (Admin) ──────────────────────────────────────────────────

  /**
   * Upload a single file to MinIO via the backend.
   * Accepts a FormData object with:
   *   - file: File
   *   - folder: string (e.g. 'products', 'banners', 'media/photos')
   *   - altText?: string
   *   - caption?: string
   *   - tags?: string (comma-separated)
   */
  uploadMedia: (formData: FormData) => fetchJson('/admin/storage/upload', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  }),

  /**
   * Same as uploadMedia, but reports real upload progress via XMLHttpRequest
   * (fetch has no upload-progress event). Used by MediaUploader for the
   * percentage bar.
   */
  uploadMediaWithProgress: (formData: FormData, onProgress: (pct: number) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/admin/storage/upload`);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let body: any = null;
        try { body = JSON.parse(xhr.responseText); } catch {}
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body);
        } else {
          reject(new Error(body?.message || 'Upload failed'));
        }
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  },

  /**
   * Upload multiple files at once.
   * FormData fields: files (multiple), folder
   */
  uploadMultipleMedia: (formData: FormData) => fetchJson('/admin/storage/upload-multiple', {
    method: 'POST',
    body: formData,
  }),

  /** Delete a media file + all MinIO variants by MongoDB _id */
  deleteMedia: (id: string) => fetchJson(`/admin/storage/${id}`, {
    method: 'DELETE',
  }),

  /** Paginated raw media file library (MinIO uploads) — type, folder, search, page, limit */
  getMediaLibrary: (params: Record<string, string | number | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/media-files?${query}`);
  },

  /** Update altText, caption, tags on a MediaFile */
  updateMediaFile: (id: string, data: { altText?: string; caption?: string; tags?: string[] }) =>
    fetchJson(`/admin/media-files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** Get a presigned upload URL for direct browser → MinIO uploads */
  getPresignedUploadUrl: (objectKey: string) =>
    fetchJson(`/admin/storage/presign?key=${encodeURIComponent(objectKey)}`),

  // ── Sponsors (Admin) ────────────────────────────────────────────────────

  getSponsors: () => fetchJson('/sponsors'),

  createSponsor: (data: any) => fetchJson('/sponsors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateSponsor: (id: string, data: any) => fetchJson(`/sponsors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  deleteSponsor: (id: string) => fetchJson(`/sponsors/${id}`, {
    method: 'DELETE',
  }),

  getSponsorBySlug: (slug: string) => fetchJson(`/sponsors/slug/${slug}`),

  createPartnerLead: (data: any) => fetchJson('/sponsors/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getAdminPartnerLeads: () => fetchJson('/sponsors/admin/leads'),

  updatePartnerLeadStatus: (id: string, status: string) => fetchJson(`/sponsors/admin/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),

  // ── Downloads center ─────────────────────────────────────────────────
  getDownloads: (category?: string) => fetchJson(`/downloads${category ? `?category=${category}` : ''}`),
  registerDownload: (id: string) => fetchJson(`/downloads/${id}/register`, { method: 'POST' }),
  getAdminDownloads: (category?: string) => fetchJson(`/admin/downloads${category ? `?category=${category}` : ''}`),
  createDownload: (data: any) => fetchJson('/admin/downloads', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDownload: (id: string, data: any) => fetchJson(`/admin/downloads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteDownload: (id: string) => fetchJson(`/admin/downloads/${id}`, {
    method: 'DELETE',
  }),

  // Admin — Users & Fan accounts
  getAdminFans: (params: { search?: string; role?: string; status?: string } = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/users${query ? '?' + query : ''}`);
  },
  getAdminUsers: (params: { search?: string; role?: string; status?: string } = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/users${query ? '?' + query : ''}`);
  },
  getAdminFanDetail: (id: string) => fetchJson(`/admin/users/${id}`),
  updateAdminFanStatus: (id: string, status: 'Active' | 'Inactive') => fetchJson(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  deleteAdminUser: (id: string) => fetchJson(`/admin/users/${id}`, { method: 'DELETE' }),

  // Admin — Loyalty (badges + rewards)
  getAdminBadges: () => fetchJson('/admin/badges'),
  createBadge: (data: any) => fetchJson('/admin/badges', { method: 'POST', body: JSON.stringify(data) }),
  updateBadge: (id: string, data: any) => fetchJson(`/admin/badges/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBadge: (id: string) => fetchJson(`/admin/badges/${id}`, { method: 'DELETE' }),

  getAdminRewards: () => fetchJson('/admin/rewards'),
  createReward: (data: any) => fetchJson('/admin/rewards', { method: 'POST', body: JSON.stringify(data) }),
  updateReward: (id: string, data: any) => fetchJson(`/admin/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteReward: (id: string) => fetchJson(`/admin/rewards/${id}`, { method: 'DELETE' }),

  getAdminRewardRedemptions: () => fetchJson('/admin/reward-redemptions'),
  updateRedemptionStatus: (id: string, status: 'fulfilled' | 'cancelled', adminNote?: string) => fetchJson(`/admin/reward-redemptions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote }),
  }),

  // Admin — Support tickets
  getAdminSupportTickets: () => fetchJson('/admin/support-tickets'),
  getAdminSupportTicket: (id: string) => fetchJson(`/admin/support-tickets/${id}`),
  replyAdminSupportTicket: (id: string, message: string) => fetchJson(`/admin/support-tickets/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),
  updateSupportTicketStatus: (id: string, status: 'open' | 'answered' | 'closed') => fetchJson(`/admin/support-tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),

  // ── Live Tunisian Ligue 1 data (TheSportsDB) ───────────────────────────

  getStandings: () => fetchJson('/sportsdb/standings'),

  getRecentResults: (limit = 5) => fetchJson(`/sportsdb/results?limit=${limit}`),

  getNextLeagueMatch: () => fetchJson('/sportsdb/next'),

  // ── Internal Match model (real matches admins manage directly — used for
  //    basketball, which has no free live-data provider like TheSportsDB) ──
  getMatches: (sport?: string) => fetchJson(`/matches${sport ? `?sport=${sport}` : ''}`),
  getUpcomingMatches: (sport?: string, limit = 10) => fetchJson(`/matches/upcoming?limit=${limit}${sport ? `&sport=${sport}` : ''}`),
  getMatchResults: (sport?: string, limit = 10) => fetchJson(`/matches/results?limit=${limit}${sport ? `&sport=${sport}` : ''}`),
  getMatchBySlug: (slug: string) => fetchJson(`/matches/${slug}`),

  // Match Predictions
  getPredictionsByMatch: (matchId: string) => fetchJson(`/predictions/match/${matchId}`),
  getMyPrediction: (matchId: string) => fetchJson(`/predictions/match/${matchId}/mine`),
  submitPrediction: (matchId: string, matchLabel: string, homeScore: number, awayScore: number) => fetchJson('/predictions', {
    method: 'POST',
    body: JSON.stringify({ matchId, matchLabel, homeScore, awayScore }),
  }),

  getUsmTeamInfo: () => fetchJson('/sportsdb/team'),
  getSportsDbPlayers: () => fetchJson('/sportsdb/players'),

  // ── History page ────────────────────────────────────────────────────
  getHistory: () => fetchJson('/history'),
  getAdminHistory: () => fetchJson('/admin/history'),
  updateHistory: (data: any) => fetchJson('/admin/history', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // ── Palmarès page ───────────────────────────────────────────────────
  getPalmaresPage: () => fetchJson('/palmares-page'),
  getAdminPalmaresPage: () => fetchJson('/admin/palmares-page'),
  updatePalmaresPage: (data: any) => fetchJson('/admin/palmares-page', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // ── Legal pages (Privacy / Terms / Cookies) ─────────────────────────
  getLegalPage: (key: string) => fetchJson(`/legal/${key}`),
  getAdminLegalPages: () => fetchJson('/admin/legal'),
  getAdminLegalPage: (key: string) => fetchJson(`/admin/legal/${key}`),
  updateLegalPage: (key: string, data: { title?: string; content?: string }) => fetchJson(`/admin/legal/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // ── Players ───────────────────────────────────────────────────────
  getPlayers: (sport?: string) => fetchJson(`/players${sport ? `?sport=${sport}` : ''}`),
  getPlayerBySlug: (slug: string) => fetchJson(`/players/${slug}`),
  getAdminPlayers: (sport?: string) => fetchJson(`/admin/players${sport ? `?sport=${sport}` : ''}`),
  createPlayer: (data: any) => fetchJson('/admin/players', { method: 'POST', body: JSON.stringify(data) }),
  updatePlayer: (id: string, data: any) => fetchJson(`/admin/players/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePlayer: (id: string) => fetchJson(`/admin/players/${id}`, { method: 'DELETE' }),

  // ── Staff ─────────────────────────────────────────────────────────
  getStaff: (sport?: string) => fetchJson(`/staff${sport ? `?sport=${sport}` : ''}`),
  getAdminStaff: () => fetchJson('/admin/staff'),
  createStaff: (data: any) => fetchJson('/admin/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: string, data: any) => fetchJson(`/admin/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStaff: (id: string) => fetchJson(`/admin/staff/${id}`, { method: 'DELETE' }),

  // ── Timeline ────────────────────────────────────────────────────────
  getTimeline: () => fetchJson('/timeline'),
  getOnThisDay: () => fetchJson('/timeline/on-this-day'),
  getAdminTimeline: () => fetchJson('/admin/timeline'),
  createTimelineEvent: (data: any) => fetchJson('/admin/timeline', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTimelineEvent: (id: string, data: any) => fetchJson(`/admin/timeline/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteTimelineEvent: (id: string) => fetchJson(`/admin/timeline/${id}`, {
    method: 'DELETE',
  }),

  // ── Trophies / Palmarès ─────────────────────────────────────────────
  getTrophies: (sport?: string) => fetchJson(`/trophies${sport ? `?sport=${sport}` : ''}`),
  getPalmares: (sport?: 'football' | 'basketball') => fetchJson(sport ? `/palmares/${sport}` : '/palmares'),
  getAdminTrophies: (sport?: string) => fetchJson(`/admin/trophies${sport ? `?sport=${sport}` : ''}`),
  createTrophy: (data: any) => fetchJson('/admin/trophies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTrophy: (id: string, data: any) => fetchJson(`/admin/trophies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteTrophy: (id: string) => fetchJson(`/admin/trophies/${id}`, {
    method: 'DELETE',
  }),

  // ── Legends ───────────────────────────────────────────────────────
  getLegends: (sport?: string) => fetchJson(`/legends${sport ? `?sport=${sport}` : ''}`),
  getAdminLegends: (sport?: string) => fetchJson(`/admin/legends${sport ? `?sport=${sport}` : ''}`),
  createLegend: (data: any) => fetchJson('/admin/legends', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateLegend: (id: string, data: any) => fetchJson(`/admin/legends/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteLegend: (id: string) => fetchJson(`/admin/legends/${id}`, {
    method: 'DELETE',
  }),

  // ── Global search ────────────────────────────────────────────────────
  search: (q: string) => fetchJson(`/search?q=${encodeURIComponent(q)}`),

  // ── Stadium guide ────────────────────────────────────────────────────
  getStadiumPage: () => fetchJson('/stadium-page'),
  getAdminStadiumPage: () => fetchJson('/admin/stadium-page'),
  updateStadiumPage: (data: any) => fetchJson('/admin/stadium-page', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  getVenues: (sport?: string) => fetchJson(`/venues${sport ? `?sport=${sport}` : ''}`),
  getAdminVenues: (sport?: string) => fetchJson(`/admin/venues${sport ? `?sport=${sport}` : ''}`),
  createVenue: (data: any) => fetchJson('/admin/venues', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateVenue: (id: string, data: any) => fetchJson(`/admin/venues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteVenue: (id: string) => fetchJson(`/admin/venues/${id}`, {
    method: 'DELETE',
  }),

  // ── Season performance ──────────────────────────────────────────────
  getSeasonPerformance: (sport?: string, type?: string) => {
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (type) params.set('type', type);
    const qs = params.toString();
    return fetchJson(`/season-performance${qs ? `?${qs}` : ''}`);
  },
  getAdminSeasonPerformance: (sport?: string, type?: string) => {
    const params = new URLSearchParams();
    if (sport) params.set('sport', sport);
    if (type) params.set('type', type);
    const qs = params.toString();
    return fetchJson(`/admin/season-performance${qs ? `?${qs}` : ''}`);
  },
  createSeasonPerformance: (data: any) => fetchJson('/admin/season-performance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSeasonPerformance: (id: string, data: any) => fetchJson(`/admin/season-performance/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteSeasonPerformance: (id: string) => fetchJson(`/admin/season-performance/${id}`, {
    method: 'DELETE',
  }),

  // ── Hero slides (homepage carousel + other page banners) ───────────
  getHeroSlides: (page = 'home') => fetchJson(`/hero-slides?page=${page}`),
  getAdminHeroSlides: (page?: string) => fetchJson(`/admin/hero-slides${page ? `?page=${page}` : ''}`),
  createHeroSlide: (data: any) => fetchJson('/admin/hero-slides', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateHeroSlide: (id: string, data: any) => fetchJson(`/admin/hero-slides/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteHeroSlide: (id: string) => fetchJson(`/admin/hero-slides/${id}`, {
    method: 'DELETE',
  }),
  reorderHeroSlides: (items: { id: string; displayOrder: number }[]) => fetchJson('/admin/hero-slides/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ items }),
  }),

  // ── Administrator Management & Roles (SUPER ADMIN) ──────────────────────────
  getAdministrateurs: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/administrateurs${query ? '?' + query : ''}`);
  },
  getAdminDetail: (id: string) => fetchJson(`/admin/administrateurs/${id}`),
  inviteAdmin: (data: any) => fetchJson('/admin/administrateurs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAdminRoleAndPermissions: (id: string, role: string, permissions: string[]) => fetchJson(`/admin/administrateurs/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role, permissions }),
  }),
  suspendOrReactivateAdmin: (id: string, suspend: boolean) => fetchJson(`/admin/administrateurs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ suspend }),
  }),
  resetAdminAccess: (id: string) => fetchJson(`/admin/administrateurs/${id}/reset-access`, {
    method: 'POST',
  }),
  deleteAdmin: (id: string) => fetchJson(`/admin/administrateurs/${id}`, {
    method: 'DELETE',
  }),
  revokeAdminSession: (adminId: string, sessionId: string) => fetchJson(`/admin/administrateurs/${adminId}/sessions/${sessionId}`, {
    method: 'DELETE',
  }),
  acceptAdminInvitation: (token: string, pass: string) => fetchJson('/auth/invitations/accept', {
    method: 'POST',
    body: JSON.stringify({ token, password: pass }),
  }),
  promoteUserToAdmin: (id: string, role: string, permissions: string[]) => fetchJson(`/admin/users/${id}/promote`, {
    method: 'POST',
    body: JSON.stringify({ role, permissions }),
  }),
  updateUserNotes: (id: string, notes: string) => fetchJson(`/admin/users/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  }),
  updateAdminUserNotes: (id: string, notes: string) => fetchJson(`/admin/users/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  }),
  updateAdminRole: (id: string, role: string, permissions: string[] = []) => fetchJson(`/admin/administrateurs/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role, permissions }),
  }),
  createAdminInvitation: (data: any) => fetchJson('/admin/administrateurs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  sendEmailCampaign: (data: { subject: string; target: 'ALL' | 'ADMINS' | 'USERS'; htmlContent: string; testEmail?: string }) => fetchJson('/admin/campaigns/send', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Roles
  getRoles: () => fetchJson('/admin/roles'),
  createRole: (data: any) => fetchJson('/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: any) => fetchJson(`/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRole: (id: string) => fetchJson(`/admin/roles/${id}`, { method: 'DELETE' }),

  // ── Visitor Analytics ───────────────────────────────────────────────────────
  logAnalyticsEvent: (data: any) => fetchJson('/analytics/events', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAnalyticsOverview: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/analytics/overview${query ? '?' + query : ''}`);
  },
  getAnalyticsTraffic: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/analytics/traffic${query ? '?' + query : ''}`);
  },
  getAnalyticsSources: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/analytics/sources${query ? '?' + query : ''}`);
  },
  getAnalyticsGeography: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/analytics/geography${query ? '?' + query : ''}`);
  },
  getAnalyticsDevices: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/analytics/devices${query ? '?' + query : ''}`);
  },
  getAnalyticsPages: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/analytics/pages${query ? '?' + query : ''}`);
  },
  getAnalyticsContent: (params: Record<string, string | undefined> = {}) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return fetchJson(`/admin/analytics/content${query ? '?' + query : ''}`);
  },
  getAnalyticsRealtime: () => fetchJson('/admin/analytics/realtime'),
};
