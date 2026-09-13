'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const MD: Components = {
  h1: ({ children }) => <h1 className="est-h1">{children}</h1>,
  h2: ({ children }) => <h2 className="est-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="est-h3">{children}</h3>,
  h4: ({ children }) => <h4 className="est-h4">{children}</h4>,
  p:  ({ children }) => <p  className="est-p">{children}</p>,
  strong: ({ children }) => <strong className="est-strong">{children}</strong>,
  em:     ({ children }) => <em className="est-em">{children}</em>,
  ul: ({ children }) => <ul className="est-ul">{children}</ul>,
  ol: ({ children }) => <ol className="est-ol">{children}</ol>,
  li: ({ children }) => <li className="est-li">{children}</li>,
  blockquote: ({ children }) => <blockquote className="est-bq">{children}</blockquote>,
  hr: () => <hr className="est-hr" />,
  table: ({ children }) => (
    <div className="est-table-wrap">
      <table className="est-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="est-thead">{children}</thead>,
  tr:    ({ children }) => <tr    className="est-tr">{children}</tr>,
  th: ({ children }) => <th className="est-th">{children}</th>,
  td: ({ children }) => <td className="est-td">{children}</td>,
  pre: ({ children }) => <pre className="est-pre">{children}</pre>,
  code: ({ children, className }) => (
    className
      ? <code className="est-code-block">{children}</code>
      : <code className="est-code">{children}</code>
  ),
}

export default function EstudoBody({ content }: { content: string }) {
  return (
    <div className="est-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
