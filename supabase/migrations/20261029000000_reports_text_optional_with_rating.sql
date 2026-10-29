-- Text is optional when a wave rating is given (quick 3-tap report).
-- A report must still say something: non-empty text, a rating, or both.
ALTER TABLE public.reports ALTER COLUMN text DROP NOT NULL;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_text_or_rating
  CHECK (
    (text IS NOT NULL AND length(btrim(text)) > 0)
    OR wave_rating IS NOT NULL
  );
