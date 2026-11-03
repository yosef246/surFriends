-- surFriends night lockout: no new reports / replies / reactions between sunset and sunrise (Israel).
-- Run manually in the SQL Editor of the hosted project. Safe to re-run (idempotent).
--
-- Method: NOAA solar-position / sunrise equation, zenith 90.833 degrees, reference point Tel Aviv
-- (32.08 N, 34.78 E). Mirrors lib/daylight.ts (keep both in sync, including the buffer). Accurate to ~1 minute.
-- The Israel calendar day comes from `AT TIME ZONE 'Asia/Jerusalem'`, so DST needs no hardcoded offsets.
-- Like the rate limits, the rule only applies to signed-in clients (auth.uid() IS NOT NULL):
-- the SQL Editor / service role stay exempt.
-- Error text 'night_closed' is mapped to a Hebrew message by app/actions/{reports,replies}.ts.
-- Storage uploads are deliberately NOT blocked: a report cannot be created at night, orphan files are cleaned by the TTL job.

CREATE OR REPLACE FUNCTION public.is_night_israel(ts timestamptz DEFAULT pg_catalog.now())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  lat   CONSTANT double precision := 32.08;
  lon   CONSTANT double precision := 34.78;
  zen   CONSTANT double precision := 90.833;
  buffer_min CONSTANT double precision := 0;     -- minutes to close BEFORE sunset (lib/daylight.ts SAFETY_BUFFER_MIN)
  local_date date := (ts AT TIME ZONE 'Asia/Jerusalem')::date;
  t     double precision;
  l0    double precision;
  m     double precision;
  e     double precision;
  c     double precision;
  omega double precision;
  lam   double precision;
  eps   double precision;
  decl  double precision;
  y     double precision;
  eqt   double precision;
  cos_ha double precision;
  ha    double precision;
  noon  double precision;
  day0  timestamptz;
  sunrise timestamptz;
  sunset  timestamptz;
BEGIN
  -- Julian centuries from J2000.0 at 12:00 UTC of the local calendar date.
  t := (local_date - DATE '2000-01-01')::double precision / 36525.0;
  l0 := 280.46646 + t * (36000.76983 + t * 0.0003032);
  l0 := l0 - 360.0 * pg_catalog.floor(l0 / 360.0);
  m := 357.52911 + t * (35999.05029 - 0.0001537 * t);
  e := 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  c := pg_catalog.sind(m) * (1.914602 - t * (0.004817 + 0.000014 * t))
     + pg_catalog.sind(2 * m) * (0.019993 - 0.000101 * t)
     + pg_catalog.sind(3 * m) * 0.000289;
  omega := 125.04 - 1934.136 * t;
  lam := l0 + c - 0.00569 - 0.00478 * pg_catalog.sind(omega);
  eps := 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60.0) / 60.0
         + 0.00256 * pg_catalog.cosd(omega);
  decl := pg_catalog.asind(pg_catalog.sind(eps) * pg_catalog.sind(lam));
  y := pg_catalog.power(pg_catalog.tand(eps / 2.0), 2);
  eqt := 4 * pg_catalog.degrees(
           y * pg_catalog.sind(2 * l0)
           - 2 * e * pg_catalog.sind(m)
           + 4 * e * y * pg_catalog.sind(m) * pg_catalog.cosd(2 * l0)
           - 0.5 * y * y * pg_catalog.sind(4 * l0)
           - 1.25 * e * e * pg_catalog.sind(2 * m));
  cos_ha := pg_catalog.cosd(zen) / (pg_catalog.cosd(lat) * pg_catalog.cosd(decl))
            - pg_catalog.tand(lat) * pg_catalog.tand(decl);
  ha := pg_catalog.acosd(LEAST(1.0, GREATEST(-1.0, cos_ha)));
  noon := 720 - 4 * lon - eqt;                       -- minutes after 00:00 UTC of local_date

  day0 := (local_date::timestamp) AT TIME ZONE 'UTC';
  sunrise := day0 + pg_catalog.make_interval(secs => (noon - 4 * ha) * 60);
  sunset  := day0 + pg_catalog.make_interval(secs => (noon + 4 * ha - buffer_min) * 60);
  RETURN ts < sunrise OR ts >= sunset;
END;
$$;

REVOKE ALL ON FUNCTION public.is_night_israel(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_night_israel(timestamptz) TO authenticated, service_role;

-- Same bodies as 20261029010000_day7_hardening.sql plus the night check.
CREATE OR REPLACE FUNCTION public.guard_report_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF public.is_night_israel(pg_catalog.now()) THEN
      RAISE EXCEPTION 'night_closed' USING ERRCODE = 'P0001';
    END IF;
    NEW.created_at := pg_catalog.now();
    IF (SELECT pg_catalog.count(*) FROM public.reports r
        WHERE r.user_id = NEW.user_id
          AND r.created_at > pg_catalog.now() - INTERVAL '1 hour') >= 10 THEN
      RAISE EXCEPTION 'rate_limit_reports' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_reply_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF public.is_night_israel(pg_catalog.now()) THEN
      RAISE EXCEPTION 'night_closed' USING ERRCODE = 'P0001';
    END IF;
    NEW.created_at := pg_catalog.now();
    IF (SELECT pg_catalog.count(*) FROM public.replies r
        WHERE r.user_id = NEW.user_id
          AND r.created_at > pg_catalog.now() - INTERVAL '1 hour') >= 30 THEN
      RAISE EXCEPTION 'rate_limit_replies' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_report_insert() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.guard_reply_insert() FROM PUBLIC, anon;
