-- Enable pg_trgm if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add classification columns
ALTER TABLE resources ADD COLUMN IF NOT EXISTS classification_method TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS classification_score REAL;

-- Function: auto-update search_vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: fire BEFORE INSERT OR UPDATE
DROP TRIGGER IF EXISTS trg_update_search_vector ON resources;
CREATE TRIGGER trg_update_search_vector
  BEFORE INSERT OR UPDATE OF title, description, tags
  ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();