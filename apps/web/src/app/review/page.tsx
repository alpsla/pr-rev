import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth/auth-options";
import { checkRepositoryVisibility } from "../../lib/github/services/repository-access";

interface ReviewPageProps {
  params: {
    owner: string;
    repo: string;
    number: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  console.log('[Review Page] Checking authentication and repository access:', params);

  // Check authentication
  const session = await getServerSession(authOptions);
  console.log('[Review Page] Session check:', {
    isAuthenticated: !!session,
    hasToken: !!session?.user?.githubToken,
    hasPrivateAccess: session?.user?.hasPrivateAccess,
    scope: session?.user?.scope
  });

  if (!session) {
    console.log('[Review Page] No session, redirecting to sign in');
    redirect('/auth/signin');
  }

  // Check repository visibility
  const { isPrivate, error } = await checkRepositoryVisibility(
    params.owner,
    params.repo,
    session.user.githubToken
  );

  console.log('[Review Page] Repository visibility check:', {
    isPrivate,
    hasError: !!error,
    hasPrivateAccess: session.user?.hasPrivateAccess,
    hasRepoScope: session.user?.scope?.includes('repo')
  });

  // If there's an error and we can't determine visibility, show error
  if (error && !session.user?.hasPrivateAccess) {
    console.log('[Review Page] Error checking repository:', error);
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h2 className="text-red-500 font-medium">Error</h2>
          <p className="text-red-500/80 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // If private repo and no access, redirect to auth
  if (isPrivate && !session.user?.hasPrivateAccess) {
    console.log('[Review Page] Private repository detected without access, redirecting to GitHub auth');
    const reviewPath = `/review/${params.owner}/${params.repo}/${params.number}`;
    const searchParams = new URLSearchParams({
      callbackUrl: reviewPath,
    });
    redirect(`/api/auth/signin/github?${searchParams.toString()}`);
  }

  console.log('[Review Page] Access granted, rendering review page');
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Review Pull Request</h1>
      <div className="grid gap-4">
        {/* Review form will be added here */}
      </div>
    </div>
  );
}
