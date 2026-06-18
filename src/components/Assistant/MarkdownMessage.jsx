import COLORS from '../../constants/colors';

/**
 * MarkdownMessage — a tiny, dependency-free renderer for the limited markdown
 * the assistant emits: bold (**), italic (*), inline code (`), links, numbered
 * and bulleted lists, and paragraph breaks.
 *
 * We deliberately avoid react-markdown to keep the bundle lean; the model's
 * output uses only a small, predictable subset of markdown.
 */

/* ── Inline parsing: **bold**, *italic*, `code`, [text](url) ── */
function renderInline(text, keyPrefix) {
  const nodes = [];
  let remaining = text;
  let key = 0;

  // Order matters: links first, then bold, then italic, then code.
  const patterns = [
    { type: 'link', re: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/ },
    { type: 'bold', re: /\*\*([^*]+)\*\*/ },
    { type: 'bolda', re: /__([^_]+)__/ },
    { type: 'italic', re: /\*([^*]+)\*/ },
    { type: 'code', re: /`([^`]+)`/ },
  ];

  while (remaining) {
    // Find the earliest-matching pattern in the remaining string.
    let best = null;
    for (const p of patterns) {
      const m = p.re.exec(remaining);
      if (m && (best === null || m.index < best.match.index)) {
        best = { ...p, match: m };
      }
    }

    if (!best) {
      nodes.push(remaining);
      break;
    }

    const { match, type } = best;
    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const content = match[1];
    const k = `${keyPrefix}-i${key++}`;
    if (type === 'bold' || type === 'bolda') {
      nodes.push(<strong key={k} style={{ fontWeight: 700 }}>{content}</strong>);
    } else if (type === 'italic') {
      nodes.push(<em key={k}>{content}</em>);
    } else if (type === 'code') {
      nodes.push(
        <code
          key={k}
          style={{
            backgroundColor: 'rgba(0,0,0,0.22)',
            borderRadius: 4,
            padding: '1px 5px',
            fontSize: '0.92em',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {content}
        </code>,
      );
    } else if (type === 'link') {
      nodes.push(
        <a
          key={k}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.brass, textDecoration: 'underline' }}
        >
          {content}
        </a>,
      );
    }

    remaining = remaining.slice(match.index + match[0].length);
  }

  return nodes;
}

/* ── Block parsing: paragraphs, ordered + unordered lists ── */
export default function MarkdownMessage({ text }) {
  const lines = (text || '').split('\n');
  const blocks = [];
  let list = null; // { ordered: bool, items: [] }

  const flushList = () => {
    if (list) {
      blocks.push({ type: 'list', ...list });
      list = null;
    }
  };

  let para = [];
  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ') });
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const ordered = /^\s*\d+\.\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);

    if (ordered) {
      flushPara();
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] }; }
      list.items.push(ordered[1]);
    } else if (bullet) {
      flushPara();
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] }; }
      list.items.push(bullet[1]);
    } else if (line.trim() === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();

  return (
    <div className="cw-md">
      {blocks.map((b, i) => {
        if (b.type === 'p') {
          return (
            <p key={i} className="cw-md-p">
              {renderInline(b.text, `p${i}`)}
            </p>
          );
        }
        if (b.type === 'list') {
          const ListTag = b.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={i} className={b.ordered ? 'cw-md-ol' : 'cw-md-ul'}>
              {b.items.map((it, j) => (
                <li key={j} className="cw-md-li">
                  {renderInline(it, `l${i}-${j}`)}
                </li>
              ))}
            </ListTag>
          );
        }
        return null;
      })}
    </div>
  );
}
