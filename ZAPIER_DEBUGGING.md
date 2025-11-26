# Zapier Webhook Debugging Guide

## Common Issues

### Issue 1: Null fields in Zapier output

**Problem:** ChatGPT step returns null for all fields.

**Solution:**
1. Check your ChatGPT prompt - make sure it's asking for the right format
2. Test the ChatGPT step separately in Zapier to see its output
3. Make sure the document/file is being passed correctly to ChatGPT

### Issue 2: POST not received by app

**Problem:** Zapier completes but app never receives the POST request.

**Possible causes:**

1. **Session ID mismatch:**
   - The `session_id` sent from app → Zapier must match the `session_id` sent from Zapier → app
   - Check that your Zapier webhook is sending `session_id` in the Data field

2. **Wrong URL:**
   - Make sure Zapier POST webhook URL is: `https://eventrouter.vercel.app/api/receive-parsed-orders`
   - Check for typos or extra slashes

3. **Data format:**
   - Zapier should send JSON with these fields:
     - `session_id`: The session ID from the original webhook
     - `items`: The ChatGPT output (array of order objects)

## How to Debug

### Step 1: Check Zapier Logs

1. Go to your Zap in Zapier
2. Click on "Task History"
3. Find the recent run
4. Check each step:
   - **Webhook (Catch Hook)**: Should show the incoming data with `session_id`
   - **ChatGPT**: Should show the parsed output
   - **POST webhook**: Should show the response (200 OK means it was sent)

### Step 2: Check Vercel Function Logs

1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments" → Click latest deployment
4. Click "Functions" tab
5. Click on `/api/receive-parsed-orders`
6. Check the logs for:
   - `=== RECEIVE PARSED ORDERS API CALLED ===`
   - `Raw request body:`
   - `Extracted session_id:`
   - `Extracted X items`

### Step 3: Check Browser Console

1. Open your app in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Upload a file and watch for:
   - `[Poll 1/60] Checking for session_id: ...`
   - `[Poll X] Not found yet. Available sessions: [...]`
   - `✅ Received parsed orders from API:`

## Zapier Webhook Configuration Checklist

- [ ] URL: `https://eventrouter.vercel.app/api/receive-parsed-orders`
- [ ] Method: POST
- [ ] Payload Type: Json
- [ ] Data field 1: Key = `session_id`, Value = `{{session_id}}` (from webhook trigger)
- [ ] Data field 2: Key = `items`, Value = `{{ChatGPT Output}}` (or your ChatGPT step field name)

## Testing the Flow

1. **Test file upload:**
   - Upload a file in your app
   - Click "Plan my routes"
   - Check browser console for session_id

2. **Test Zapier receives file:**
   - Check Zapier task history
   - Verify webhook trigger received the file

3. **Test ChatGPT output:**
   - Check ChatGPT step output in Zapier
   - Verify it returns the expected JSON format

4. **Test POST to app:**
   - Check Zapier POST webhook response (should be 200)
   - Check Vercel function logs to see if it was received

5. **Test polling:**
   - Watch browser console for polling attempts
   - Check if session_id matches

## Expected Data Format

Zapier should POST this format:

```json
{
  "session_id": "session-1234567890-abc123",
  "items": [
    {
      "order_id": "ORDER-001",
      "client_name": "John Doe",
      "pickup_datetime": "2024-11-30 10:00",
      "dropoff_datetime": "2024-11-30 18:00",
      "venue_name": "Downtown Event Center",
      "venue_address": "123 Main St",
      "items": ["Table", "Chair", "Linens"],
      "item_quantities": {
        "Table": 10,
        "Chair": 50,
        "Linens": 20
      }
    }
  ]
}
```

## Quick Fixes

**If session_id doesn't match:**
- Make sure you're using `{{session_id}}` from the FIRST step (webhook trigger)
- Not from ChatGPT step or any other step

**If items are null:**
- Check ChatGPT step output field name
- It might be `{{Message}}` or `{{Content}}` instead of `{{ChatGPT Output}}`

**If POST fails:**
- Check URL for typos
- Make sure it's HTTPS (not HTTP)
- Check Vercel function logs for CORS errors

