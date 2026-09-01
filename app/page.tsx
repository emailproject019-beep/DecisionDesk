import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect directly to our seeded milestone decision workspace
  redirect('/decisions/hosting-123');
}
