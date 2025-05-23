'use client'

import styles from './page.module.scss'
import { Header } from '@/components/Header'
import { headerProps } from '@/constants/header'
import { Box } from '@mui/material'
import HeroSection from '../components/Hero'

const HeroData = {
  title:
    'Meet Helix AI — Your Intelligent Companion for a Smarter Digital Life',
  description:
    'Seamlessly connect, automate, and analyze with an AI assistant built to simplify tasks, enhance productivity, and empower your decisions across every platform you use.',
  imageUrl: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_Logo.png',
}

export default function Index() {
  return (
    <Box className={styles.mainContent}>
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
  )
}
