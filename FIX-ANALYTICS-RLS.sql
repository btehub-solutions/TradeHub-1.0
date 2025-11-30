-- Fix for daily_listing_stats RLS violation
-- The trigger function needs SECURITY DEFINER to bypass RLS when updating stats

CREATE OR REPLACE FUNCTION trigger_update_favorite_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_listing_id UUID;
  v_change INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_listing_id := NEW.listing_id;
    v_change := 1;
  ELSIF TG_OP = 'DELETE' THEN
    v_listing_id := OLD.listing_id;
    v_change := -1;
  END IF;

  INSERT INTO daily_listing_stats (listing_id, date, favorite_count)
  VALUES (v_listing_id, CURRENT_DATE, GREATEST(0, v_change))
  ON CONFLICT (listing_id, date) 
  DO UPDATE SET favorite_count = GREATEST(0, daily_listing_stats.favorite_count + v_change);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Added SECURITY DEFINER
