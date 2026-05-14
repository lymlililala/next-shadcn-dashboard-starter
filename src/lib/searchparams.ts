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
  agent_source: parseAsString // 'all' | 'app' | 'github'
  // advanced filter
  // filters: getFiltersStateParser().withDefault([]),
  // joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and')
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
