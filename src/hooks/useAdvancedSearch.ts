import { useState, useMemo, useCallback } from 'react';
// Using native debounce implementation instead of lodash
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export interface SearchFilters {
  query: string;
  types: ('client' | 'writer' | 'support' | 'admin')[];
  status: ('active' | 'waiting' | 'resolved' | 'archived')[];
  dateRange: {
    start?: Date;
    end?: Date;
    preset?: 'today' | 'week' | 'month' | 'custom';
  };
  sortBy: 'relevance' | 'date' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface SearchableItem {
  id: string;
  name: string;
  type?: 'client' | 'writer' | 'support' | 'admin';
  status?: 'active' | 'waiting' | 'resolved' | 'archived';
  lastMessageTime: Date;
  lastMessage: string;
  messages?: Array<{
    id: string;
    content: string;
    timestamp: Date;
    sender: string;
  }>;
  [key: string]: any;
}

const defaultFilters: SearchFilters = {
  query: '',
  types: [],
  status: [],
  dateRange: {},
  sortBy: 'relevance',
  sortOrder: 'desc'
};

export const useAdvancedSearch = <T extends SearchableItem>(items: T[]) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((searchFilters: SearchFilters) => {
      setIsSearching(false);
    }, 300),
    []
  );

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setIsSearching(true);
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    debouncedSearch(updatedFilters);
  }, [filters, debouncedSearch]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setIsSearching(false);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.query.trim() !== '' ||
      filters.types.length > 0 ||
      filters.status.length > 0 ||
      filters.dateRange.start ||
      filters.dateRange.end
    );
  }, [filters]);

  const getDateRangeFilter = useCallback((preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart,
          end: now
        };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: monthStart,
          end: now
        };
      default:
        return {};
    }
  }, []);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }, []);

  const searchScore = useCallback((item: T, query: string): number => {
    if (!query.trim()) return 0;
    
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Name match (highest priority)
    if (item.name.toLowerCase().includes(lowerQuery)) {
      score += item.name.toLowerCase().startsWith(lowerQuery) ? 100 : 50;
    }
    
    // Last message match
    if (item.lastMessage.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }
    
    // Message content match
    if (item.messages) {
      const messageMatches = item.messages.filter(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      ).length;
      score += messageMatches * 10;
    }
    
    return score;
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];
    
    // Apply query filter
    if (filters.query.trim()) {
      result = result.filter(item => {
        const query = filters.query.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.lastMessage.toLowerCase().includes(query) ||
          (item.messages && item.messages.some(msg => 
            msg.content.toLowerCase().includes(query)
          ))
        );
      });
    }
    
    // Apply type filter
    if (filters.types.length > 0) {
      result = result.filter(item => 
        item.type && filters.types.includes(item.type)
      );
    }
    
    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(item => 
        item.status && filters.status.includes(item.status)
      );
    }
    
    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(item => {
        const itemDate = new Date(item.lastMessageTime);
        if (filters.dateRange.start && itemDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && itemDate > filters.dateRange.end) {
          return false;
        }
        return true;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'relevance':
          if (filters.query.trim()) {
            comparison = searchScore(b, filters.query) - searchScore(a, filters.query);
          } else {
            comparison = new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
          }
          break;
        case 'date':
          comparison = new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });
    
    return result;
  }, [items, filters, searchScore]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.query.trim()) count++;
    if (filters.types.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  const getActiveFiltersLabels = useCallback(() => {
    const labels: string[] = [];
    
    if (filters.query.trim()) {
      labels.push(`"${filters.query}"`);
    }
    
    if (filters.types.length > 0) {
      const typeLabels = filters.types.map(type => {
        switch (type) {
          case 'client': return 'Cliente';
          case 'writer': return 'Redator';
                   case 'admin': return 'Admin';
          default: return type;
        }
      });
      labels.push(`Tipos: ${typeLabels.join(', ')}`);
    }
    
    if (filters.status.length > 0) {
      const statusLabels = filters.status.map(status => {
        switch (status) {
          case 'active': return 'Ativo';
          case 'waiting': return 'Aguardando';
          case 'resolved': return 'Resolvido';
          case 'archived': return 'Arquivado';
          default: return status;
        }
      });
      labels.push(`Status: ${statusLabels.join(', ')}`);
    }
    
    if (filters.dateRange.preset) {
      const presetLabels = {
        today: 'Hoje',
        week: 'Esta semana',
        month: 'Este mês',
        custom: 'Período personalizado'
      };
      labels.push(`Data: ${presetLabels[filters.dateRange.preset]}`);
    }
    
    return labels;
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    filteredItems,
    isSearching,
    hasActiveFilters,
    getDateRangeFilter,
    highlightText,
    getActiveFiltersCount,
    getActiveFiltersLabels,
    totalResults: filteredItems.length
  };
};