import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth/auth-options';
import { RepositoryAccessService } from '../../../../../lib/github/services/repository-access';

interface ReviewPageProps {
  params: {
    owner: string;
    repo: string;
    number: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await getServerSession(authOptions);
  console.log('[ReviewPage] Initial session state:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    hasGithubToken: !!session?.user?.githubToken,
    scope: session?.user?.scope,
    hasPrivateAccess: session?.user?.hasPrivateAccess,
    params
  });

  // Check repository visibility
  const repoAccess = await RepositoryAccessService.fromSession();
  const isPublic = await repoAccess.isRepositoryPublic(params.owner, params.repo);
  console.log('[ReviewPage] Repository visibility check:', { 
    isPublic, 
    owner: params.owner, 
    repo: params.repo,
    hasGithubToken: !!session?.user?.githubToken,
    scope: session?.user?.scope
  });

  // If private repo and no GitHub token or missing repo scope, redirect to GitHub OAuth
  if (!isPublic && (!session?.user?.githubToken || !session?.user?.scope?.includes('repo'))) {
    console.log('[ReviewPage] Need GitHub auth for private repo:', {
      hasToken: !!session?.user?.githubToken,
      scope: session?.user?.scope,
      needsRepoScope: !session?.user?.scope?.includes('repo')
    });

    const currentPath = `/review/${params.owner}/${params.repo}/${params.number}`;
    console.log('[ReviewPage] Redirecting to GitHub OAuth:', { 
      currentPath, 
      scope: 'repo',
      existingScope: session?.user?.scope
    });
    
    redirect(`/api/auth/github?callbackUrl=${encodeURIComponent(currentPath)}&scope=repo`);
  }

  // If private repo and has token, check if we have access
  if (!isPublic) {
    console.log('[ReviewPage] Checking private repo access:', {
      hasToken: !!session?.user?.githubToken,
      scope: session?.user?.scope
    });

    const hasAccess = await repoAccess.hasRepositoryAccess(params.owner, params.repo);
    if (!hasAccess) {
      console.log('[ReviewPage] No access to private repository:', {
        owner: params.owner,
        repo: params.repo,
        hasToken: !!session?.user?.githubToken,
        scope: session?.user?.scope
      });
      throw new Error('No access to repository');
    }
  }

  console.log('[ReviewPage] Access granted:', {
    isPublic,
    hasToken: !!session?.user?.githubToken,
    scope: session?.user?.scope,
    owner: params.owner,
    repo: params.repo
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Pull Request Review</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Repository</h2>
            <p className="text-gray-600">{params.owner}/{params.repo}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pull Request</h2>
            <p className="text-gray-600">#{params.number}</p>
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
