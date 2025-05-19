// not-found.tsx
import ErrorPage from '@/components/error-page'
export default function NotFound() {
  return (
    <ErrorPage
      title="404 - Page Not Found"
      message="The page you're looking for doesn't exist."
    />
  )
}
