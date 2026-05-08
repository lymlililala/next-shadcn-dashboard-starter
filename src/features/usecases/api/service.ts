import { fakeUseCases } from '@/constants/mock-api-usecases';
import type { UseCase, UseCaseIndustry, UseCaseDifficulty } from '@/constants/mock-api-usecases';

export type { UseCase, UseCaseIndustry, UseCaseDifficulty };
export type CreateUseCasePayload = Omit<UseCase, 'id'>;
export type UpdateUseCasePayload = Partial<CreateUseCasePayload>;

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

export async function getUseCases(
  opts: {
    industry?: string;
    difficulty?: number;
    search?: string;
  } = {}
): Promise<UseCase[]> {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.industry && opts.industry !== 'all') params.set('industry', opts.industry);
  if (opts.difficulty && opts.difficulty > 0) params.set('difficulty', String(opts.difficulty));

  const data = await safeFetch<UseCase[]>(`${apiBase()}/usecases?${params}`);
  if (!data) return fakeUseCases.getUseCases(opts);
  return data;
}

export async function getFeaturedUseCases(): Promise<UseCase[]> {
  const data = await safeFetch<UseCase[]>(`${apiBase()}/usecases?action=featured`);
  if (!data) return fakeUseCases.getFeatured();
  return data;
}

export async function getUseCaseStats() {
  const data = await safeFetch<{
    total: number;
    featured: number;
    byIndustry: Record<string, number>;
  }>(`${apiBase()}/usecases?action=stats`);
  if (!data) return fakeUseCases.getStats();
  return data;
}

export async function createUseCase(payload: CreateUseCasePayload): Promise<UseCase> {
  const res = await fetch(`${apiBase()}/usecases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create use case: ${res.statusText}`);
  return res.json() as Promise<UseCase>;
}

export async function updateUseCase(
  id: number,
  payload: UpdateUseCasePayload
): Promise<UseCase | null> {
  return safeFetch<UseCase>(`${apiBase()}/usecases/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteUseCase(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/usecases/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}
