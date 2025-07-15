export const metadata = {
  title: 'Helix AI Technologies',
  description: '',
}

export default function TechnologyLayout({
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
