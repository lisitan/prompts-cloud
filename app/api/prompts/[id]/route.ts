import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getPrompt, updatePrompt, deletePrompt } from '@/lib/kv';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const promptId = params.id;
    const body = await request.json();
    const { title, content, tags } = body;

    // 验证提示词是否存在且属于当前用户
    const existingPrompt = await getPrompt(promptId);
    if (!existingPrompt) {
      return NextResponse.json({ error: '提示词不存在' }, { status: 404 });
    }

    if (existingPrompt.userId !== session.user.id) {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    // 更新提示词
    const updatedPrompt = await updatePrompt(promptId, session.user.id, {
      title,
      content,
      tags,
    });

    return NextResponse.json({ prompt: updatedPrompt });
  } catch (error: any) {
    console.error('更新提示词失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const promptId = params.id;

    // 验证提示词是否存在且属于当前用户
    const existingPrompt = await getPrompt(promptId);
    if (!existingPrompt) {
      return NextResponse.json({ error: '提示词不存在' }, { status: 404 });
    }

    if (existingPrompt.userId !== session.user.id) {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    // 删除提示词（软删除）
    await deletePrompt(promptId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除提示词失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
