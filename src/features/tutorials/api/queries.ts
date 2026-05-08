import { queryOptions } from '@tanstack/react-query';
import { getTutorials, getFeaturedTutorials } from './service';

export const tutorialKeys = {
  all: ['tutorials'] as const,
  list: (filters: object) => [...tutorialKeys.all, 'list', filters] as const,
  featured: () => [...tutorialKeys.all, 'featured'] as const
};

export const tutorialsQueryOptions = (
  filters: {
    level?: string;
    category?: string;
    search?: string;
  } = {}
) =>
  queryOptions({
    queryKey: tutorialKeys.list(filters),
    queryFn: () => getTutorials(filters),
    staleTime: 5 * 60 * 1000
  });

export const featuredTutorialsOptions = () =>
  queryOptions({
    queryKey: tutorialKeys.featured(),
    queryFn: () => getFeaturedTutorials(),
    staleTime: 5 * 60 * 1000
  });
