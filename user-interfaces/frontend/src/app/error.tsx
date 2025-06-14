"use client";

import { ErrorPage } from "@/components/error-page";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorPage
      title="Something went wrong"
      message="We're sorry — an unexpected error occurred."
      showRetry
      onRetry={reset}
    />
  );
}
