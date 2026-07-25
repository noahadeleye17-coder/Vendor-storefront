// import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('business_name')
    .eq('id', user.id)
    .single();

  // A logged-in auth user without a vendor row shouldn't normally happen
  // (see the signup flow), but guard against it rather than crashing the page.
  if (!vendor) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <DashboardNav businessName={vendor.business_name} />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
