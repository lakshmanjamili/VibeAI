import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const sessionId = request.headers.get('x-session-id');
    const userIdentifier = userId || sessionId || 'anonymous';

    // Get or create user credits
    let { data: credits } = await (supabase as any)
      .from('user_ai_credits')
      .select('*')
      .eq('user_id', userIdentifier)
      .single();

    if (!credits) {
      // Create default credits for new user
      const { data } = await (supabase as any)
        .from('user_ai_credits')
        .insert({ user_id: userIdentifier })
        .select()
        .single();
      credits = data;
    }

    // Get user subscription
    const { data: subscription } = await (supabase as any)
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userIdentifier)
      .eq('status', 'active')
      .single();

    // If user has active subscription, update limits from plan
    if (subscription?.subscription_plans?.ai_generation_limits) {
      const limits = subscription.subscription_plans.ai_generation_limits;
      credits = {
        ...credits,
        imagen_limit: limits.imagen === -1 ? 999999 : limits.imagen,
        gemini_limit: limits.gemini === -1 ? 999999 : limits.gemini,
        grok_limit: limits.grok === -1 ? 999999 : limits.grok,
        veo_limit: limits.veo === -1 ? 999999 : limits.veo,
        nano_banana_limit: limits.nano_banana === -1 ? 999999 : limits.nano_banana,
        chat_messages_limit: limits.chat_messages === -1 ? 999999 : limits.chat_messages,
      };
    }

    return NextResponse.json({
      credits: {
        imagen: {
          used: credits.imagen_used,
          limit: credits.imagen_limit,
          remaining: credits.imagen_limit - credits.imagen_used
        },
        gemini: {
          used: credits.gemini_used,
          limit: credits.gemini_limit,
          remaining: credits.gemini_limit - credits.gemini_used
        },
        grok: {
          used: credits.grok_used,
          limit: credits.grok_limit,
          remaining: credits.grok_limit - credits.grok_used
        },
        veo: {
          used: credits.veo_used,
          limit: credits.veo_limit,
          remaining: credits.veo_limit - credits.veo_used
        },
        nano_banana: {
          used: credits.nano_banana_used,
          limit: credits.nano_banana_limit,
          remaining: credits.nano_banana_limit - credits.nano_banana_used
        },
        chat: {
          used: credits.chat_messages_used,
          limit: credits.chat_messages_limit,
          remaining: credits.chat_messages_limit - credits.chat_messages_used
        }
      },
      subscription: subscription?.subscription_plans?.name || 'Free',
      resetDate: credits.reset_date
    });

  } catch (error: any) {
    console.error('Credits error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}