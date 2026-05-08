import { fakeModels } from '@/constants/mock-api-models';
import type { AiModel, Benchmark } from '@/constants/mock-api-models';

export type { AiModel, Benchmark };
export type CreateModelPayload = Omit<AiModel, 'id'>;
export type UpdateModelPayload = Partial<CreateModelPayload>;

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

export async function getModels(
  opts: {
    search?: string;
    vendor?: string;
    is_open_source?: boolean;
  } = {}
): Promise<AiModel[]> {
  const params = new URLSearchParams();
  if (opts.search) params.set('search', opts.search);
  if (opts.vendor && opts.vendor !== 'all') params.set('vendor', opts.vendor);
  if (opts.is_open_source !== undefined) params.set('is_open_source', String(opts.is_open_source));

  const data = await safeFetch<AiModel[]>(`${apiBase()}/models?${params}`);
  if (!data) return fakeModels.getModels(opts);
  return data;
}

export async function getBenchmarks(): Promise<Benchmark[]> {
  const data = await safeFetch<Benchmark[]>(`${apiBase()}/models?action=benchmarks`);
  if (!data) return fakeModels.getBenchmarks();
  return data;
}

export async function getModelStats() {
  const data = await safeFetch<{
    total: number;
    openSource: number;
    multimodal: number;
    vendors: number;
  }>(`${apiBase()}/models?action=stats`);
  if (!data) return fakeModels.getStats();
  return data;
}

/** 向后兼容的同步方法 */
export function getAllBenchmarks(): Benchmark[] {
  return [];
}

export async function getModelById(id: number): Promise<AiModel | null> {
  return safeFetch<AiModel>(`${apiBase()}/models/${id}`);
}

export async function createModel(payload: CreateModelPayload): Promise<AiModel> {
  const res = await fetch(`${apiBase()}/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create model: ${res.statusText}`);
  return res.json() as Promise<AiModel>;
}

export async function updateModel(
  id: number,
  payload: UpdateModelPayload
): Promise<AiModel | null> {
  return safeFetch<AiModel>(`${apiBase()}/models/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteModel(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/models/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}
