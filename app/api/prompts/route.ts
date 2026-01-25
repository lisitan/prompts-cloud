import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getUserPrompts, createPrompt } from '@/lib/kv';

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const prompts = await getUserPrompts(session.user.id);

    return NextResponse.json({ prompts });
  } catch (error: any) {
    console.error('获取提示词失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, tags } = body;

    // 验证必需字段
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    // 创建提示词
    const prompt = await createPrompt(session.user.id, {
      title,
      content,
      tags: tags || [],
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error: any) {
    console.error('创建提示词失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
