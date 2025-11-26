# Zapier Webhook Step - Call Your Vercel App

Use a **Webhooks by Zapier** step (after ChatGPT step) to send results to your Vercel app. This is simpler than using Code by Zapier!

## Setup Instructions

1. **In Zapier, after your ChatGPT step, add "Webhooks by Zapier":**
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

## Alternative: If ChatGPT Output Needs Parsing

If your ChatGPT step returns a string that needs to be parsed, you can use a **Code by Zapier** step first to parse it, then use the Webhook step. But the API route handles various formats automatically, so this is usually not needed.

## How It Works

1. **Receives data from ChatGPT step** - Gets the parsed output
2. **Webhook sends to Vercel** - POSTs data to `https://eventrouter.vercel.app/api/zapier-to-supabase`
3. **Your app handles everything** - The API route:
   - Parses the ChatGPT output in various formats
   - Extracts items from the response
   - Inserts into Supabase automatically
4. **Returns success** - Confirms the data was sent

## Benefits

- ✅ Simpler code (no Supabase credentials needed)
- ✅ Single source of truth (all Supabase logic in your app)
- ✅ Easier to debug (check Vercel function logs)
- ✅ Can add additional processing in your app if needed

## Testing

After adding this step:
1. Test your Zap in Zapier
2. Check Vercel function logs: Project → Deployments → Click deployment → View Function Logs
3. Check Supabase `parsed_orders` table to verify data was inserted
4. Your app should automatically show results in the modal

