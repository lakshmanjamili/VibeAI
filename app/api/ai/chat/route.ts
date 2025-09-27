import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { generateWithGeminiChat } from '@/lib/ai-services';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const sessionId = request.headers.get('x-session-id');
    const userIdentifier = userId || sessionId || 'anonymous';
    
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check chat credits
    const { data: hasCredits } = await (supabase as any).rpc('check_user_ai_credits', {
      p_user_id: userIdentifier,
      p_model: 'chat'
    });

    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient chat credits' },
        { status: 403 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await (supabase as any)
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userIdentifier)
        .single();
      conversation = data;
    }

    if (!conversation) {
      const { data } = await (supabase as any)
        .from('ai_conversations')
        .insert({
          user_id: userIdentifier,
          title: message.substring(0, 50),
          model: 'gemini',
          messages: []
        })
        .select()
        .single();
      conversation = data;
    }

    // Generate response
    const result = await generateWithGeminiChat(message);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Update conversation with new messages
    const messages = conversation.messages || [];
    messages.push(
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: result.data?.text, timestamp: new Date().toISOString() }
    );

    await (supabase as any)
      .from('ai_conversations')
      .update({ 
        messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

    // Increment chat usage
    await (supabase as any).rpc('increment_ai_usage', {
      p_user_id: userIdentifier,
      p_model: 'chat',
      p_amount: 1
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      response: result.data?.text,
      messages
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Chat failed' },
      { status: 500 }
    );
  }
}

// Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const sessionId = request.headers.get('x-session-id');
    const userIdentifier = userId || sessionId || 'anonymous';

    const { data, error } = await (supabase as any)
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userIdentifier)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ conversations: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}