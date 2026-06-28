import axios from 'axios';

const TOKEN_KEY = 'nfctec_access_token';
const REFRESH_KEY = 'nfctec_refresh_token';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh });
          localStorage.setItem(TOKEN_KEY, data.accessToken);
          localStorage.setItem(REFRESH_KEY, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          clearAuth();
        }
      }
    }
    return Promise.reject(error);
  },
);

export function saveAuth(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'super_admin' | 'editor';
};

export type Post = {
  id: string;
  locale: 'en' | 'zh';
  slug: string;
  title: string;
  excerpt: string;
  body: unknown;
  category: string;
  readMinutes: number;
  status: 'draft' | 'published';
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
};

export type Solution = {
  id: string;
  locale: 'en' | 'zh';
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  icon: string;
  heroImage: string | null;
  capabilities: unknown;
  deliverables: unknown;
  protocols: unknown;
  certifications: unknown;
  workflow: unknown;
  resources: unknown;
  sortOrder: number;
  status: 'draft' | 'published';
  seoTitle: string | null;
  seoDescription: string | null;
};

export type Product = {
  id: string;
  locale: 'en' | 'zh';
  slug: string;
  name: string;
  description: string;
  category: 'software' | 'hardware';
  linkPath: string | null;
  sortOrder: number;
  status: 'draft' | 'published';
};

export type DownloadGroup = {
  id: string;
  locale: 'en' | 'zh';
  name: string;
  sortOrder: number;
  items: {
    id: string;
    name: string;
    version: string | null;
    fileUrl: string | null;
    fileSize: string | null;
    sortOrder: number;
    status: 'draft' | 'published';
  }[];
};

export type Inquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
};
