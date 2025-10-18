# Nano Banana (Gemini Native Image) Documentation

## Overview

Nano Banana uses Google's Gemini Native Image capability - a conversational image generation model that's part of the Gemini family.

## Key Features

- **Conversational Editing**: Can understand context and iterate on images
- **Multi-Image Composition**: Combine multiple images with text prompts
- **Style Transfer**: Apply artistic styles to images
- **Contextual Understanding**: Remembers previous interactions

## Model Details

- **Model Name**: `gemini-2.0-flash-exp` (for image generation)
- **Pricing**: $30 per 1 million tokens
- **Status**: Preview (production usage allowed)

## Capabilities

### 1. Text-to-Image Generation

Generate creative, artistic images from text descriptions.

```javascript
const prompt =
  'A whimsical cartoon cat wearing a wizard hat, sitting on a magical book with sparkles around, in a cozy library setting';
```

### 2. Conversational Image Editing

```javascript
// First request
'Create a sunset landscape with mountains';
// Follow-up request
'Add a small cabin with warm lights in the foreground';
// Another iteration
'Make the sky more purple and add stars';
```

### 3. Multi-Image Composition

Combine multiple images with instructions:

```javascript
'Combine these three images: place the cat from image 1 on the mountain from image 2, with the sunset colors from image 3';
```

## Best Practices

### Prompt Engineering

1. **Be Specific About Style**:
   - "cartoon style with soft pastel colors"
   - "photorealistic with dramatic lighting"
   - "watercolor painting effect"

2. **Describe Composition**:
   - "centered composition with rule of thirds"
   - "close-up portrait filling the frame"
   - "wide landscape shot from aerial view"

3. **Include Mood and Atmosphere**:
   - "cheerful and bright atmosphere"
   - "mysterious and foggy environment"
   - "energetic with motion blur"

## Example Prompts

### Artistic/Creative (Nano Banana's Strength)

```
"A dreamlike forest where the trees have glowing neon leaves in shades of purple and blue, with floating geometric shapes scattered throughout, rendered in a Studio Ghibli animation style"
```

### Character Design

```
"A friendly robot chef with a round body made of copper pots, wearing a tall chef's hat, four articulated arms each holding different cooking utensils, LED eyes showing a happy expression, in a Pixar-style 3D rendering"
```

### Abstract Concepts

```
"Visualize the concept of 'digital consciousness' as an abstract composition with flowing data streams forming a brain shape, binary code transforming into butterflies, cyberpunk color palette"
```

## API Implementation

### Request Structure

```javascript
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        temperature: 0.9, // Higher for more creative
        topP: 0.95,
      },
    }),
  }
);
```

## Differences from Imagen

| Feature    | Nano Banana (Gemini Native)    | Imagen                       |
| ---------- | ------------------------------ | ---------------------------- |
| Best For   | Creative, artistic, conceptual | Photorealistic, professional |
| Style      | Flexible, experimental         | Realistic, accurate          |
| Editing    | Conversational, iterative      | Single-shot generation       |
| Context    | Maintains conversation history | Stateless                    |
| Typography | Good for artistic text         | Excellent for clear text     |
| Speed      | Moderate                       | Fast                         |
| Price      | $30/1M tokens                  | $0.02-0.12/image             |

## When to Use Nano Banana

 **Use Nano Banana for:**

- Creative and artistic projects
- Iterative design processes
- Abstract concepts and ideas
- Stylized illustrations
- Character designs
- Fantasy and sci-fi art
- When you need conversational editing

L **Use Imagen Instead for:**

- Photorealistic product shots
- Professional photography style
- Clear text and typography
- Marketing materials
- E-commerce images
- When you need fast, one-shot generation

## Rate Limits

- Requests per minute: 60
- Requests per day: 1,500
- Concurrent requests: 10

## Notes

- All generated images include an invisible SynthID watermark
- Best performance with English prompts
- Images are generated at various aspect ratios (1:1, 16:9, 9:16, etc.)
