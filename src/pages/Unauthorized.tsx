// src/pages/Unauthorized.tsx
import React from 'react';

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center">
    <h1 className="text-4xl font-bold text-red-600">Acesso não autorizado</h1>
    <p className="mt-4 text-gray-600">Você não tem permissão para acessar esta página.</p>
  </div>
);

export default Unauthorized;
