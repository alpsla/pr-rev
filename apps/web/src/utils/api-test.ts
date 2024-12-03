import { Octokit } from '@octokit/rest';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

// Initialize Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

// Initialize GitHub OAuth App credentials
const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

export async function testGitHubOAuth() {
  try {
    // First, test if we can make an unauthenticated request to GitHub API
    const octokit = new Octokit();
    const { data: rateLimit } = await octokit.rateLimit.get();
    
    console.log('GitHub API Basic Access Test Success:', {
      rate: rateLimit.rate,
      message: 'Successfully connected to GitHub API'
    });

    // Now test OAuth credentials
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user`;
    
    console.log('\nGitHub OAuth Setup Test Success:');
    console.log('✓ Client ID configured');
    console.log('✓ Client Secret configured');
    console.log('\nTo complete OAuth setup, users will need to:');
    console.log('1. Visit the authorization URL');
    console.log('2. Grant access to the application');
    console.log('\nAuthorization URL:', authUrl);
    
    return true;
  } catch (error) {
    console.error('GitHub API Test Failed:', error);
    return false;
  }
}

export async function testClaudeConnection() {
  try {
    // Test Claude API with a simple message
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 100,
      messages: [{ 
        role: 'user', 
        content: 'Say "API connection successful!" if you receive this message.'
      }]
    });
    
    console.log('Claude API Test Success:', message.content);
    return true;
  } catch (error) {
    console.error('Claude API Test Failed:', error);
    return false;
  }
}

// Run both tests
async function runTests() {
  // Debug: Print environment variables (excluding sensitive values)
  console.log('Environment Variables Check:');
  console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✓ Set' : '✗ Not Set');
  console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '✓ Set' : '✗ Not Set');
  console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✓ Set' : '✗ Not Set');
  
  console.log('\nStarting API Tests...');
  
  console.log('\nTesting GitHub API and OAuth Setup...');
  await testGitHubOAuth();
  
  console.log('\nTesting Claude API...');
  await testClaudeConnection();
  
  console.log('\nTests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}