import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getUserPrompts, getPinnedTags } from '@/lib/kv';

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

    // 聚合标签并计算使用频率
    const tagCounts: Record<string, number> = {};
    prompts.forEach((prompt) => {
      prompt.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // 获取置顶标签
    const pinnedTags = await getPinnedTags(session.user.id);

    // 转换为数组并排序
    const tags = Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count,
      pinned: pinnedTags.includes(name),
    }));

    // 排序：置顶的在前，然后按使用频率排序
    tags.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.count - a.count;
    });

    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error('获取标签失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
