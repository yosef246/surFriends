-- Allow a quick reaction ("coming" / "on_the_way") without text.
-- A reply must still have text or a quick reaction (or both).
ALTER TABLE public.replies ALTER COLUMN text DROP NOT NULL;

ALTER TABLE public.replies
  ADD CONSTRAINT replies_text_or_reaction
  CHECK (
    (text IS NOT NULL AND length(btrim(text)) > 0)
    OR quick_reaction IS NOT NULL
  );
