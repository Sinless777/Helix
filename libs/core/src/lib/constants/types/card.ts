export interface CardProps {
  title: string
  description: string
  listItems?: ListItemProps[]
  image: string
  link: string
  buttonText?: string
  quote?: string
  aspectRatio?: string
  sx?: object
}

export interface ListItemProps {
  text: string
  href: string
  target?: React.HTMLAttributeAnchorTarget
  role: string
  detailedDescription: string
  icon?: string
  image?: string
}
