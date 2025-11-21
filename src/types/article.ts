export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  categories: Category[];
  tags: string[];
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  readTime: number;
  slug: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

export interface ArticleFilters {
  status?: string;
  category?: string;
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  thisMonth: number;
  thisWeek: number;
  avgViews: number;
  avgReadTime: number;
}