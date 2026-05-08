import { fakeAgents } from '@/constants/mock-api-agents';
import type {
  Agent,
  AgentFilters,
  AgentsResponse,
  AgentStats,
  CreateAgentPayload,
  UpdateAgentPayload
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

export async function getAgents(filters: AgentFilters): Promise<AgentsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.agent_type && filters.agent_type !== 'all')
    params.set('agent_type', filters.agent_type);
  if (filters.open_source && filters.open_source !== 'all')
    params.set('open_source', filters.open_source);
  if (filters.status) params.set('status', filters.status);
  if (filters.sort) params.set('sort', filters.sort);

  const data = await safeFetch<AgentsResponse>(`${apiBase()}/agents?${params}`);
  if (!data) return fakeAgents.getAgents(filters);
  return data;
}

export async function getFeaturedAgents(): Promise<Agent[]> {
  const data = await safeFetch<Agent[]>(`${apiBase()}/agents?action=featured`);
  if (!data) return fakeAgents.getFeaturedAgents();
  return data;
}

export async function getAgentById(id: number): Promise<Agent | null> {
  return safeFetch<Agent>(`${apiBase()}/agents/${id}`);
}

export async function getAgentStats(): Promise<AgentStats> {
  const data = await safeFetch<AgentStats>(`${apiBase()}/agents?action=stats`);
  if (!data) return fakeAgents.getStats();
  return data;
}

export async function createAgent(payload: CreateAgentPayload): Promise<Agent> {
  const res = await fetch(`${apiBase()}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create agent: ${res.statusText}`);
  return res.json() as Promise<Agent>;
}

export async function updateAgent(id: number, payload: UpdateAgentPayload): Promise<Agent | null> {
  return safeFetch<Agent>(`${apiBase()}/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteAgent(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/agents/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function reviewAgent(
  id: number,
  action: 'approve' | 'reject',
  note?: string
): Promise<Agent | null> {
  const status = action === 'approve' ? 'published' : 'rejected';
  return updateAgent(id, { status, review_note: note });
}
