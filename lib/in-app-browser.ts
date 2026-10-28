// Detects in-app webviews (WhatsApp, Instagram, ...) where Google OAuth is blocked.
const IN_APP_PATTERNS: RegExp[] = [
  /WhatsApp/i,
  /Instagram/i,
  /FBAN|FBAV|FB_IAB|FBIOS/,
  /Messenger/i, // also matches MessengerLite / FB Messenger
  /musical_ly|BytedanceWebview|TikTok/i,
  /Telegram/i,
  /LinkedInApp/,
  /Snapchat/i,
  /\bLine\//,
  /;\s*wv\)/, // generic Android WebView
];

export function isInAppBrowser(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return IN_APP_PATTERNS.some((re) => re.test(userAgent));
}
