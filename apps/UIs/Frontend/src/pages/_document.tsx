// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>{/* global tags (fonts, meta…) */}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
