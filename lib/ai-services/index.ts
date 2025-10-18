import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';
import FormData from 'form-data';
import { generateWithWanAI, WAN_AI_CAPABILITIES } from './wan-ai';
import { supabase } from '@/lib/supabase';

// AI Model Types
export type AIModel = 'imagen' | 'gemini' | 'grok' | 'veo' | 'nano_banana' | 'gemini_chat' | 
  'wan_text_to_image' | 'wan_text_to_video' | 'wan_image_to_video' | 'wan_photo_to_drawing' | 
  'wan_cartoon_avatar' | 'wan_virtual_model' | 'wan_image_to_image' | 'wan_video_super_res';

// Export Wan AI capabilities
export { WAN_AI_CAPABILITIES } from './wan-ai';

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
    imageUrl?: string;  // For Wan AI image-based operations
    editType?: string;  // For Wan AI edit operations
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
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.');
    }

    // Use the latest Gemini 1.5 Flash model for better performance
    const model = geminiClient.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
    
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
    console.error('Gemini Chat error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate response from Gemini',
      model: 'gemini_chat',
      creditsUsed: 0
    };
  }
}

// Nano Banana (Gemini Native Image - Creative/Artistic)
export async function generateWithNanoBanana(prompt: string, options?: any): Promise<AIGenerationResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.');
    }

    // Build the parts array starting with the prompt
    const parts: any[] = [];

    // If there's an input image, add it FIRST (before text) for proper editing
    if (options?.inputImage) {
      // Remove the data:image/jpeg;base64, prefix if it exists
      const base64Data = options.inputImage.includes('base64,')
        ? options.inputImage.split('base64,')[1]
        : options.inputImage;

      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }

    // Add the text prompt (with system instructions if provided)
    const userPrompt = options?.systemInstructions
      ? `${options.systemInstructions}\n\n${prompt}`
      : prompt;

    parts.push({
      text: userPrompt
    });

    // Build generation config according to official docs
    const generationConfig: any = {
      temperature: options?.temperature ?? 0.7,
      topP: options?.topP ?? 0.95,
      candidateCount: 1
    };

    // Response modalities - controls whether to output IMAGE, TEXT, or both
    if (options?.responseModalities && Array.isArray(options.responseModalities)) {
      generationConfig.responseModalities = options.responseModalities;
    } else {
      generationConfig.responseModalities = ['IMAGE', 'TEXT'];
    }

    // Add optional parameters if provided
    if (options?.maxOutputTokens && typeof options.maxOutputTokens === 'number') {
      generationConfig.maxOutputTokens = options.maxOutputTokens;
    }

    if (options?.stopSequences && Array.isArray(options.stopSequences)) {
      generationConfig.stopSequences = options.stopSequences;
    }

    // Add image config for aspect ratio if provided
    if (options?.aspectRatio) {
      generationConfig.imageConfig = {
        aspectRatio: options.aspectRatio
      };
    }

    // Build the request body according to official API structure
    const requestBody = {
      contents: [{
        role: 'user',
        parts: parts
      }],
      generationConfig: generationConfig
    };

    console.log('Nano Banana Request:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      }
    );

    console.log('Nano Banana Response Status:', response.status);

    // Extract image and text from response
    const candidates = response.data.candidates;
    if (candidates && candidates[0]?.content?.parts && Array.isArray(candidates[0].content.parts)) {
      const parts = candidates[0].content.parts;

      // Find image and text parts
      const imagePart = parts.find((p: any) => p.inlineData);
      const textPart = parts.find((p: any) => p.text);

      if (imagePart?.inlineData?.data) {
        return {
          success: true,
          data: {
            base64: imagePart.inlineData.data,
            text: textPart?.text || '',
            revisedPrompt: textPart?.text || prompt
          },
          model: 'nano_banana',
          creditsUsed: 1
        };
      }
    }

    // Check for error in response
    if (response.data.error) {
      throw new Error(response.data.error.message || 'Generation failed');
    }

    throw new Error('No image data in response. The model may have blocked the request or returned no content.');
  } catch (error: any) {
    console.error('Nano Banana error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    let errorMessage = 'Failed to generate image';

    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Provide helpful error messages
    if (errorMessage.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY environment variable.';
    } else if (errorMessage.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later or upgrade your plan.';
    } else if (errorMessage.includes('blocked')) {
      errorMessage = 'Content was blocked by safety filters. Try rephrasing your prompt.';
    }

    return {
      success: false,
      error: errorMessage,
      model: 'nano_banana',
      creditsUsed: 0
    };
  }
}

// Imagen (Google's Photorealistic Image Generation)
export async function generateWithImagen(prompt: string, options?: any): Promise<AIGenerationResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Enhance prompt for photorealistic style
    const enhancedPrompt = `Photorealistic, professional photography: ${prompt}. High quality, sharp details, natural lighting.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3:generateImages?key=${process.env.GEMINI_API_KEY}`,
      {
        prompt: enhancedPrompt,
        imageCount: options?.numberOfImages || 1,
        aspectRatio: options?.aspectRatio || '1:1',
        negativePrompt: options?.negativePrompt || 'blurry, low quality, distorted',
        personGeneration: 'allow_all',
        safetyFilterLevel: 'block_some',
        language: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json'
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
  // Handle Wan AI models
  if (request.model.startsWith('wan_')) {
    return generateWithWanAI(request.model, {
      prompt: request.prompt,
      imageUrl: request.options?.imageUrl,
      editType: request.options?.editType
    }, request.options);
  }

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

// Save base64 image to Supabase Storage
export async function saveBase64Image(base64Data: string, filename: string): Promise<string> {
  try {
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const { data, error } = await (supabase as any).storage
      .from('ai-generations')
      .upload(`generated/${filename}`, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = (supabase as any).storage
      .from('ai-generations')
      .getPublicUrl(`generated/${filename}`);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Error saving image to storage:', error);
    throw new Error(`Failed to save generated image: ${error.message}`);
  }
}

// Convert URL to base64
export async function urlToBase64(url: string): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
}