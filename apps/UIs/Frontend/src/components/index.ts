'use client'
export { BackgroundImage, type BackgroundImageProps } from './Background'
export { HelixCard } from './Card' // explicitly re-export the component
export type { CardProps, ListItemProps } from './Card'
export { Header, type HeaderProps, type Page } from './Header'
export { HeroSection, HeroWaitlist } from './Hero'
export {
  ModalProvider,
  useModal,
  NotificationModal,
  PopupModal,
  ImportantModal,
  ToastContainer,
  useToast,
} from './modal'
export { ErrorBoundary } from './ErrorBoundary'
export { MermaidChart, type MermaidChartProps } from './MermaidChart'
