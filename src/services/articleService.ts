import { Article, Category, ArticleFilters, ArticleStats } from '../types/article';

// Mock data for development
const mockCategories: Category[] = [
  { id: '1', name: 'Direito Civil', slug: 'direito-civil', color: '#3B82F6', description: 'Artigos sobre direito civil' },
  { id: '2', name: 'Direito Penal', slug: 'direito-penal', color: '#EF4444', description: 'Artigos sobre direito penal' },
  { id: '3', name: 'Direito Trabalhista', slug: 'direito-trabalhista', color: '#10B981', description: 'Artigos sobre direito trabalhista' },
  { id: '4', name: 'Jurisprudência', slug: 'jurisprudencia', color: '#8B5CF6', description: 'Jurisprudência e precedentes' },
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Novas Regras do Código Civil',
    content: '<p>Conteúdo do artigo sobre as novas regras...</p>',
    excerpt: 'Análise das principais mudanças no código civil brasileiro',
    status: 'published',
    author: { id: '1', name: 'Dr. João Silva', avatar: '/avatars/joao.jpg' },
    categories: [mockCategories[0]],
    tags: ['código civil', 'legislação', 'direito'],
    featured: true,
    publishedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 1250,
    likes: 45,
    comments: 12,
    readTime: 5,
    slug: 'novas-regras-codigo-civil',
    featuredImage: '/images/codigo-civil.jpg',
    seoTitle: 'Novas Regras do Código Civil - Análise Completa',
    seoDescription: 'Análise detalhada das principais mudanças no código civil brasileiro'
  },
  {
    id: '2',
    title: 'Precedentes Relevantes do STF',
    content: '<p>Análise dos precedentes mais importantes...</p>',
    excerpt: 'Compilação dos precedentes mais relevantes do Supremo Tribunal Federal',
    status: 'draft',
    author: { id: '2', name: 'Dra. Maria Santos', avatar: '/avatars/maria.jpg' },
    categories: [mockCategories[3]],
    tags: ['STF', 'precedentes', 'jurisprudência'],
    featured: false,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
    views: 0,
    likes: 0,
    comments: 0,
    readTime: 8,
    slug: 'precedentes-relevantes-stf',
  },
  {
    id: '3',
    title: 'Reforma Trabalhista: 5 Anos Depois',
    content: '<p>Avaliação dos impactos da reforma trabalhista...</p>',
    excerpt: 'Análise dos impactos da reforma trabalhista após 5 anos de vigência',
    status: 'published',
    author: { id: '3', name: 'Dr. Carlos Oliveira', avatar: '/avatars/carlos.jpg' },
    categories: [mockCategories[2]],
    tags: ['reforma trabalhista', 'CLT', 'trabalho'],
    featured: false,
    publishedAt: '2024-01-10T09:00:00Z',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
    views: 890,
    likes: 32,
    comments: 8,
    readTime: 6,
    slug: 'reforma-trabalhista-5-anos-depois',
    featuredImage: '/images/reforma-trabalhista.jpg',
  }
];

export class ArticleService {
  static getArticles(filters?: ArticleFilters, page = 1, limit = 10): Promise<{
    articles: Article[];
    total: number;
    totalPages: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredArticles = [...mockArticles];

        // Apply filters
        if (filters) {
          if (filters.status) {
            filteredArticles = filteredArticles.filter(a => a.status === filters.status);
          }
          if (filters.category) {
            filteredArticles = filteredArticles.filter(a => 
              a.categories.some(c => c.id === filters.category)
            );
          }
          if (filters.author) {
            filteredArticles = filteredArticles.filter(a => a.author.id === filters.author);
          }
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filteredArticles = filteredArticles.filter(a => 
              a.title.toLowerCase().includes(search) || 
              a.excerpt.toLowerCase().includes(search)
            );
          }
        }

        const total = filteredArticles.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const articles = filteredArticles.slice(startIndex, startIndex + limit);

        resolve({ articles, total, totalPages });
      }, 300);
    });
  }

  static getArticleById(id: string): Promise<Article | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const article = mockArticles.find(a => a.id === id);
        resolve(article || null);
      }, 200);
    });
  }

  static createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newArticle: Article = {
          ...article,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockArticles.unshift(newArticle);
        resolve(newArticle);
      }, 500);
    });
  }

  static updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockArticles.findIndex(a => a.id === id);
        if (index === -1) {
          reject(new Error('Article not found'));
          return;
        }
        
        mockArticles[index] = {
          ...mockArticles[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        resolve(mockArticles[index]);
      }, 500);
    });
  }

  static deleteArticle(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockArticles.findIndex(a => a.id === id);
        if (index === -1) {
          reject(new Error('Article not found'));
          return;
        }
        mockArticles.splice(index, 1);
        resolve();
      }, 300);
    });
  }

  static bulkUpdateStatus(ids: string[], status: Article['status']): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        ids.forEach(id => {
          const index = mockArticles.findIndex(a => a.id === id);
          if (index !== -1) {
            mockArticles[index].status = status;
            mockArticles[index].updatedAt = new Date().toISOString();
          }
        });
        resolve();
      }, 500);
    });
  }

  static getCategories(): Promise<Category[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockCategories]);
      }, 200);
    });
  }

  static getArticleStats(): Promise<ArticleStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = mockArticles.length;
        const published = mockArticles.filter(a => a.status === 'published').length;
        const draft = mockArticles.filter(a => a.status === 'draft').length;
        const archived = mockArticles.filter(a => a.status === 'archived').length;
        
        const now = new Date();
        const thisMonth = mockArticles.filter(a => {
          const created = new Date(a.createdAt);
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;
        
        const thisWeek = mockArticles.filter(a => {
          const created = new Date(a.createdAt);
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return created >= weekAgo;
        }).length;

        const avgViews = Math.round(mockArticles.reduce((sum, a) => sum + a.views, 0) / total);
        const avgReadTime = Math.round(mockArticles.reduce((sum, a) => sum + a.readTime, 0) / total);

        resolve({
          total,
          published,
          draft,
          archived,
          thisMonth,
          thisWeek,
          avgViews,
          avgReadTime,
        });
      }, 200);
    });
  }
}