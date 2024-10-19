import Link from 'next/link'
import { MDXComponents } from 'mdx/types'
import { RefAttributes } from 'react'
import DataVisualizationComponent from '@/app/simulate/components/model/data-visualization'

export const mdxComponents: MDXComponents = {
  a: ({ children, ...props }) => {
    return (
      <Link href={props.href || ''} {...(props as RefAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    )
  },
  DataVisualization: ({ children, ...props }) => {
    return <DataVisualizationComponent showVisualize={false} />
  }
}
