-- One quick reaction of each kind per user per report ("coming" / "on_the_way").
-- Plain text replies (quick_reaction IS NULL) are unaffected.
CREATE UNIQUE INDEX replies_one_reaction_per_user
  ON public.replies (report_id, user_id, quick_reaction)
  WHERE quick_reaction IS NOT NULL;
