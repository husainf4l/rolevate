"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-6">
          {/* 404 Number */}
          <div className="text-8xl font-bold text-primary/20">404</div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button asChild className="flex-1" variant="default">
              <Link href="/en">Go Home</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              <button type="button">Go Back</button>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
