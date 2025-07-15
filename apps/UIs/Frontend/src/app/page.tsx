import { Header } from '../components'
import { headerProps, MainTheme } from '@helixai/core'
import { Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import HeroSection from '../components/Hero'

export default function Index() {
  const HeroData = {
    title:
      'Meet Helix AI — Your Intelligent Companion for a Smarter Digital Life',
    description:
      'Seamlessly connect, automate, and analyze with an AI assistant built to simplify tasks, enhance productivity, and empower your decisions across every platform you use.',
    imageUrl: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_Logo.png',
  }
  return (
    <ThemeProvider theme={MainTheme}>
      <Box
        sx={{
          paddingTop: {
            xs: '4rem', // 64px for mobile
            sm: '4rem', // 64px for small screens
            md: '6rem', // 96px for medium screens
            lg: '6rem', // 96px for large screens
            xl: '6rem', // 96px for extra large screens
          },
        }}
      >
        {/* Header */}
        <Header {...headerProps} />

        {/* Spacer between header and hero */}
        <Box sx={{ height: '2rem' }} />

        {/* Hero Section */}
        <Box>
          <HeroSection
            title={HeroData.title}
            subtitle={HeroData.description}
            imageUrl={HeroData.imageUrl}
            imageAlt="Helix AI Visual"
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
