import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getUserPrompts } from '@/lib/kv';

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户的所有提示词
    const prompts = await getUserPrompts(session.user.id);

    // 格式化为导出格式
    const exportData = prompts.map((prompt) => ({
      title: prompt.title,
      content: prompt.content,
      tags: prompt.tags.join(', '),
      createdAt: new Date(prompt.timestamp).toISOString(),
    }));

    // 设置下载响应头
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set(
      'Content-Disposition',
      `attachment; filename="prompts-${Date.now()}.json"`
    );

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers,
    });
  } catch (error: any) {
    console.error('导出 JSON 失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
