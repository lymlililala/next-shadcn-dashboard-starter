import { fakeSites } from '@/constants/mock-api-skills';
import type {
  Site,
  SiteFilters,
  SitesResponse,
  SiteStats,
  CreateSitePayload,
  UpdateSitePayload,
  SkillTool,
  SkillToolFilters,
  SkillToolsResponse,
  SkillToolStats
} from './types';

/** 统一 API 基地址：服务端用绝对 URL，客户端用相对 URL */
function apiBase() {
  if (typeof window === 'undefined') {
    // Server-side: need absolute URL for fetch
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    return `${base}/api`;
  }
  return '/api';
}

async function safeFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getSites(filters: SiteFilters): Promise<SitesResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.platform && filters.platform !== 'all') params.set('platform', filters.platform);
  if (filters.region && filters.region !== 'all') params.set('region', filters.region);
  if (filters.status) params.set('status', filters.status);
  if (filters.sort) params.set('sort', filters.sort);

  const data = await safeFetch<SitesResponse>(`${apiBase()}/skills?${params}`);
  if (!data) return fakeSites.getSites(filters);
  return data;
}

export async function getSiteById(id: number): Promise<Site | null> {
  const data = await safeFetch<Site>(`${apiBase()}/skills/${id}`);
  return data;
}

export async function getFeaturedSites(): Promise<Site[]> {
  const data = await safeFetch<Site[]>(`${apiBase()}/skills?action=featured`);
  if (!data) return fakeSites.getFeaturedSites();
  return data;
}

export async function getSiteStats(): Promise<SiteStats> {
  const data = await safeFetch<SiteStats>(`${apiBase()}/skills?action=stats`);
  if (!data) return fakeSites.getStats();
  return data;
}

export async function createSite(payload: CreateSitePayload): Promise<Site> {
  const res = await fetch(`${apiBase()}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create skill: ${res.statusText}`);
  return res.json() as Promise<Site>;
}

export async function updateSite(id: number, payload: UpdateSitePayload): Promise<Site | null> {
  const data = await safeFetch<Site>(`${apiBase()}/skills/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return data;
}

export async function deleteSite(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/skills/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function reviewSite(
  id: number,
  action: 'approve' | 'reject',
  note?: string
): Promise<Site | null> {
  const status = action === 'approve' ? 'published' : 'rejected';
  return updateSite(id, { status, review_note: note });
}

// ── Skill Tools ──────────────────────────────────────────────────────────────

export async function getSkillTools(filters: SkillToolFilters): Promise<SkillToolsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);

  const data = await safeFetch<SkillToolsResponse>(`${apiBase()}/skill-tools?${params}`);
  if (!data) return { items: [], total_items: 0 };
  return data;
}

export async function getSkillToolStats(): Promise<SkillToolStats> {
  const data = await safeFetch<SkillToolStats>(`${apiBase()}/skill-tools?action=stats`);
  if (!data) return { total: 0, featured: 0, byCategory: {} };
  return data;
}

export async function getFeaturedSkillTools(): Promise<SkillTool[]> {
  const data = await safeFetch<SkillTool[]>(`${apiBase()}/skill-tools?action=featured`);
  if (!data) return [];
  return data;
}
