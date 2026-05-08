export type {
  Agent,
  AgentType,
  AgentOpenSource,
  AgentStatus,
  CreateAgentPayload,
  UpdateAgentPayload
} from '@/constants/mock-api-agents';

export type AgentFilters = {
  page?: number;
  limit?: number;
  search?: string;
  agent_type?: string;
  open_source?: string;
  status?: string;
  sort?: string;
};

export type AgentsResponse = {
  items: import('@/constants/mock-api-agents').Agent[];
  total_items: number;
};

export type AgentStats = {
  total: number;
  featured: number;
  pending: number;
  rejected: number;
  openCount: number;
  byType: Record<string, number>;
};
