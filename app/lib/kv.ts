import { kv } from '@vercel/kv';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  userId: string;
  timestamp: number;
  updatedAt: number;
  isDeleted: boolean;
  deletedAt: number | null;
}

// 获取单个提示词
export async function getPrompt(promptId: string): Promise<Prompt | null> {
  return await kv.get<Prompt>(`prompt:${promptId}`);
}

// 获取用户所有提示词
export async function getUserPrompts(userId: string): Promise<Prompt[]> {
  const promptIds = await kv.smembers(`user:${userId}:prompts`);

  if (!promptIds || promptIds.length === 0) {
    return [];
  }

  const prompts = await kv.mget<Prompt[]>(
    ...promptIds.map((id) => `prompt:${id}`)
  );

  // 过滤掉 null 值和已删除的提示词
  return prompts.filter((p): p is Prompt => p !== null && !p.isDeleted);
}

// 创建提示词
export async function createPrompt(
  userId: string,
  data: Omit<Prompt, 'id' | 'userId' | 'timestamp' | 'updatedAt' | 'isDeleted' | 'deletedAt'>
): Promise<Prompt> {
  const promptId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const prompt: Prompt = {
    ...data,
    id: promptId,
    userId,
    timestamp: Date.now(),
    updatedAt: Date.now(),
    isDeleted: false,
    deletedAt: null,
  };

  await kv.pipeline()
    .set(`prompt:${promptId}`, prompt)
    .sadd(`user:${userId}:prompts`, promptId)
    .exec();

  return prompt;
}

// 更新提示词
export async function updatePrompt(
  promptId: string,
  userId: string,
  data: Partial<Pick<Prompt, 'title' | 'content' | 'tags'>>
): Promise<Prompt | null> {
  const prompt = await kv.get<Prompt>(`prompt:${promptId}`);

  if (!prompt || prompt.userId !== userId) {
    return null;
  }

  const updatedPrompt: Prompt = {
    ...prompt,
    ...data,
    updatedAt: Date.now(),
  };

  await kv.set(`prompt:${promptId}`, updatedPrompt);

  return updatedPrompt;
}

// 软删除提示词
export async function deletePrompt(
  promptId: string,
  userId: string
): Promise<boolean> {
  const prompt = await kv.get<Prompt>(`prompt:${promptId}`);

  if (!prompt || prompt.userId !== userId) {
    return false;
  }

  const deletedPrompt: Prompt = {
    ...prompt,
    isDeleted: true,
    deletedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await kv.set(`prompt:${promptId}`, deletedPrompt);

  return true;
}

// 获取用户置顶的标签
export async function getPinnedTags(userId: string): Promise<string[]> {
  const tags = await kv.smembers(`user:${userId}:pinnedTags`);
  return Array.from(tags || []) as string[];
}

// 切换标签置顶状态
export async function togglePinTag(
  userId: string,
  tagName: string
): Promise<boolean> {
  const isPinned = await kv.sismember(`user:${userId}:pinnedTags`, tagName);

  if (isPinned) {
    await kv.srem(`user:${userId}:pinnedTags`, tagName);
    return false;
  } else {
    await kv.sadd(`user:${userId}:pinnedTags`, tagName);
    return true;
  }
}
