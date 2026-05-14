import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  gender: parseAsString,
  category: parseAsString,
  role: parseAsString,
  sort: parseAsString,
  // AI Skill Navigation
  search: parseAsString,
  difficulty: parseAsString,
  status: parseAsString,
  region: parseAsString,
  platform: parseAsString,
  // Agent Hub
  agent_page: parseAsInteger.withDefault(1),
  agent_search: parseAsString,
  agent_type: parseAsString,
  agent_source: parseAsString, // 'all' | 'app' | 'github'
  // MCP Hub
  mcp_page: parseAsInteger.withDefault(1),
  mcp_search: parseAsString,
  mcp_cat: parseAsString, // category filter
  // Skill Hub — tab switcher + tool filters
  skill_tab: parseAsString, // 'sites' | 'tools'
  skill_tool_page: parseAsInteger.withDefault(1),
  skill_tool_search: parseAsString,
  skill_tool_cat: parseAsString // tool category filter
  // advanced filter
  // filters: getFiltersStateParser().withDefault([]),
  // joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and')
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
