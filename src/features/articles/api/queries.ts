import { queryOptions } from '@tanstack/react-query';
import {
  getArticles,
  getPublishedArticles,
  getArticleBySlug,
  getArticleById,
  getAllTags
} from './service';
import type { ArticleFilters } from './types';

export const articleKeys = {
  all: ['articles'] as const,
  list: (filters: ArticleFilters) => [...articleKeys.all, 'list', filters] as const,
  published: (opts?: { page?: number; limit?: number; tag?: string }) =>
    [...articleKeys.all, 'published', opts] as const,
  detail: (id: number) => [...articleKeys.all, 'detail', id] as const,
  slug: (slug: string) => [...articleKeys.all, 'slug', slug] as const,
  tags: () => [...articleKeys.all, 'tags'] as const
};

export const articlesQueryOptions = (filters: ArticleFilters) =>
  queryOptions({
    queryKey: articleKeys.list(filters),
    queryFn: () => getArticles(filters),
    staleTime: 30 * 1000
  });

export const publishedArticlesOptions = (opts?: { page?: number; limit?: number; tag?: string }) =>
  queryOptions({
    queryKey: articleKeys.published(opts),
    queryFn: () => getPublishedArticles(opts),
    staleTime: 60 * 1000
  });

export const articleBySlugOptions = (slug: string) =>
  queryOptions({
    queryKey: articleKeys.slug(slug),
    queryFn: () => getArticleBySlug(slug),
    staleTime: 60 * 1000
  });

export const articleByIdOptions = (id: number) =>
  queryOptions({
    queryKey: articleKeys.detail(id),
    queryFn: () => getArticleById(id),
    staleTime: 30 * 1000
  });

export const allTagsOptions = () =>
  queryOptions({
    queryKey: articleKeys.tags(),
    queryFn: () => getAllTags(),
    staleTime: 5 * 60 * 1000
  });
