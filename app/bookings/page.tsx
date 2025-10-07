import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BookingsClient from './BookingsClient';

export default async function BookingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <BookingsClient user={user} />;
}
