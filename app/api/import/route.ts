import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { createPrompt } from '@/lib/kv';

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
    const { data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: '无效的导入数据' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // 批量导入
    for (const item of data) {
      try {
        const { title, content, tags } = item;

        if (!title || !content) {
          skipped++;
          continue;
        }

        // 处理标签
        let tagArray: string[] = [];
        if (typeof tags === 'string') {
          tagArray = tags
            .split(/[,，、]/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        } else if (Array.isArray(tags)) {
          tagArray = tags;
        }

        await createPrompt(session.user.id, {
          title,
          content,
          tags: tagArray,
        });

        imported++;
      } catch (error: any) {
        errors.push(`导入 "${item.title}" 失败: ${error.message}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: data.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('导入数据失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
