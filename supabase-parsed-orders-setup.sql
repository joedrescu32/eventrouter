-- Create table for parsed orders from Zapier
CREATE TABLE IF NOT EXISTS parsed_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups by session_id
CREATE INDEX IF NOT EXISTS idx_parsed_orders_session_id ON parsed_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_parsed_orders_processed ON parsed_orders(processed, created_at);

-- Enable Row Level Security
ALTER TABLE parsed_orders ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for Zapier webhook)
CREATE POLICY "Allow public inserts" ON parsed_orders
  FOR INSERT 
  WITH CHECK (true);

-- Allow public reads (for your app to poll)
CREATE POLICY "Allow public reads" ON parsed_orders
  FOR SELECT 
  USING (true);

-- Allow updates to mark as processed
CREATE POLICY "Allow public updates" ON parsed_orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

