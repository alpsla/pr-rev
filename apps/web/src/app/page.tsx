import { PRInputForm } from '../components/pr-input-form';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth/auth-options';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const githubToken = session?.accessToken;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">PR Reviewer</h1>
        <PRInputForm githubToken={githubToken} />
      </div>
    </main>
  );
}
