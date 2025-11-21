import React, { useState, useEffect } from 'react';
import { Article, ArticleFilters, Category } from '../../types/article';
import { ArticleService } from '../../services/articleService';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Calendar,
  User,
  Tag,
  CheckSquare,
  Square,
  Archive,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticlesListProps {
  onEdit?: (article: Article) => void;
  onDelete?: (id: string) => void;
  onBulkAction?: (action: string, ids: string[]) => void;
}

export const ArticlesList: React.FC<ArticlesListProps> = ({
  onEdit,
  onDelete,
  onBulkAction
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const result = await ArticleService.getArticles(filters, currentPage);
      setArticles(result.articles);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await ArticleService.getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [filters, currentPage]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;
    setFilters({ ...filters, search });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ArticleFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setCurrentPage(1);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === articles.length 
        ? [] 
        : articles.map(a => a.id)
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;
    onBulkAction?.(action, selectedIds);
    setSelectedIds([]);
  };

  const getStatusBadge = (status: Article['status']) => {
    const statusConfig = {
      published: { label: 'Publicado', class: 'bg-green-100 text-green-800' },
      draft: { label: 'Rascunho', class: 'bg-yellow-100 text-yellow-800' },
      archived: { label: 'Arquivado', class: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artigos</h1>
          <p className="text-gray-600">Gerencie todos os artigos da plataforma</p>
        </div>
        
        <Link
          to="/articles/new"
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="search"
                type="text"
                placeholder="Buscar artigos..."
                defaultValue={filters.search}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </form>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="published">Publicado</option>
              <option value="draft">Rascunho</option>
              <option value="archived">Arquivado</option>
            </select>

            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => handleFilterChange('dateRange', JSON.stringify({
                start: e.target.value,
                end: filters.dateRange?.end || ''
              }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <button
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-800">
              {selectedIds.length} artigo(s) selecionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Publicar
              </button>
              <button
                onClick={() => handleBulkAction('draft')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                Rascunho
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Arquivar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando artigos...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum artigo encontrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro artigo</p>
            <Link
              to="/articles/new"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Artigo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleSelectAll} className="flex items-center">
                      {selectedIds.length === articles.length ? (
                        <CheckSquare className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Autor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Métricas
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => toggleSelection(article.id)}
                        className="flex items-center"
                      >
                        {selectedIds.includes(article.id) ? (
                          <CheckSquare className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start">
                        {article.featuredImage && (
                          <img
                            src={article.featuredImage}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {article.excerpt}
                          </p>
                          {article.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {article.author.avatar && (
                          <img
                            src={article.author.avatar}
                            alt=""
                            className="h-6 w-6 rounded-full mr-2"
                          />
                        )}
                        <span className="text-sm text-gray-900">{article.author.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {article.categories.map(category => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: `${category.color}20`,
                              color: category.color 
                            }}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {article.publishedAt ? 'Publicado' : 'Criado'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Eye className="h-3 w-3 mr-1" />
                          {article.views}
                        </div>
                        <div className="text-xs text-gray-500">
                          {article.readTime}min leitura
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/articles/${article.id}/preview`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/articles/${article.id}/edit`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => onDelete?.(article.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};