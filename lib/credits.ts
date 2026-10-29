// Parses public/beaches/CREDITS.md (a markdown table) into rows for the /credits page.

export type CreditRow = { file: string; author: string; license: string; licenseUrl: string | null; source: string | null };

const isHttp = (s: string) => /^https?:\/\//i.test(s);

export function parseCredits(md: string): CreditRow[] {
  const rows: CreditRow[] = [];
  for (const line of md.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
    if (cells.length < 5) continue;
    const [file, author, license, licenseUrl, source] = cells;
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue; // skips the header and the --- separator
    rows.push({
      file,
      author,
      license,
      licenseUrl: isHttp(licenseUrl) ? licenseUrl : null,
      source: isHttp(source) ? source : null,
    });
  }
  return rows;
}
