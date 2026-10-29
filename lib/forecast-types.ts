// Shared client/server types for the automatic surf forecast (Open-Meteo). No imports, no server code.

/** One hourly row. All numeric fields are null when the upstream has no value for that hour. */
export interface ForecastPoint {
  /** ISO 8601 with the Asia/Jerusalem offset, e.g. "2026-10-29T14:00+02:00". */
  time: string;
  waveHeight: number | null; // m, total significant wave height
  wavePeriod: number | null; // s
  waveDirection: number | null; // deg, direction the waves come FROM (0 = north)
  swellHeight: number | null; // m
  swellPeriod: number | null; // s
  swellDirection: number | null; // deg, FROM
  windWaveHeight: number | null; // m
  windSpeed: number | null; // km/h at 10 m
  windDirection: number | null; // deg, direction the wind blows FROM
  windGusts: number | null; // km/h
  seaTemp: number | null; // deg C
}

export interface ForecastUnits {
  height: "m";
  period: "s";
  direction: "deg";
  speed: "km/h";
  temperature: "C";
}

/** Wind relative to the Israeli coast (which faces west). "calm" = too light to matter. */
export type WindHint = "offshore" | "onshore" | "cross" | "calm";

export interface ForecastSummary {
  /** Always "automatic-forecast": a model estimate, NOT a human report. UI must label it as such. */
  kind: "automatic-forecast";
  /** Ready-to-render Hebrew label: "תחזית אוטומטית (הערכה, לא דיווח גולשים)". */
  label: string;
  waveHeight: number | null;
  wavePeriod: number | null;
  waveDirection: number | null;
  /** Hebrew compass label of where the waves come from, e.g. "מערב", "צפון-מערב". */
  waveDirectionLabel: string | null;
  windSpeed: number | null;
  windDirection: number | null;
  windDirectionLabel: string | null;
  windHint: WindHint | null;
  /** Hebrew: "אופשור" / "אונשור" / "צדדית" / "רוח חלשה". */
  windHintLabel: string | null;
  /** Min/max total wave height over today's (Israel date) hours. */
  todayMinWaveHeight: number | null;
  todayMaxWaveHeight: number | null;
  /** Heuristic 1-5 (null when wave height is unknown). */
  score: 1 | 2 | 3 | 4 | 5 | null;
  /** Hebrew: שטוח / חלש / סביר / טוב / מצוין. */
  scoreLabel: string | null;
}

export interface BeachForecast {
  beachId: number;
  /** When this object was built (ISO, UTC). Upstream data may be up to 30 min older (cache). */
  fetchedAt: string;
  source: "open-meteo";
  units: ForecastUnits;
  /** false => the marine (waves) or weather (wind) API failed; those fields are null. */
  marineAvailable: boolean;
  windAvailable: boolean;
  points: ForecastPoint[];
  /** Hour closest to now (null if the data is more than 3h away from now). */
  now: ForecastPoint | null;
  summary: ForecastSummary;
}

/** JSON error body of /api/forecast/[beachId]. UI shows "תחזית לא זמינה כרגע" for forecast_unavailable. */
export interface ForecastErrorBody {
  error: "forecast_unavailable" | "beach_not_found" | "invalid_beach_id";
}
