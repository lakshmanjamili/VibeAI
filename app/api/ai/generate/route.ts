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
      return NextResponse.json(
        { error: 'Model and prompt are required' },
        { status: 400 }
      );
    }

    // Check user credits
    const { data: hasCredits } = await (supabase as any).rpc('check_user_ai_credits', {
      p_user_id: userIdentifier,
      p_model: model
    });

    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits for this model' },
        { status: 403 }
      );
    }

    // Track generation start
    const { data: generation } = await (supabase as any)
      .from('ai_generation_usage')
      .insert({
        user_id: userIdentifier,
        model,
        prompt,
        status: 'processing'
      })
      .select()
      .single();

    // Generate content
    const startTime = Date.now();
    const result = await generateAIContent({
      model: model as AIModel,
      prompt,
      userId: userIdentifier,
      options
    });
    const generationTime = Date.now() - startTime;

    // Save base64 images if needed
    let savedUrls: string[] = [];
    if (result.success && result.data?.base64) {
      const filename = `${generation.id}_${Date.now()}.jpg`;
      const localUrl = await saveBase64Image(result.data.base64, filename);
      savedUrls = [localUrl];
    } else if (result.data?.urls) {
      savedUrls = result.data.urls;
    } else if (result.data?.url) {
      savedUrls = [result.data.url];
    }

    // Update generation record
    await (supabase as any)
      .from('ai_generation_usage')
      .update({
        status: result.success ? 'completed' : 'failed',
        result_url: savedUrls[0] || null,
        result_data: {
          urls: savedUrls,
          text: result.data?.text,
          revisedPrompt: result.data?.revisedPrompt
        },
        error_message: result.error,
        generation_time_ms: generationTime,
        credits_used: result.creditsUsed
      })
      .eq('id', generation.id);

    // Increment usage if successful
    if (result.success) {
      await (supabase as any).rpc('increment_ai_usage', {
        p_user_id: userIdentifier,
        p_model: model,
        p_amount: result.creditsUsed
      });
    }

    return NextResponse.json({
      success: result.success,
      generationId: generation.id,
      data: {
        ...result.data,
        urls: savedUrls
      },
      creditsUsed: result.creditsUsed,
      error: result.error
    });

  } catch (error: any) {
    console.error('AI Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}