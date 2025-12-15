import React, { useState } from 'react';
import { DateRange } from '../../types/analytics';
import { AnalyticsService } from '../../services/analyticsService';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const presets = AnalyticsService.getDateRangePresets();

  const handlePresetSelect = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      const range: DateRange = {
        start: new Date(customStart),
        end: new Date(customEnd),
        preset: 'custom'
      };
      onChange(range);
      setIsOpen(false);
    }
  };

  const formatDateRange = (range: DateRange) => {
    if (range.preset && range.preset !== 'custom') {
      const preset = presets.find(p => p.range.preset === range.preset);
      return preset?.label || 'Período personalizado';
    }
    
    const startDate = range.start.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
    const endDate = range.end.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
    
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        <Calendar className="h-4 w-4 mr-2" />
        {formatDateRange(value)}
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Selecionar Período
            </h4>
            
            {/* Preset Options */}
            <div className="space-y-1 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => handlePresetSelect(preset.range)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${
                    value.preset === preset.range.preset 
                      ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                      : 'text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Período Personalizado
              </h5>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleCustomRange}
                  disabled={!customStart || !customEnd}
                  className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};