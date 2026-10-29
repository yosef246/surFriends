-- Realtime DELETE events on replies must carry report_id + quick_reaction so the feed can
-- decrement the right card's counts. (reports DELETE only needs the primary key.)
ALTER TABLE public.replies REPLICA IDENTITY FULL;
