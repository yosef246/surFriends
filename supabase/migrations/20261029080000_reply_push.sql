-- Day 13: push to the report owner on reactions / replies. Cooldown per (owner, report) via push_log.
ALTER TABLE public.push_log
  ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE;

ALTER TABLE public.push_log DROP CONSTRAINT IF EXISTS push_log_kind_check;
ALTER TABLE public.push_log
  ADD CONSTRAINT push_log_kind_check CHECK (kind IN ('report', 'test', 'reply'));

-- Existing beach cooldown queries filter kind = 'report' (report_id stays NULL there); reply rows never match them.
CREATE INDEX IF NOT EXISTS idx_push_log_reply_cooldown ON public.push_log (user_id, report_id, sent_at DESC);
