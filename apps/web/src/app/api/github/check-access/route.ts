import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

interface GitHubUrlParts {
  owner: string;
  repo: string;
  number?: string;
}

function parseGitHubUrl(url: string): GitHubUrlParts {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);

    if (urlObj.hostname !== 'github.com' || parts.length < 4) {
      throw new Error('Invalid GitHub URL');
    }

    return {
      owner: parts[0],
      repo: parts[1],
      number: parts[3],
    };
  } catch (error) {
    throw new Error('Invalid GitHub URL');
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    const { owner, repo } = parseGitHubUrl(url);

    // Check repository access
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (repoResponse.status === 403) {
      return NextResponse.json({
        needsAccess: true,
        isPrivate: true,
        message: "This is a private repository. You'll need to grant access to private repositories to continue."
      });
    }

    if (repoResponse.status === 404) {
      return NextResponse.json({
        needsAccess: true,
        isPrivate: true,
        message: "Unable to access this repository. Please verify the URL and your permissions."
      });
    }

    const repoData = await repoResponse.json();
    
    if (repoData.private && !session.user.hasPrivateAccess) {
      return NextResponse.json({
        needsAccess: true,
        isPrivate: true,
        message: "This is a private repository. Please configure private repository access in Settings to continue."
      });
    }

    return NextResponse.json({ needsAccess: false });
  } catch (error) {
    console.error('Error checking repository access:', error);
    return NextResponse.json(
      { error: 'Failed to check repository access' },
      { status: 500 }
    );
  }
}