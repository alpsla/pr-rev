export interface GitHubTokenData {
  accessToken: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  scope: string;
  hasPrivateAccess: boolean;
}

export interface GitHubAuthResult {
  scope: string;
  hasPrivateAccess: boolean;
}

export interface GitHubUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  hasPrivateAccess?: boolean;
}
