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
      const { data, error } = await (supabase as any)
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
          chat_messages_limit: 100
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating credits:', error);
        // Return default values if creation fails
        credits = {
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
          reset_date: new Date().toISOString()
        };
      } else {
        credits = data;
      }
    }

    // Ensure credits object has all required fields
    if (!credits) {
      credits = {
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
        reset_date: new Date().toISOString()
      };
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
          used: credits.imagen_used || 0,
          limit: credits.imagen_limit || 10,
          remaining: (credits.imagen_limit || 10) - (credits.imagen_used || 0)
        },
        gemini: {
          used: credits.gemini_used || 0,
          limit: credits.gemini_limit || 50,
          remaining: (credits.gemini_limit || 50) - (credits.gemini_used || 0)
        },
        grok: {
          used: credits.grok_used || 0,
          limit: credits.grok_limit || 5,
          remaining: (credits.grok_limit || 5) - (credits.grok_used || 0)
        },
        veo: {
          used: credits.veo_used || 0,
          limit: credits.veo_limit || 2,
          remaining: (credits.veo_limit || 2) - (credits.veo_used || 0)
        },
        nano_banana: {
          used: credits.nano_banana_used || 0,
          limit: credits.nano_banana_limit || 10,
          remaining: (credits.nano_banana_limit || 10) - (credits.nano_banana_used || 0)
        },
        chat: {
          used: credits.chat_messages_used || 0,
          limit: credits.chat_messages_limit || 100,
          remaining: (credits.chat_messages_limit || 100) - (credits.chat_messages_used || 0)
        }
      },
      subscription: subscription?.subscription_plans?.name || 'Free',
      resetDate: credits?.reset_date || new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Credits error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}