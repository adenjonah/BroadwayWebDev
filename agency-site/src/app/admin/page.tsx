import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/sign-out-button';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-inner">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Welcome, {user?.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
      <div className="admin-content">
        <div className="container">
          <div className="admin-placeholder">
            <h2>Coming Soon</h2>
            <p>Lead viewer and client dashboard will go here.</p>
          </div>
        </div>
      </div>
    </>
  );
}
