// frontend/src/components/Card/index.spec.ts
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HelixCard, CardProps } from './index'
import { jest, describe, it, expect,  } from '@jest/globals'

// Mock Next.js Image and Link
jest.mock('next/image', () => (props: any) => {
  // render a standard img for testing
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />
})
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    // clone the child and pass href through so RTL sees it
    return React.isValidElement(children)
      ? React.cloneElement(children, { href })
      : null
  }
})

describe('HelixCard', () => {
  const baseProps: CardProps = {
    title: 'Test Card',
    description: 'A short description',
  }

  it('renders title and description when no listItems provided', () => {
    render(<HelixCard {...baseProps} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('A short description')).toBeInTheDocument()
  })

  it('renders "More details coming soon." when neither description nor listItems provided', () => {
    render(<HelixCard title="Empty" />)
    expect(screen.getByText('More details coming soon.')).toBeInTheDocument()
  })

  it('renders list items as links when listItems prop is passed', () => {
    const listItems = [
      { text: 'Item 1', href: 'https://example.com/1', role: 'link' },
      { text: 'Item 2', href: 'https://example.com/2', role: 'link' },
    ]
    render(<HelixCard {...baseProps} listItems={listItems} />)
    listItems.forEach(item => {
      const btn = screen.getByText(item.text)
      expect(btn).toBeInTheDocument()
      expect(btn).toHaveAttribute('href', item.href)
      expect(btn).toHaveAttribute('target', '_blank')
    })
  })

  it('renders an <img> with correct src and alt when image prop is passed', () => {
    const props: CardProps = {
      ...baseProps,
      image: '/test.png',
    }
    render(<HelixCard {...props} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/test.png')
    expect(img).toHaveAttribute('alt', 'Test Card')
  })

  it('renders internal NextLink button when link starts with "/"', () => {
    const props: CardProps = {
      ...baseProps,
      link: '/internal',
      buttonText: 'Go internal',
    }
    render(<HelixCard {...props} />)
    const button = screen.getByRole('button', { name: /learn more about test card/i })
    // NextLink mock passes href to child:
    expect(button).toHaveAttribute('href', '/internal')
    expect(button).toHaveTextContent('Go internal')
  })

  it('renders external anchor button when link is external URL', () => {
    const props: CardProps = {
      ...baseProps,
      link: 'https://external.com',
      buttonText: 'External',
    }
    render(<HelixCard {...props} />)
    const button = screen.getByRole('button', { name: /learn more about test card/i })
    expect(button).toHaveAttribute('href', 'https://external.com')
    expect(button).toHaveAttribute('target', '_blank')
    expect(button).toHaveTextContent('External')
  })

  it('renders a quote when the quote prop is passed', () => {
    const props: CardProps = {
      ...baseProps,
      quote: 'Inspiring quote',
    }
    render(<HelixCard {...props} />)
    expect(screen.getByText(/“Inspiring quote”/)).toBeInTheDocument()
  })
})
