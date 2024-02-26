import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

export const Paper = defineDocumentType(() => ({
  name: 'Paper',
  filePathPattern: 'paper.md',
  computedFields: {
    slug: {
      type: 'string',
      resolve: (paper) => {
        return paper._raw.sourceFileDir
      }
    }
  }
}))

export const References = defineDocumentType(() => ({
  name: 'References',
  filePathPattern: 'references.md',
  computedFields: {
    slug: {
      type: 'string',
      resolve: (references) => {
        return references._raw.sourceFileDir
      }
    }
  }
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Paper, References],
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug]
  }
})
