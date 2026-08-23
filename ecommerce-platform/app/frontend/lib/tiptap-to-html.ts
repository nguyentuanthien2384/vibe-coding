/**
 * Utility: Convert TipTap/ProseMirror JSON document -> HTML string
 * Dùng để render rich text description từ backend (shortDescription, longDescription)
 */

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

type TipTapDoc = {
  type: 'doc';
  content?: TipTapNode[];
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderText(node: TipTapNode): string {
  if (node.type !== 'text' || !node.text) return '';

  let html = escapeHtml(node.text);

  if (node.marks && node.marks.length > 0) {
    for (const mark of node.marks) {
      switch (mark.type) {
        case 'bold':
          html = `<strong>${html}</strong>`;
          break;
        case 'italic':
          html = `<em>${html}</em>`;
          break;
        case 'underline':
          html = `<u>${html}</u>`;
          break;
        case 'strike':
          html = `<s>${html}</s>`;
          break;
        case 'code':
          html = `<code>${html}</code>`;
          break;
        case 'link': {
          const href = (mark.attrs?.href as string) || '#';
          html = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
          break;
        }
      }
    }
  }

  return html;
}

function renderInlineContent(nodes: TipTapNode[] | undefined): string {
  if (!nodes || !Array.isArray(nodes)) return '';
  return nodes.map(renderText).join('');
}

function renderNode(node: TipTapNode): string {
  switch (node.type) {
    case 'paragraph': {
      const inner = renderInlineContent(node.content);
      // Bỏ qua paragraph rỗng hoàn toàn
      if (!inner.trim()) return '<br>';
      return `<p>${inner}</p>`;
    }

    case 'heading': {
      const level = (node.attrs?.level as number) || 2;
      const inner = renderInlineContent(node.content);
      return `<h${level}>${inner}</h${level}>`;
    }

    case 'bulletList': {
      const items = (node.content || []).map(renderNode).join('');
      return `<ul>${items}</ul>`;
    }

    case 'orderedList': {
      const items = (node.content || []).map(renderNode).join('');
      return `<ol>${items}</ol>`;
    }

    case 'listItem': {
      // listItem chứa paragraph bên trong, lấy inline content trực tiếp
      const innerParagraphs = (node.content || []).map((child) => {
        if (child.type === 'paragraph') {
          return renderInlineContent(child.content);
        }
        return renderNode(child);
      });
      return `<li>${innerParagraphs.join('')}</li>`;
    }

    case 'blockquote': {
      const inner = (node.content || []).map(renderNode).join('');
      return `<blockquote>${inner}</blockquote>`;
    }

    case 'codeBlock': {
      const code = (node.content || [])
        .filter((n) => n.type === 'text')
        .map((n) => escapeHtml(n.text || ''))
        .join('\n');
      return `<pre><code>${code}</code></pre>`;
    }

    case 'horizontalRule':
      return '<hr>';

    case 'hardBreak':
      return '<br>';

    case 'text':
      return renderText(node);

    default:
      return '';
  }
}

/**
 * Chuyển đổi TipTap JSON Document sang HTML string
 * @param json - TipTap JSON document (shortDescription / longDescription từ backend)
 * @returns HTML string hoặc chuỗi rỗng nếu không có dữ liệu
 */
export function tiptapToHtml(json: TipTapDoc | Record<string, unknown> | null | undefined): string {
  if (!json) return '';

  const doc = json as TipTapDoc;
  if (doc.type !== 'doc' || !Array.isArray(doc.content) || doc.content.length === 0) return '';

  return doc.content.map(renderNode).join('');
}

/**
 * Trích xuất plain text từ TipTap JSON (dùng cho SEO description, meta, truncate, v.v.)
 */
export function tiptapToPlainText(json: TipTapDoc | Record<string, unknown> | null | undefined): string {
  if (!json) return '';

  const doc = json as TipTapDoc;
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return '';

  const extractText = (nodes: TipTapNode[]): string => {
    return nodes
      .map((node) => {
        if (node.type === 'text') return node.text || '';
        if (node.content) return extractText(node.content);
        return '';
      })
      .join(' ')
      .trim();
  };

  return extractText(doc.content);
}
