import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../../../lib/auth/auth-options";
import { RepositoryAccessService } from "../../../../../lib/github/services/repository-access";

interface ReviewPageProps {
  params: {
    owner: string;
    repo: string;
    number: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  let isPublic = false;

  try {
    // Get session first to check if we're authenticated
    const session = await getServerSession(authOptions);
    console.log('Session in review page:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasGithubToken: !!session?.user?.githubToken,
      hasAccessToken: !!session?.user?.accessToken
    });

    // Check repository visibility
    const repoAccessService = new RepositoryAccessService();
    isPublic = await repoAccessService.isRepositoryPublic(params.owner, params.repo);
    console.log('Repository visibility check:', { isPublic, ...params });

    // For private repos, we need authentication
    if (!isPublic) {
      if (!session?.user?.githubToken) {
        console.log('No GitHub token found, redirecting to auth');
        redirect(`/auth/signin?callbackUrl=/review/${params.owner}/${params.repo}/${params.number}`);
      }

      // Check if we have access with current token
      const authenticatedRepoService = new RepositoryAccessService(session.user.githubToken);
      const hasAccess = await authenticatedRepoService.isRepositoryAccessible(params.owner, params.repo);
      console.log('Repository access check:', { hasAccess, ...params });

      if (!hasAccess) {
        console.log('No access to private repo, redirecting to auth');
        redirect(`/auth/signin?callbackUrl=/review/${params.owner}/${params.repo}/${params.number}`);
      }
    }
  } catch (error) {
    console.error('Error in review page:', error);
    throw error;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Review Pull Request</h1>
      <div className="grid gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">
            {params.owner}/{params.repo} #{params.number}
          </h2>
          <p className="text-gray-600">
            {isPublic ? 'Public' : 'Private'} Repository
          </p>
        </div>
        {/* Review content will be added here */}
      </div>
    </div>
  );
}
