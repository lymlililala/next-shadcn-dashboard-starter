export type {
  Article,
  ArticleStatus,
  CreateArticlePayload,
  UpdateArticlePayload
} from '@/constants/mock-api-articles';

export type ArticleFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tag?: string;
  sort?: string;
};

export type ArticlesResponse = {
  items: import('@/constants/mock-api-articles').Article[];
  total_items: number;
};
