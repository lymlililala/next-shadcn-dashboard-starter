import { fakeTutorials } from '@/constants/mock-api-tutorials';
import type { Tutorial, TutorialLevel, TutorialCategory } from '@/constants/mock-api-tutorials';

export type { Tutorial, TutorialLevel, TutorialCategory };
export type CreateTutorialPayload = Omit<Tutorial, 'id'>;
export type UpdateTutorialPayload = Partial<CreateTutorialPayload>;

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

export async function getTutorials(
  opts: {
    level?: string;
    category?: string;
    search?: string;
  } = {}
): Promise<Tutorial[]> {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.level && opts.level !== 'all') params.set('level', opts.level);
  if (opts.category && opts.category !== 'all') params.set('category', opts.category);

  const data = await safeFetch<Tutorial[]>(`${apiBase()}/tutorials?${params}`);
  if (!data) return fakeTutorials.getTutorials(opts);
  return data;
}

export async function getTutorialBySlug(slug: string): Promise<Tutorial | null> {
  const data = await safeFetch<Tutorial>(`${apiBase()}/tutorials?slug=${encodeURIComponent(slug)}`);
  if (!data) return fakeTutorials.getTutorialBySlug(slug);
  return data;
}

export async function getTutorialStats() {
  const data = await safeFetch<{
    total: number;
    featured: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
  }>(`${apiBase()}/tutorials?action=stats`);
  if (!data) {
    const all = await getTutorials();
    const total = all.length;
    const featured = all.filter((t) => t.is_featured).length;
    const byLevel = all.reduce((acc: Record<string, number>, t) => {
      acc[t.level] = (acc[t.level] ?? 0) + 1;
      return acc;
    }, {});
    const byCategory = all.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    }, {});
    return { total, featured, byLevel, byCategory };
  }
  return data;
}

export async function getFeaturedTutorials(): Promise<Tutorial[]> {
  const data = await safeFetch<Tutorial[]>(`${apiBase()}/tutorials?action=featured`);
  if (!data) return fakeTutorials.getFeatured();
  return data;
}

export async function createTutorial(payload: CreateTutorialPayload): Promise<Tutorial> {
  const res = await fetch(`${apiBase()}/tutorials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create tutorial: ${res.statusText}`);
  return res.json() as Promise<Tutorial>;
}

export async function updateTutorial(
  id: number,
  payload: UpdateTutorialPayload
): Promise<Tutorial | null> {
  return safeFetch<Tutorial>(`${apiBase()}/tutorials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteTutorial(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/tutorials/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}
