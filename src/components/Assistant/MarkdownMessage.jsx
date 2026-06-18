import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import COLORS from '../../constants/colors';

/**
 * MarkdownMessage — renders the assistant's markdown replies.
 *
 * Uses react-markdown + remark-gfm so GitHub-flavoured markdown (tables,
 * strikethrough, task lists, autolinks) renders correctly — the assistant
 * frequently returns book lists as markdown tables, which the previous
 * hand-rolled parser couldn't handle.
 *
 * Element renderers map to the existing `cw-md*` classes (see ChatWidget.css)
 * and inline styles so the look matches the chat bubble. Links open safely in
 * a new tab.
 */

const components = {
  p: ({ children }) => <p className="cw-md-p">{children}</p>,
  ul: ({ children }) => <ul className="cw-md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="cw-md-ol">{children}</ol>,
  li: ({ children }) => <li className="cw-md-li">{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: COLORS.brass, textDecoration: 'underline' }}
    >
      {children}
    </a>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code
        style={{
          backgroundColor: 'rgba(0,0,0,0.22)',
          borderRadius: 4,
          padding: '1px 5px',
          fontSize: '0.92em',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        {children}
      </code>
    ) : (
      <pre className="cw-md-pre">
        <code>{children}</code>
      </pre>
    ),
  // GFM tables — the main reason for switching to a real markdown renderer.
  table: ({ children }) => (
    <div className="cw-md-table-wrap">
      <table className="cw-md-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th className="cw-md-th">{children}</th>,
  td: ({ children }) => <td className="cw-md-td">{children}</td>,
  blockquote: ({ children }) => (
    <blockquote className="cw-md-quote">{children}</blockquote>
  ),
};

export default function MarkdownMessage({ text }) {
  return (
    <div className="cw-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text || ''}
      </ReactMarkdown>
    </div>
  );
}
