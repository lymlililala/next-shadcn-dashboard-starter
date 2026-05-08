import { fakeArticles } from '@/constants/mock-api-articles';
import type {
  Article,
  ArticleFilters,
  ArticlesResponse,
  CreateArticlePayload,
  UpdateArticlePayload
} from './types';

export async function getArticles(filters: ArticleFilters): Promise<ArticlesResponse> {
  return fakeArticles.getArticles(filters);
}

export async function getPublishedArticles(opts?: {
  page?: number;
  limit?: number;
  tag?: string;
}): Promise<ArticlesResponse> {
  return fakeArticles.getPublishedArticles(opts);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return fakeArticles.getArticleBySlug(slug);
}

export async function getArticleById(id: number): Promise<Article | null> {
  return fakeArticles.getArticleById(id);
}

export async function getAllTags(): Promise<string[]> {
  return fakeArticles.getAllTags();
}

export async function createArticle(payload: CreateArticlePayload): Promise<Article> {
  return fakeArticles.createArticle(payload);
}

export async function updateArticle(
  id: number,
  payload: UpdateArticlePayload
): Promise<Article | null> {
  return fakeArticles.updateArticle(id, payload);
}

export async function deleteArticle(id: number): Promise<boolean> {
  return fakeArticles.deleteArticle(id);
}
