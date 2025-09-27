import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// AI Model Types
export type AIModel = 'imagen' | 'gemini' | 'grok' | 'veo' | 'nano_banana' | 'gemini_chat';

export interface AIGenerationRequest {
  model: AIModel;
  prompt: string;
  userId: string;
  options?: {
    numberOfImages?: number;
    aspectRatio?: string;
    imageSize?: string;
    duration?: number;
    responseFormat?: 'url' | 'b64_json';
  };
}

export interface AIGenerationResponse {
  success: boolean;
  data?: {
    url?: string;
    urls?: string[];
    base64?: string;
    revisedPrompt?: string;
    text?: string;
  };
  error?: string;
  model: AIModel;
  creditsUsed: number;
}

// Initialize AI clients
const geminiClient = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Gemini Chat
export async function generateWithGeminiChat(prompt: string): Promise<AIGenerationResponse> {
  try {
    if (!geminiClient) {
      throw new Error('Gemini API key not configured');
    }

    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: { text },
      model: 'gemini_chat',
      creditsUsed: 1
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      model: 'gemini_chat',
      creditsUsed: 0
    };
  }
}

// Nano Banana (Gemini 2.5 Flash Image)
export async function generateWithNanoBanana(prompt: string): Promise<AIGenerationResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract image data from response
    const candidates = response.data.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      const imagePart = candidates[0].content.parts.find((p: any) => p.inlineData);
      const textPart = candidates[0].content.parts.find((p: any) => p.text);
      
      if (imagePart?.inlineData) {
        return {
          success: true,
          data: {
            base64: imagePart.inlineData.data,
            revisedPrompt: textPart?.text || prompt
          },
          model: 'nano_banana',
          creditsUsed: 1
        };
      }
    }

    throw new Error('No image generated');
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      model: 'nano_banana',
      creditsUsed: 0
    };
  }
}

// Imagen (Google's Imagen API)
export async function generateWithImagen(prompt: string, options?: any): Promise<AIGenerationResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages?key=${process.env.GEMINI_API_KEY}`,
      {
        prompt,
        config: {
          numberOfImages: options?.numberOfImages || 1,
          outputMimeType: 'image/jpeg',
          personGeneration: 'ALLOW_ALL',
          aspectRatio: options?.aspectRatio || '1:1',
          imageSize: '1K'
        }
      }
    );

    const images = response.data.generatedImages;
    if (images && images.length > 0) {
      const urls = images.map((img: any) => img.image?.uri).filter(Boolean);
      return {
        success: true,
        data: {
          urls,
          url: urls[0]
        },
        model: 'imagen',
        creditsUsed: images.length
      };
    }

    throw new Error('No images generated');
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      model: 'imagen',
      creditsUsed: 0
    };
  }
}

// Veo (Google's Video Generation)
export async function generateWithVeo(prompt: string, options?: any): Promise<AIGenerationResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Start video generation
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:generateVideos?key=${process.env.GEMINI_API_KEY}`,
      {
        prompt,
        config: {
          aspectRatio: options?.aspectRatio || '16:9',
          numberOfVideos: 1,
          durationSeconds: options?.duration || 8,
          personGeneration: 'ALLOW_ALL'
        }
      }
    );

    // Poll for completion
    const operationName = response.data.name;
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${process.env.GEMINI_API_KEY}`
      );

      if (statusResponse.data.done) {
        const videos = statusResponse.data.result?.generatedVideos;
        if (videos && videos.length > 0) {
          return {
            success: true,
            data: {
              url: videos[0].video?.uri
            },
            model: 'veo',
            creditsUsed: 5 // Videos cost more credits
          };
        }
        break;
      }
      attempts++;
    }

    throw new Error('Video generation timed out');
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      model: 'veo',
      creditsUsed: 0
    };
  }
}

// Grok (xAI Image Generation)
export async function generateWithGrok(prompt: string, options?: any): Promise<AIGenerationResponse> {
  try {
    if (!process.env.XAI_API_KEY) {
      throw new Error('xAI API key not configured');
    }

    const response = await axios.post(
      'https://api.x.ai/v1/images/generations',
      {
        model: 'grok-2-image',
        prompt,
        n: options?.numberOfImages || 1,
        response_format: options?.responseFormat || 'url'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const images = response.data.data;
    if (images && images.length > 0) {
      if (options?.responseFormat === 'b64_json') {
        return {
          success: true,
          data: {
            base64: images[0].b64_json,
            revisedPrompt: images[0].revised_prompt
          },
          model: 'grok',
          creditsUsed: images.length
        };
      } else {
        const urls = images.map((img: any) => img.url);
        return {
          success: true,
          data: {
            urls,
            url: urls[0],
            revisedPrompt: images[0].revised_prompt
          },
          model: 'grok',
          creditsUsed: images.length
        };
      }
    }

    throw new Error('No images generated');
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      model: 'grok',
      creditsUsed: 0
    };
  }
}

// Main generation function
export async function generateAIContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  switch (request.model) {
    case 'gemini_chat':
      return generateWithGeminiChat(request.prompt);
    case 'nano_banana':
      return generateWithNanoBanana(request.prompt);
    case 'imagen':
      return generateWithImagen(request.prompt, request.options);
    case 'veo':
      return generateWithVeo(request.prompt, request.options);
    case 'grok':
      return generateWithGrok(request.prompt, request.options);
    default:
      return {
        success: false,
        error: `Unsupported model: ${request.model}`,
        model: request.model,
        creditsUsed: 0
      };
  }
}

// Save base64 image to file
export async function saveBase64Image(base64Data: string, filename: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');
  const filepath = path.join(process.cwd(), 'public', 'generated', filename);
  
  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, buffer);
  return `/generated/${filename}`;
}

// Convert URL to base64
export async function urlToBase64(url: string): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
}