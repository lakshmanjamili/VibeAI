# 🚀 Gemini API Setup Guide

## Quick Start

### 1. Get Your API Key

Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your free Gemini API key.

### 2. Add to Environment Variables

Create or update your `.env.local` file:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Restart the Development Server

```bash
npm run dev
```

### 4. Test Your Integration

Visit [http://localhost:3000/test-gemini](http://localhost:3000/test-gemini) to test both:

- **Gemini Chat**: Conversational AI
- **Nano Banana**: Creative image generation (placeholder until image API is available)

## Features Ready for Gemini

### ✅ Gemini Chat (Working)

- Located in AI Studio under "Chat" tab
- Uses Gemini 1.5 Flash model
- Supports multi-turn conversations
- Templates available in the Templates tab

### ✅ Nano Banana (Placeholder Ready)

- Creative image generation
- Currently returns creative descriptions
- Will generate actual images when API is available

### ⏳ Coming Soon

- **Imagen 4.0**: Photorealistic images (API pending)
- **Veo 2.0**: Text-to-video generation (API pending)

## API Endpoints

### Chat Endpoint

```javascript
POST /api/ai/chat
{
  "message": "Your message here",
  "conversationId": "optional-conversation-id"
}
```

### Generation Endpoint

```javascript
POST /api/ai/generate
{
  "model": "nano_banana",
  "prompt": "Your creative prompt",
  "options": {
    "numberOfImages": 1
  }
}
```

## Troubleshooting

### "Gemini API key not configured"

- Make sure you've added `GEMINI_API_KEY` to `.env.local`
- Restart your development server after adding the key

### Rate Limiting

- Free tier has rate limits
- Check your usage at [Google AI Studio](https://makersuite.google.com)

### CORS Issues

- API calls are made from the server-side only
- No CORS issues should occur

## Test Templates

### For Gemini Chat:

- "Write a haiku about programming"
- "Explain quantum computing to a 5-year-old"
- "Create a recipe using only 5 ingredients"

### For Nano Banana:

- "A magical forest with glowing mushrooms"
- "Cute robot learning to paint"
- "Steampunk coffee shop in the clouds"

## Security Notes

- Never commit your API key to version control
- Keep `.env.local` in your `.gitignore`
- Use environment variables only on the server side

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the terminal for server-side errors
3. Verify your API key is valid
4. Ensure you have available quota

---

Ready to go! Add your GEMINI_API_KEY and start creating with AI! 🎨✨
