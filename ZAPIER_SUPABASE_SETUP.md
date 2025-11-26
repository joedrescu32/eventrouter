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

### Option A: Use Code by Zapier (Recommended - No local server needed)

Use **Code by Zapier** to call Supabase's REST API directly.

#### Setup:

1. **Get Supabase Credentials:**
   - In Supabase dashboard, go to **Settings** → **API**
   - Copy **Project URL**: `https://xxxxx.supabase.co`
   - Copy **anon/public key**: `eyJhbGc...` (the long JWT token)

2. **In Zapier, after ChatGPT step, add "Code by Zapier":**
   - Action: "Run Javascript"
   - Paste this code (replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY`):

```javascript
// Supabase credentials - REPLACE THESE
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Your anon/public key

// Get data from previous steps
const sessionId = inputData.session_id || 'default';
let items = [];

// Parse ChatGPT output (adjust field name based on your ChatGPT step)
const chatgptOutput = inputData.chatgpt_output || inputData.message || inputData.content || inputData.text;

// Try to extract items from ChatGPT response
try {
  const parsed = typeof chatgptOutput === 'string' ? JSON.parse(chatgptOutput) : chatgptOutput;
  
  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (parsed.items && Array.isArray(parsed.items)) {
    items = parsed.items;
  } else if (parsed.data && Array.isArray(parsed.data)) {
    items = parsed.data;
  } else if (typeof parsed === 'object' && parsed !== null) {
    items = [parsed];
  }
} catch (e) {
  // If parsing fails, wrap the output
  items = [chatgptOutput];
}

// Insert into Supabase
const response = await fetch(`${SUPABASE_URL}/rest/v1/parsed_orders`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({
    session_id: sessionId,
    items: items,
    processed: false
  })
});

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Supabase error: ${response.status} - ${errorText}`);
}

return {
  success: true,
  items_count: items.length,
  session_id: sessionId
};
```

3. **Input Data:**
   - `session_id`: `{{session_id}}` (from webhook trigger - the first step)
   - `chatgpt_output`: `{{ChatGPT Output}}` (adjust field name to match your ChatGPT step output)

---

### Option B: Use Local API Route (Requires localtunnel)

Your app has an API route at `/api/zapier-to-supabase` that receives from Zapier and writes to Supabase.

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
3. **Zapier writes to Supabase** → Either via Code step (Option A) or API route (Option B)
4. **App polls Supabase** → Checks for new orders with matching `session_id` every 5 seconds
5. **Modal appears** → User can review and confirm

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
