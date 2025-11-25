# Testing OpenAI API Connection

## Quick Test Methods

### Method 1: Browser Test (Easiest)

1. **Start your dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:3000/api/test-openai
   ```

3. **Check the response**:
   - ✅ **Success**: You'll see JSON with `"success": true` and a message
   - ❌ **Error**: You'll see an error message explaining what's wrong

### Method 2: Terminal Test (More Detailed)

1. **Run this command**:
   ```bash
   curl http://localhost:3000/api/test-openai
   ```

   Or if you prefer a formatted response:
   ```bash
   curl http://localhost:3000/api/test-openai | python -m json.tool
   ```

### Method 3: Browser Console Test

1. **Open your browser** (on your app page)
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Run this command**:
   ```javascript
   fetch('/api/test-openai')
     .then(r => r.json())
     .then(data => console.log('OpenAI Test:', data))
     .catch(err => console.error('Error:', err));
   ```

## Expected Results

### ✅ Success Response:
```json
{
  "success": true,
  "message": "OpenAI API is working!",
  "response": "OpenAI API is working correctly",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 8,
    "total_tokens": 38
  }
}
```

### ❌ Common Errors:

1. **"OpenAI API key not configured"**
   - Fix: Add `OPENAI_API_KEY=sk-your-key` to `.env.local`
   - Restart dev server

2. **"Invalid API key"**
   - Fix: Check that your API key is correct
   - Make sure it starts with `sk-`

3. **"Insufficient quota"**
   - Fix: Add payment method at https://platform.openai.com/account/billing

4. **"Rate limit exceeded"**
   - Fix: Wait a moment and try again
   - Check your usage at https://platform.openai.com/usage

## What This Test Does

- ✅ Checks if `OPENAI_API_KEY` is set
- ✅ Creates OpenAI client
- ✅ Makes a simple API call to GPT-4o
- ✅ Returns the response
- ✅ Shows token usage

## Next Steps

Once this test passes:
1. ✅ OpenAI API is configured correctly
2. ✅ You can proceed with document parsing
3. ✅ The parsing feature should work

If it fails, fix the error and test again before moving forward.

