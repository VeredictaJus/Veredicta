import type { Handler } from 'vite-plugin-api-routes';

export const handler: Handler = async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'API funcionando!' }));
};











