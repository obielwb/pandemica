import { MDXRemote } from 'next-mdx-remote/rsc'

import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkToc from 'remark-toc'
import { mdxComponents } from './markdown-components'

export default function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="prose prose-a:text-wrap prose-img:bg-white prose-p:text-balance prose-strong:text-primary prose-headings:font-semibold prose-headings:bg-clip-text prose-headings:text-transparent prose-headings:bg-gradient-to-r prose-headings:from-foreground prose-headings:to-muted-foreground prose-a:underline prose-a:transition-colors prose-a:duration-200 hover:prose-a:dark:text-pandemica-yellow prose-a:dark:text-pandemica-yellow/70 prose-a:text-pandemica-blue/60 hover:prose-a:text-pandemica-blue text-foreground prose-headings:tracking-tighter prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm prose-h1:font-semibold prose-blockquote:border-background-muted prose-blockquote:font-normal prose-li:pl-0 marker:prose-li:text-pandemica-yellow prose-code:p-1 prose-thead:border-background-muted prose-th:border-background-muted prose-tr:border-background-muted prose-blockquote:text-foreground-muted prose-code:text-foreground-muted prose-strong:text-foreground-muted text-foreground-muted prose-hr:border-background-muted prose-headings:font-sans-heading prose-em:italic prose-strong:font-bold prose-em:font-medium font-sans-text prose-em:font-serif-italic prose-em:text-[16px] sm:prose-em:text-[18px] prose-quoteless prose-a:underline-offset-4 prose-a:break-all w-full text-balance text-sm font-normal leading-6 tracking-tight transition-colors duration-100 sm:text-base">
      <MDXRemote
        source={children}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkToc],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
          }
        }}
        components={mdxComponents}
      />
    </div>
  )
}
