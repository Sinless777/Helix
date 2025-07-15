export const metadata = {
  title: 'Contact Helix AI',
  description: '',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
