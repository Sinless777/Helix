/**
 * @jest-environment jsdom
 */

import { describe, expect, it, jest } from '@jest/globals'
import { render } from '@testing-library/react'
import Image from 'next/image'
import React from 'react'
import BackgroundImage from './Image'

// Mock Next.js Image component before importing the component under test
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, ...rest } = props
    return <Image src={src} alt={alt} {...rest} />
  },
}))

describe('BackgroundImage', () => {
  const imageUrl = 'https://example.com/image.jpg'
  const altText = 'Example alt text'

  it('renders an img element with an src and alt attribute', () => {
    const { getByAltText } = render(
      <BackgroundImage imageUrl={imageUrl} altText={altText} />,
    )
    const img = getByAltText(altText) as HTMLImageElement
    // Verify the img element exists
    expect(img).toBeTruthy()
    // alt should match exactly
    expect(img.getAttribute('alt')).toBe(altText)
    // src should be set (Next.js loader may transform URL)
    expect(img.getAttribute('src')).toBeTruthy()
  })

  it('renders children inside the content wrapper', () => {
    const childText = 'Hello Child'
    const { getByText } = render(
      <BackgroundImage imageUrl={imageUrl} altText={altText}>
        <span>{childText}</span>
      </BackgroundImage>,
    )
    const child = getByText(childText)
    // Verify the child node renders in the document
    expect(child).toBeTruthy()
  })
})
