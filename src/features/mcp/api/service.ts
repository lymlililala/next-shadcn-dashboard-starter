import { fakeMcpServers } from '@/constants/mock-api-mcp';
import type { McpServer, McpCategory } from '@/constants/mock-api-mcp';

export type { McpServer, McpCategory };
export type CreateMcpPayload = Omit<McpServer, 'id' | 'created_at'>;
export type UpdateMcpPayload = Partial<CreateMcpPayload>;

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

export async function getMcpServers(opts: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  is_official?: boolean;
}) {
  const params = new URLSearchParams();
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.search) params.set('search', opts.search);
  if (opts.category && opts.category !== 'all') params.set('category', opts.category);
  if (opts.is_official !== undefined) params.set('is_official', String(opts.is_official));

  const data = await safeFetch<{ items: McpServer[]; total_items: number }>(
    `${apiBase()}/mcp?${params}`
  );
  if (!data) return fakeMcpServers.getMcpServers(opts);
  return data;
}

export async function getFeaturedMcpServers(): Promise<McpServer[]> {
  const data = await safeFetch<McpServer[]>(`${apiBase()}/mcp?action=featured`);
  if (!data) return fakeMcpServers.getFeatured();
  return data;
}

export async function getMcpStats() {
  const data = await safeFetch<{
    total: number;
    official: number;
    featured: number;
    byCategory: Record<string, number>;
  }>(`${apiBase()}/mcp?action=stats`);
  if (!data) return fakeMcpServers.getStats();
  return data;
}

export async function getMcpById(id: number): Promise<McpServer | null> {
  return safeFetch<McpServer>(`${apiBase()}/mcp/${id}`);
}

export async function getMcpBySlug(slug: string): Promise<McpServer | null> {
  const data = await safeFetch<McpServer>(`${apiBase()}/mcp?slug=${encodeURIComponent(slug)}`);
  if (!data) return fakeMcpServers.getBySlug(slug);
  return data;
}

export async function getAllMcpServers(): Promise<McpServer[]> {
  const data = await safeFetch<{ items: McpServer[]; total_items: number }>(
    `${apiBase()}/mcp?limit=100`
  );
  if (!data) {
    const result = await fakeMcpServers.getMcpServers({ limit: 100 });
    return result.items;
  }
  return data.items;
}

export async function createMcpServer(payload: CreateMcpPayload): Promise<McpServer> {
  const res = await fetch(`${apiBase()}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create MCP server: ${res.statusText}`);
  return res.json() as Promise<McpServer>;
}

export async function updateMcpServer(
  id: number,
  payload: UpdateMcpPayload
): Promise<McpServer | null> {
  return safeFetch<McpServer>(`${apiBase()}/mcp/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteMcpServer(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/mcp/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}
