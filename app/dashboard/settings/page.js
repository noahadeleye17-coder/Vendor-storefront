import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import SettingsForm from '@/components/SettingsForm';

export default async function SettingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, business_name, slug, whatsapp_number, theme_color, theme_font, is_published')
    .eq('id', user.id)
    .single();

  if (!vendor) {
    redirect('/login');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Store settings</h1>
        <p className="mt-1 text-ink/60">Update your storefront's details, look, and visibility.</p>
      </div>
      <SettingsForm vendor={vendor} appUrl={appUrl} />
    </div>
  );
}