import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { generateAIContent, saveBase64Image, AIModel } from '@/lib/ai-services';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const sessionId = request.headers.get('x-session-id');

    // Allow both authenticated and anonymous users
    const userIdentifier = userId || sessionId || 'anonymous';

    const body = await request.json();
    const { model, prompt, options } = body;

    if (!model || !prompt) {
      return NextResponse.json({ error: 'Model and prompt are required' }, { status: 400 });
    }

    // Map model to credit field name
    const modelCreditMap: Record<string, string> = {
      nano_banana: 'nano_banana',
      imagen: 'imagen',
      grok: 'grok',
      veo: 'veo',
      gemini_chat: 'gemini',
    };

    const creditField = modelCreditMap[model] || model;

    // Check user credits
    let { data: credits } = await (supabase as any)
      .from('user_ai_credits')
      .select('*')
      .eq('user_id', userIdentifier)
      .single();

    if (!credits) {
      // Create default credits for new user
      const { data } = await (supabase as any)
        .from('user_ai_credits')
        .insert({
          user_id: userIdentifier,
          imagen_used: 0,
          imagen_limit: 10,
          gemini_used: 0,
          gemini_limit: 50,
          grok_used: 0,
          grok_limit: 5,
          veo_used: 0,
          veo_limit: 2,
          nano_banana_used: 0,
          nano_banana_limit: 10,
          chat_messages_used: 0,
          chat_messages_limit: 100,
        })
        .select()
        .single();
      credits = data;
    }

    const usedField = `${creditField}_used`;
    const limitField = `${creditField}_limit`;
    const used = credits?.[usedField] || 0;
    const limit = credits?.[limitField] || 0;

    if (used >= limit) {
      return NextResponse.json(
        { error: `Insufficient ${creditField} credits. You have used ${used}/${limit}.` },
        { status: 403 }
      );
    }

    // Track generation start
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate content
    const startTime = Date.now();
    const result = await generateAIContent({
      model: model as AIModel,
      prompt,
      userId: userIdentifier,
      options,
    });
    const generationTime = Date.now() - startTime;

    // Save base64 images if needed
    let savedUrls: string[] = [];
    if (result.success && result.data?.base64) {
      const filename = `${generationId}_${Date.now()}.jpg`;
      const localUrl = await saveBase64Image(result.data.base64, filename);
      savedUrls = [localUrl];
    } else if (result.data?.urls) {
      savedUrls = result.data.urls;
    } else if (result.data?.url) {
      savedUrls = [result.data.url];
    }

    // Deduct credits if generation was successful
    if (result.success) {
      await (supabase as any)
        .from('user_ai_credits')
        .update({ [usedField]: used + 1 })
        .eq('user_id', userIdentifier);
    }

    return NextResponse.json({
      success: result.success,
      generationId: generationId,
      data: {
        ...result.data,
        urls: savedUrls,
      },
      creditsUsed: result.creditsUsed,
      error: result.error,
    });
  } catch (error: any) {
    console.error('AI Generation error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}

// Get user's generation history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const sessionId = request.headers.get('x-session-id');
    const userIdentifier = userId || sessionId || 'anonymous';

    const { data, error } = await (supabase as any)
      .from('ai_generation_usage')
      .select('*')
      .eq('user_id', userIdentifier)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ generations: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
