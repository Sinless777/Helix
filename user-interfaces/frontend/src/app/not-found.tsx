// not-found.tsx
import { ErrorPage } from "@frontend/components";

export default function NotFound() {
  return (
    <ErrorPage
      title="404 - Page Not Found"
      message="The page you're looking for doesn't exist."
    />
  );
}
