/**
 * Free public live cams per beach slug (link out only; never embedded).
 * Several are a nearby cam rather than the exact break, so `label` names what the camera shows.
 * Beaches without a known free cam are absent and get no button.
 */
export type BeachCam = { url: string; label: string };

export const BEACH_CAMS: Readonly<Record<string, BeachCam>> = {
  hilton: { url: "https://beachcam.co.il/yamit.html", label: "הילטון ימית" },
  "bat-galim": { url: "https://beachcam.co.il/backdoor.html", label: "חיפה קזינו" },
  "sdot-yam-caesarea": {
    url: "https://wind.co.il/%D7%9E%D7%96%D7%92-%D7%90%D7%95%D7%99%D7%A8/%D7%A9%D7%99%D7%93%D7%95%D7%A8-%D7%97%D7%99/",
    label: "חוף קיסריה",
  },
  dolphinarium: { url: "https://beachcam.co.il/dolfinarium.html", label: "חוף אביב תל אביב" },
  // Not the Meridian cam: it was reported for zooming in on bathers (ynet).
  "zamir-nirvana": { url: "https://beachcam.co.il/testcam1.html", label: "חיפה סרף קלאב" },
  "ha-sira": { url: "https://beachcam.co.il/marina.html", label: "מרינה צפון הרצליה" },
  poleg: { url: "https://beachcam.co.il/kontiki.html", label: "קונטיקי נתניה" },
  "keshatot-gandhi": { url: "https://www.youtube.com/watch?v=fcbaCxpUs9Y", label: "אשדוד חוף י״א" },
};

export function beachCamFor(slug: string | null | undefined): BeachCam | null {
  return slug ? (BEACH_CAMS[slug] ?? null) : null;
}
