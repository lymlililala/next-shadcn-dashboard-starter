export type {
  NewsItem,
  NewsCategory,
  NewsStatus,
  CreateNewsPayload,
  UpdateNewsPayload,
  TimelineEvent
} from '@/constants/mock-api-news';

export type { AI_TIMELINE } from '@/constants/mock-api-news';

export type NewsFilters = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
};

export type NewsResponse = {
  items: import('@/constants/mock-api-news').NewsItem[];
  total_items: number;
};

export type NewsStats = {
  published: number;
  draft: number;
  featured: number;
  byCategory: Record<string, number>;
};
