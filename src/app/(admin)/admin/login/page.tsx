import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Login Admin' };

export default async function LoginPage() {
  if (await getSesi()) redirect('/admin');
  return <LoginForm />;
}
