import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { checkRepositoryVisibility } from "../../../../lib/github/services/repository";

interface ReviewPageProps {
  params: {
    owner: string;
    repo: string;
  };
  searchParams: {
    pr?: string;
  };
}

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const session = await getServerSession(authOptions);

  // Check repository visibility with auth token if available
  const { isPrivate, error: visibilityError } = await checkRepositoryVisibility(
    params.owner,
    params.repo,
    session?.accessToken as string
  );

  // If repository is private and user is not authenticated
  if (isPrivate && !session) {
    redirect('/auth/signin');
  }

  // If there's an error and we're authenticated, show the error
  if (visibilityError && session) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h2 className="text-red-500 font-medium">Access Error</h2>
          <p className="text-red-500/80 text-sm mt-1">
            {visibilityError}. Please ensure you have access to this repository.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Review Pull Request</h1>

      <div className="grid gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <h2 className="text-lg font-semibold mb-2">Repository Details</h2>
          <div className="space-y-1 text-sm">
            <p><span className="opacity-70">Owner:</span> {params.owner}</p>
            <p><span className="opacity-70">Repository:</span> {params.repo}</p>
            <p><span className="opacity-70">Pull Request:</span> #{searchParams.pr}</p>
            <p><span className="opacity-70">Visibility:</span> {isPrivate ? 'Private' : 'Public'}</p>
          </div>
        </div>

        {/* Review analysis will be added here */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <h2 className="text-lg font-semibold mb-2">Analysis</h2>
          <p className="text-sm opacity-70">Analysis in progress...</p>
        </div>
      </div>
    </div>
  );
}
