import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { SearchFilters } from '@/hooks/useAdvancedSearch';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdvancedSearchModalProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  totalResults: number;
  activeFiltersCount: number;
  activeFiltersLabels: string[];
  children?: React.ReactNode;
}

const typeOptions = [
  { value: 'client', label: 'Cliente' },
  { value: 'writer', label: 'Redator' },
   { value: 'admin', label: 'Admin' }
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'archived', label: 'Arquivado' }
];

const datePresets = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'custom', label: 'Período personalizado' }
];

const sortOptions = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'date', label: 'Data' },
  { value: 'name', label: 'Nome' }
];

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults,
  activeFiltersCount,
  activeFiltersLabels,
  children
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.types, type as any]
      : filters.types.filter(t => t !== type);
    onFiltersChange({ types: newTypes });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filters.status, status as any]
      : filters.status.filter(s => s !== status);
    onFiltersChange({ status: newStatus });
  };

  const handleDatePresetChange = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let dateRange = {};
    switch (preset) {
      case 'today':
        dateRange = {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          preset: 'today'
        };
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        dateRange = {
          start: weekStart,
          end: now,
          preset: 'week'
        };
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        dateRange = {
          start: monthStart,
          end: now,
          preset: 'month'
        };
        break;
      case 'custom':
        dateRange = {
          preset: 'custom'
        };
        break;
    }
    
    onFiltersChange({ dateRange });
  };

  const handleCustomDateChange = (field: 'start' | 'end', date: Date | undefined) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: date,
        preset: 'custom'
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Busca Avançada
            </div>
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar ({activeFiltersCount})
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Buscar por texto</Label>
            <Input
              id="search-query"
              placeholder="Digite sua busca..."
              value={filters.query}
              onChange={(e) => onFiltersChange({ query: e.target.value })}
            />
          </div>

          {/* Active Filters Display */}
          {activeFiltersLabels.length > 0 && (
            <div className="space-y-2">
              <Label>Filtros ativos</Label>
              <div className="flex flex-wrap gap-2">
                {activeFiltersLabels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Type Filters */}
          <div className="space-y-3">
            <Label>Tipo de conversa</Label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={filters.types.includes(option.value as any)}
                    onCheckedChange={(checked) => 
                      handleTypeChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`type-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-3">
            <Label>Status da conversa</Label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.status.includes(option.value as any)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`status-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Período</Label>
            <RadioGroup
              value={filters.dateRange.preset || ''}
              onValueChange={handleDatePresetChange}
            >
              {datePresets.map((preset) => (
                <div key={preset.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={preset.value} id={`date-${preset.value}`} />
                  <Label htmlFor={`date-${preset.value}`} className="text-sm">
                    {preset.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {filters.dateRange.preset === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Data inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.start 
                          ? format(filters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Selecionar data'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.start}
                        onSelect={(date) => handleCustomDateChange('start', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.end 
                          ? format(filters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })
                          : 'Selecionar data'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.end}
                        onSelect={(date) => handleCustomDateChange('end', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Sorting */}
          <div className="space-y-3">
            <Label>Ordenação</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <RadioGroup
                  value={filters.sortBy}
                  onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
                >
                  {sortOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                      <Label htmlFor={`sort-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFiltersChange({ sortOrder: 'asc' })}
                >
                  <SortAsc className="h-4 w-4 mr-1" />
                  Crescente
                </Button>
                <Button
                  variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFiltersChange({ sortOrder: 'desc' })}
                >
                  <SortDesc className="h-4 w-4 mr-1" />
                  Decrescente
                </Button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </span>
              <Button onClick={() => setIsOpen(false)}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};