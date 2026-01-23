import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

export default async function HomePage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // 重定向到主应用页面
  redirect('/app');
}
