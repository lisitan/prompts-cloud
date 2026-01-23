export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp)
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '.');
}

export function parseTags(input: string): string[] {
  return input
    .split(/[,，、]/)
    .map((t) => t.trim())
    .filter((t) => t);
}
