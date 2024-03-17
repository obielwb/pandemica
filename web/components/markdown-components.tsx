import Link from 'next/link'
import { MDXComponents } from 'mdx/types'
import { RefAttributes } from 'react'

export const mdxComponents: MDXComponents = {
  a: ({ children, ...props }) => {
    return (
      <Link href={props.href || ''} {...(props as RefAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    )
  }
}
