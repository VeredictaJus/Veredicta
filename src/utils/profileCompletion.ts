import type { UserSettings } from '@/services/userSettingsService';

/**
 * Regra mínima de "perfil completo" (opção A):
 * - document (CPF/CNPJ)
 * - phone
 * - company OU full_name
 */
export function isClientProfileComplete(settings?: UserSettings | null): boolean {
  const document = String(settings?.document || '').trim();
  const phone = String(settings?.phone || '').trim();
  const nameOrCompany = String(settings?.company || settings?.full_name || '').trim();

  return Boolean(document && phone && nameOrCompany);
}

