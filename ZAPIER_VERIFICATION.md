# Zapier Webhook Verification Checklist

## Critical Requirements for File Uploads

### ✅ Check A: Webhook Trigger Type
**STATUS: YOU MUST VERIFY IN ZAPIER**

Your Zapier webhook trigger MUST be:
- ✅ **"Catch Raw Hook"** (NOT "Catch Hook")
- ❌ "Catch Hook" will NOT work for file uploads

**How to check:**
1. Go to your Zap in Zapier
2. Look at the first step (trigger)
3. It should say **"Webhooks by Zapier - Catch Raw Hook"**
4. If it says just "Catch Hook", you need to:
   - Delete the trigger step
   - Add new trigger: "Webhooks by Zapier"
   - Select **"Catch Raw Hook"** (not "Catch Hook")

### ✅ Check B: Request Headers
**STATUS: VERIFIED IN CODE ✅**

Code confirms:
- ✅ Using `form.getHeaders()` (includes Content-Type with boundary)
- ✅ No manual Content-Type override
- ✅ Headers merged correctly: formHeaders first, then X-Session-ID

**Code location:** `app/api/send-to-webhook/route.ts` lines 47-54

**What's being sent:**
```javascript
const formHeaders = form.getHeaders();  // Includes: Content-Type: multipart/form-data; boundary=...
const headers = {
  ...formHeaders,  // Content-Type comes from here
  'X-Session-ID': sessionId
};
```

### ✅ Check C: POST Endpoint URL
**STATUS: VERIFIED ✅**

Current URL: `https://hooks.zapier.com/hooks/catch/25456946/uzp4aen/`

✅ Ends with slash: `/`
✅ Correct format: `https://hooks.zapier.com/hooks/catch/ID/ID/`
✅ Valid URL structure

## Next Steps

1. **VERIFY Check A in Zapier** - Most likely issue
   - Make sure trigger is "Catch Raw Hook"
   
2. **Test again after verification**
   - Upload a file in your app
   - Check Zapier webhook trigger
   - Look for "Data In" - it should show the file

3. **Check Vercel logs**
   - View function logs for `/api/send-to-webhook`
   - Look for "Form headers from getHeaders()" log
   - Should show `Content-Type: multipart/form-data; boundary=...`

## Common Issues

If "Data In" is still empty after fixing Check A:
- Check Vercel logs to see what headers are actually being sent
- Verify the form-data package is properly installed
- Make sure the Buffer is not empty

