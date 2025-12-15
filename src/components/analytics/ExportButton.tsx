import React, { useState } from 'react';
import { Download, FileText, Table, File } from 'lucide-react';
import { AnalyticsService } from '../../services/analyticsService';
import { DateRange } from '../../types/analytics';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  dateRange: DateRange;
  data?: any;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ dateRange, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    setIsOpen(false);

    const toastId = toast.loading('Exportando relatório...');

    try {
      const blob = await AnalyticsService.exportData(format, { dateRange, data });
      const fileName = `relatorio_${format}_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`;
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!', { id: toastId });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exportando...' : 'Exportar'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4 mr-3" />
              Exportar PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Table className="h-4 w-4 mr-3" />
              Exportar Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <File className="h-4 w-4 mr-3" />
              Exportar CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
