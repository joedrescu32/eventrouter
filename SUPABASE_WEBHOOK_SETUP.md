# Supabase Webhook Setup (Alternative to Vercel)

Instead of using Vercel, you can use Supabase as a middleman:

## How it works:
1. Zapier POSTs parsed orders to Supabase (inserts into a table)
2. Your app polls Supabase for new orders
3. When found, display in modal

## Setup Steps:

### 1. Create a table in Supabase:
```sql
CREATE TABLE parsed_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE parsed_orders ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for Zapier)
CREATE POLICY "Allow public inserts" ON parsed_orders
  FOR INSERT WITH CHECK (true);

-- Allow public reads
CREATE POLICY "Allow public reads" ON parsed_orders
  FOR SELECT USING (true);
```

### 2. Update Zapier to POST to Supabase:
Instead of posting to your API, Zapier should:
- Use "Supabase" action in Zapier
- Insert into `parsed_orders` table
- Include `session_id` and `items` (as JSON)

### 3. Update your app to poll Supabase:
The app already polls `/api/receive-parsed-orders`, but we can change it to poll Supabase directly instead.

## Benefits:
- No need for public URL
- Works completely locally
- Data persists in Supabase
- Easy to debug (check Supabase table)

