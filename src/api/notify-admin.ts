// src/api/notify-admin.ts
export async function notifyAdmin(payload: {
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  oab?: string;
  oab_state?: string;
}) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notificar-admin`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('Erro na notificação:', txt || res.status);
      throw new Error(`Falha ao notificar admin: ${txt || res.status}`);
    }

    return await res.json().catch(() => ({}));
  } catch (error) {
    console.error('Erro inesperado ao notificar admin:', error);
    throw error;
  }
}
