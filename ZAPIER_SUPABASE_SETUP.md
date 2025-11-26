# Zapier + Supabase Setup Instructions

## Step 1: Create the Supabase Table

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase-parsed-orders-setup.sql`
5. Click **Run** to execute the SQL

This creates:
- `parsed_orders` table to store results from Zapier
- Proper indexes for fast lookups
- RLS policies to allow public inserts/reads

## Step 2: Choose Your Approach

Since Zapier doesn't have a native Supabase integration, you have **two options**:

---

### Option A: Use Webhooks by Zapier (Recommended - Simplest!)

Use **Webhooks by Zapier** to call your Vercel app API. No code needed!

#### Setup:

1. **In Zapier, after ChatGPT step, add "Webhooks by Zapier":**
   - Action: **"POST"**
   - URL: `https://eventrouter.vercel.app/api/receive-parsed-orders`
   - Method: **POST**
   - Data Pass-Through: **No**

2. **Configure the Data (JSON):**

   Click "Continue" and set up the JSON payload. You can either:

   **Option A: Use JSON format (Recommended)**
   ```json
   {
     "session_id": "{{session_id}}",
     "items": {{ChatGPT Output}}
   }
   ```
   
   **Option B: Use individual fields**
   - `session_id`: `{{session_id}}` (from webhook trigger - first step)
   - `items`: `{{ChatGPT Output}}` (or whatever field name your ChatGPT step uses)
   - `chatgpt_output`: `{{ChatGPT Output}}` (as backup if items format is different)

3. **Headers (Optional - usually not needed):**
   - `Content-Type`: `application/json`

**Note:** Your Vercel app automatically handles:
- Parsing ChatGPT output in various formats
- Extracting items from the response
- Supabase connection and insertion

No code, no Supabase credentials needed in Zapier!

---

### Option B: Use Local API Route (Development only - Requires localtunnel)

For local development, your app has an API route at `/api/zapier-to-supabase` that receives from Zapier and writes to Supabase.

#### Setup:

1. **Start your local server:**
   ```bash
   npm run dev
   ```

2. **Expose it with localtunnel:**
   ```bash
   npx localtunnel --port 3000
   ```
   Copy the URL it gives you (e.g., `https://xxxxx.loca.lt`)

3. **In Zapier, after ChatGPT step, add "Webhooks by Zapier":**
   - Action: "POST"
   - URL: `https://xxxxx.loca.lt/api/zapier-to-supabase`
   - Method: POST
   - Data (JSON):
     ```json
     {
       "session_id": "{{session_id}}",
       "items": {{ChatGPT Output}}
     }
     ```
   - Or use individual fields:
     - `session_id`: `{{session_id}}`
     - `items`: `{{ChatGPT Output}}` (or whatever field has the parsed data)

---

## Step 3: Test It

1. Upload a file in your app
2. Click "Plan my routes"
3. Wait for Zapier to process
4. Your app will automatically poll Supabase and show the results in the modal

## How It Works:

1. **User uploads file** → App sends to Zapier webhook with `session_id`
2. **Zapier processes** → ChatGPT parses the file
3. **Zapier calls Vercel API** → Code step sends data to `https://eventrouter.vercel.app/api/zapier-to-supabase`
4. **Your app writes to Supabase** → API route handles Supabase connection automatically
5. **App polls Supabase** → Checks for new orders with matching `session_id` every 5 seconds
6. **Modal appears** → User can review and confirm

## Troubleshooting:

- **No results appearing?** 
  - Check Supabase `parsed_orders` table to see if data was inserted
  - Check browser console for polling errors
  
- **Wrong session_id?** 
  - Make sure Zapier passes the `session_id` from the webhook trigger (first step)
  - Check that `session_id` is being sent in the initial webhook call
  
- **Items format wrong?** 
  - Check that ChatGPT output is valid JSON
  - The code handles various formats, but verify in Supabase table

- **Code step errors?**
  - Make sure you replaced `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with actual values
  - Check that the field names match your ChatGPT step output
