'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prUrl = searchParams.get('pr');

  useEffect(() => {
    if (!prUrl) {
      setError('No PR URL provided');
      setLoading(false);
      return;
    }

    // Here we'll add the PR review logic
    console.log('Reviewing PR:', prUrl);
    setLoading(false);
  }, [prUrl]);

  const handleReviewAnother = () => {
    router.push('/');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{error}</p>
              <Button onClick={handleReviewAnother}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Review Another PR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">PR Review</h1>
          <Button onClick={handleReviewAnother}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Review Another PR
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Pull Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-mono text-sm break-all">{prUrl}</p>
              </div>
              {/* We'll add the review content here */}
              <p className="text-muted-foreground">
                Review functionality coming soon...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}