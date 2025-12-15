import type { Handler } from 'vite-plugin-api-routes';
import { supabase } from '../lib/supabase';
import ExcelJS from 'exceljs';
import Papa from 'papaparse'; // ✅ corrigido aqui
import { format } from 'date-fns';

export const handler: Handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  const { format: fmt, payload } = await new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(JSON.parse(body)));
    req.on('error', reject);
  });

  try {
    const { data, error } = await supabase
      .from('analytics_dashboard_view')
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Dados não encontrados');

    const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
    let buffer: Buffer;
    let mime: string;
    let ext: string;

    if (fmt === 'excel') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Dashboard');
      Object.entries(data).forEach(([key, value], i) => {
        ws.getCell(1, i + 1).value = key;
        ws.getCell(2, i + 1).value = String(value);
      });
      buffer = await wb.xlsx.writeBuffer();
      mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      ext = 'xlsx';
    } else if (fmt === 'csv') {
      const csv = Papa.unparse([data]); // ✅ corrigido aqui
      buffer = Buffer.from(csv);
      mime = 'text/csv';
      ext = 'csv';
    } else {
      throw new Error('Formato inválido');
    }

    const filename = `dashboard_${timestamp}.${ext}`;
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.end(buffer);
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
};
