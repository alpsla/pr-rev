import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth/auth-options';
import { RepositoryAccessService } from '../../../../lib/github/services/repository-access';

interface ReviewPageProps {
  params: {
    owner: string;
    repo: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  console.log('[ReviewPage] Initial session state:', {
    hasSession: true,
    hasUser: true,
    hasGithubToken: true,
    scope: 'read:user,repo,user:email',
    hasPrivateAccess: true,
    params
  });

  const session = await getServerSession(authOptions);
  const repoAccess = await RepositoryAccessService.fromSession();
  const isPublic = await repoAccess.isRepositoryPublic(params.owner, params.repo);

  console.log('[ReviewPage] Repository visibility check:', {
    isPublic,
    owner: params.owner,
    repo: params.repo,
    hasGithubToken: !!session?.user?.githubToken,
    scope: session?.user?.scope
  });

  // For private repos, check if we have the token and proper scope
  if (!isPublic) {
    console.log('[ReviewPage] Checking private repo access:', {
      hasToken: !!session?.user?.githubToken,
      scope: session?.user?.scope
    });

    // Only redirect to GitHub if we don't have a token or repo scope
    if (!session?.user?.githubToken || !session?.user?.scope?.includes('repo')) {
      const currentPath = `/review/${params.owner}/${params.repo}`;
      redirect(`/api/auth/github?callbackUrl=${encodeURIComponent(currentPath)}&scope=repo`);
    }

    // If we have a token, verify we can access the repo
    const hasAccess = await repoAccess.hasRepositoryAccess(params.owner, params.repo);
    if (!hasAccess) {
      throw new Error('No access to repository');
    }

    console.log('[ReviewPage] Access granted:', {
      isPublic,
      hasToken: !!session?.user?.githubToken,
      scope: session?.user?.scope,
      owner: params.owner,
      repo: params.repo
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Repository Review</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Repository</h2>
            <p className="text-gray-600">{params.owner}/{params.repo}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Access</h2>
            <p className="text-gray-600">{isPublic ? 'Public' : 'Private'}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">GitHub Token</h2>
            <p className="text-gray-600">{session?.user?.githubToken ? 'Present' : 'Missing'}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Scopes</h2>
            <p className="text-gray-600">{session?.user?.scope || 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
