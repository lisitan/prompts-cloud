import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { togglePinTag } from '@/lib/kv';

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
    const { tagName } = body;

    if (!tagName) {
      return NextResponse.json({ error: '标签名不能为空' }, { status: 400 });
    }

    const isPinned = await togglePinTag(session.user.id, tagName);

    return NextResponse.json({ isPinned });
  } catch (error: any) {
    console.error('切换标签置顶失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
