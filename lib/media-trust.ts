// Only media on the project's Supabase host may reach next/image or <video>.

export function trustedHost(supabaseUrl: string | undefined): string | null {
  try {
    return new URL(supabaseUrl ?? "").host;
  } catch {
    return null;
  }
}

export function isTrustedMediaFor(host: string | null, url: string | null | undefined): boolean {
  if (!host || !url) return false;
  try {
    const u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") && u.host === host;
  } catch {
    return false;
  }
}

const HOST = trustedHost(process.env.NEXT_PUBLIC_SUPABASE_URL);

export function isTrustedMedia(url: string | null | undefined): boolean {
  return isTrustedMediaFor(HOST, url);
}
