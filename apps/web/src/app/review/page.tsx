import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkRepositoryVisibility } from "@/lib/github/services/repository";
import { PrivateAccessButton } from "@/components/auth/private-access-button";

interface ReviewPageProps {
  params: {
    owner: string;
    repo: string;
    number: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  // Check repository visibility
  const { isPrivate, error } = await checkRepositoryVisibility(
    params.owner,
    params.repo,
    session.accessToken as string
  );

  // If there's an error and we can't determine visibility, show error
  if (error && !session.user?.hasPrivateAccess) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h2 className="text-red-500 font-medium">Error</h2>
          <p className="text-red-500/80 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Review Pull Request</h1>

      {/* Show private access button if needed */}
      <PrivateAccessButton 
        repoIsPrivate={isPrivate}
        owner={params.owner}
        repo={params.repo}
      />

      {/* Only show review form if we have access */}
      {(!isPrivate || session.user?.hasPrivateAccess) && (
        <div className="grid gap-4">
          {/* Review form will be added here */}
        </div>
      )}
    </div>
  );
}
