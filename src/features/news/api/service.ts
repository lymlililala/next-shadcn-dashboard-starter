import { AI_TIMELINE, fakeNews } from '@/constants/mock-api-news';
import type {
  NewsItem,
  NewsFilters,
  NewsResponse,
  NewsStats,
  CreateNewsPayload,
  UpdateNewsPayload,
  TimelineEvent
} from './types';

function apiBase() {
  if (typeof window === 'undefined') {
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

export async function getNews(filters: NewsFilters): Promise<NewsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.sort) params.set('sort', filters.sort);

  const data = await safeFetch<NewsResponse>(`${apiBase()}/news?${params}`);
  if (!data) return fakeNews.getNews(filters);
  return data;
}

export async function getPublishedNews(
  filters: Omit<NewsFilters, 'status'>
): Promise<NewsResponse> {
  return getNews({ ...filters, status: 'published' });
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await safeFetch<NewsItem>(`${apiBase()}/news/${encodeURIComponent(slug)}`);
  if (!data) return fakeNews.getNewsBySlug(slug);
  return data;
}

export async function getNewsById(id: number): Promise<NewsItem | null> {
  const data = await safeFetch<NewsItem>(`${apiBase()}/news/${id}`);
  if (!data) return fakeNews.getNewsById(id);
  return data;
}

export async function getFeaturedNews(): Promise<NewsItem[]> {
  const data = await safeFetch<NewsItem[]>(`${apiBase()}/news?action=featured`);
  if (!data) return fakeNews.getFeaturedNews();
  return data;
}

export async function getAllNewsCategories(): Promise<string[]> {
  const data = await safeFetch<string[]>(`${apiBase()}/news?action=categories`);
  if (!data) return fakeNews.getAllCategories();
  return data;
}

export async function getNewsStats(): Promise<NewsStats> {
  const data = await safeFetch<NewsStats>(`${apiBase()}/news?action=stats`);
  if (!data) return fakeNews.getStats();
  return data;
}

export async function createNews(payload: CreateNewsPayload): Promise<NewsItem> {
  const res = await fetch(`${apiBase()}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create news: ${res.statusText}`);
  return res.json() as Promise<NewsItem>;
}

export async function updateNews(id: number, payload: UpdateNewsPayload): Promise<NewsItem | null> {
  return safeFetch<NewsItem>(`${apiBase()}/news/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteNews(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/news/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

/** 时间线数据保持静态（不存数据库） */
export function getTimeline(): TimelineEvent[] {
  return AI_TIMELINE;
}
