// Backend de perfiles en Supabase. Todo pasa por funciones RPC con prefijo mfp_;
// las tablas no son accesibles directamente. La clave publicable es pública por diseño.
const SUPABASE_URL = 'https://kqwcfzfxuvbyhiqkdltu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_faEgvA5yPrGd0FBNVDgWug_WvFH9uwK';

export type ProfileSummary = { id: string; name: string; color: string };

export class ApiError extends Error {}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
  } catch {
    throw new ApiError('Sin conexión. Revisa tu internet.');
  }
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(body?.message ?? `Error ${res.status}`);
  return body as T;
}

export const api = {
  listProfiles: () => rpc<ProfileSummary[]>('mfp_list_profiles'),
  createProfile: (name: string, password: string, color: string) =>
    rpc<string>('mfp_create_profile', { p_name: name, p_password: password, p_color: color }),
  /** Devuelve el token de sesión, o null si la contraseña es incorrecta */
  login: (profileId: string, password: string) =>
    rpc<string | null>('mfp_login', { p_profile_id: profileId, p_password: password }),
  load: (token: string) => rpc<Record<string, unknown> | null>('mfp_load', { p_token: token }),
  save: (token: string, data: unknown) => rpc<void>('mfp_save', { p_token: token, p_data: data }),
  logout: (token: string) => rpc<void>('mfp_logout', { p_token: token }),
  deleteProfile: (token: string) => rpc<void>('mfp_delete_profile', { p_token: token }),
};
