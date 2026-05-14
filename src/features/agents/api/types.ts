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
  /** 各分组在当前筛选条件下的真实总数（不受分页影响） */
  group_counts?: {
    app: number; // 应用产品（非 GitHub 且非内测）
    github: number; // 开源项目（GitHub）
    inner: number; // 内测中（url = '#'）
  };
};

export type AgentStats = {
  total: number;
  featured: number;
  pending: number;
  rejected: number;
  openCount: number;
  byType: Record<string, number>;
};
