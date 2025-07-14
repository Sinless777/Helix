'use client'

import ErrorPage from '../components/error-page'

interface ErrorProps {
  error: Error | Response
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  // Determine HTTP status (Response) or default to 500
  const status = error instanceof Response ? error.status : 500

  // Map status codes to titles and messages
  const titles: Record<number | 'default', string> = {
    404: 'Page Not Found',
    403: 'Access Denied',
    500: 'Internal Server Error',
    400: 'Bad Request',
    401: 'Unauthorized',
    408: 'Request Timeout',
    429: 'Too Many Requests',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    520: 'Unknown Error',
    420: 'Enhance Your Calm',
    default: 'Something Went Wrong',
  }

  const messages: Record<number | 'default', string> = {
    404: 'Sorry, we couldn’t find the page you’re looking for.',
    403: 'You don’t have permission to view this page.',
    500: 'An unexpected error occurred on the server.',
    400: 'The request was invalid or cannot be served.',
    401: 'You must be logged in to access this page.',
    408: 'The request took too long to complete. Please try again.',
    429: 'You have made too many requests in a short period. Please try again later.',
    503: 'The service is currently unavailable. Please try again later.',
    504: 'The server took too long to respond. Please try again later.',
    520: 'An unknown error occurred. Please try again later.',
    420: 'You are being rate-limited. Please slow down your requests.',
    default: "We're sorry — an unexpected error occurred.",
  }

  const title = titles[status] || titles.default
  const message = messages[status] || messages.default

  return <ErrorPage title={title} message={message} showRetry onRetry={reset} />
}
