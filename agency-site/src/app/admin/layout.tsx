import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import '@/styles/admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
