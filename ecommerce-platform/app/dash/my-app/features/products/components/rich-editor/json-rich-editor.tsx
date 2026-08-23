'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  Copy,
  Check,
  Sparkles,
  Eraser,
  FileText,
  Image as ImageIcon,
  Eye,
  Edit3,
  Settings,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Maximize2,
  Scissors,
  Clipboard,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { JSONEditorContent } from '../../types/product.types';
import MediaManagerModal, { SelectedImagePayload } from '../../../media/components/media-manager-modal';
import ImageSettingsModal, { ImageAttributes } from './image-settings-modal';
import LinkModal from './link-modal';
import { getImageUrl } from '../../../../lib/image-url';

interface JSONRichEditorProps {
  label: string;
  value: JSONEditorContent | Record<string, unknown> | null;
  onChange: (value: JSONEditorContent) => void;
  placeholder?: string;
}

// -------------------------------------------------------------
// HELPER: Convert inline nodes to HTML string
// -------------------------------------------------------------
function renderInlineHTML(content: Array<{ type: string; text?: string; marks?: Array<{ type: string; attrs?: Record<string, unknown> }> }> | undefined): string {
  if (!content || !Array.isArray(content)) return '';

  return content
    .map((item) => {
      let str = item.text || '';
      if (!str) return '';

      // Escape HTML
      str = str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      if (item.marks && Array.isArray(item.marks)) {
        for (const mark of item.marks) {
          if (mark.type === 'bold') str = `<strong>${str}</strong>`;
          if (mark.type === 'italic') str = `<em>${str}</em>`;
          if (mark.type === 'underline') str = `<u>${str}</u>`;
          if (mark.type === 'link') {
            const href = (mark.attrs?.href as string) || '#';
            str = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-[#4880FF] hover:underline font-semibold">${str}</a>`;
          }
        }
      }
      return str;
    })
    .join('');
}

// -------------------------------------------------------------
// HELPER: TipTap JSON -> Visual HTML for ContentEditable
// -------------------------------------------------------------
function tiptapToEditorHTML(json: unknown): string {
  if (!json) return '<p><br></p>';

  // Handle case where value was raw string or legacy markdown
  let doc = json as { type?: string; content?: Array<{ type: string; attrs?: Record<string, unknown>; content?: unknown[] }> } | null;

  if (typeof json === 'string') {
    doc = convertMarkdownStringToTipTap(json);
  } else if (doc && (!doc.type || !Array.isArray(doc.content))) {
    return '<p><br></p>';
  }

  if (!doc || !doc.content || doc.content.length === 0) {
    return '<p><br></p>';
  }

  return doc.content
    .map((node) => {
      if (node.type === 'image') {
        const rawSrc = (node.attrs?.src as string) || '';
        const src = getImageUrl(rawSrc);
        const alt = (node.attrs?.alt as string) || '';
        const title = (node.attrs?.title as string) || '';
        const width = (node.attrs?.width as string) || '100%';
        const align = (node.attrs?.align as string) || 'center';
        const href = (node.attrs?.href as string) || '';

        let textAlignStyle = 'text-align: center;';
        if (align === 'left') textAlignStyle = 'text-align: left;';
        if (align === 'right') textAlignStyle = 'text-align: right;';

        const imgTag = `<img src="${src}" alt="${alt}" title="${title}" data-rawsrc="${rawSrc}" data-width="${width}" style="max-width: ${width}; display: inline-block;" class="editor-img-item rounded-xl shadow-sm border border-gray-200" />`;

        const wrapped = href
          ? `<a href="${href}" data-href="${href}" target="_blank" rel="noopener noreferrer" style="display: inline-block;">${imgTag}</a>`
          : imgTag;

        return `<figure class="editor-image-wrapper my-4 relative group" data-align="${align}" data-rawsrc="${rawSrc}" data-alt="${alt}" data-title="${title}" data-width="${width}" data-href="${href}" style="${textAlignStyle} user-select: none;" contenteditable="false">${wrapped}${(title || alt) ? `<figcaption class="text-xs text-gray-500 mt-1.5 font-medium italic select-none">${title || alt}</figcaption>` : ''}</figure>`;
      }

      if (node.type === 'heading') {
        const level = (node.attrs?.level as number) || 2;
        const align = (node.attrs?.textAlign as string) || '';
        const style = align ? ` style="text-align: ${align};"` : '';
        const inner = renderInlineHTML(node.content as any[]);
        return `<h${level}${style} class="font-extrabold my-2.5 ${level === 1 ? 'text-xl text-slate-900' : 'text-base text-slate-900'}">${inner || '<br>'}</h${level}>`;
      }

      if (node.type === 'bulletList') {
        const items = Array.isArray(node.content)
          ? node.content
              .map((li: any) => {
                const inner = Array.isArray(li.content)
                  ? li.content.map((p: any) => renderInlineHTML(p.content)).join('')
                  : '';
                return `<li class="ml-5 list-disc my-1 text-slate-800">${inner || '<br>'}</li>`;
              })
              .join('')
          : '';
        return `<ul class="my-2">${items}</ul>`;
      }

      if (node.type === 'orderedList') {
        const items = Array.isArray(node.content)
          ? node.content
              .map((li: any) => {
                const inner = Array.isArray(li.content)
                  ? li.content.map((p: any) => renderInlineHTML(p.content)).join('')
                  : '';
                return `<li class="ml-5 list-decimal my-1 text-slate-800">${inner || '<br>'}</li>`;
              })
              .join('')
          : '';
        return `<ol class="my-2">${items}</ol>`;
      }

      if (node.type === 'blockquote') {
        const inner = Array.isArray(node.content)
          ? node.content.map((p: any) => renderInlineHTML(p.content)).join('')
          : '';
        return `<blockquote class="border-l-4 border-[#4880FF] pl-4 py-2 my-3 bg-blue-50/50 rounded-r-xl text-slate-700 italic">${inner || '<br>'}</blockquote>`;
      }

      if (node.type === 'paragraph') {
        const align = (node.attrs?.textAlign as string) || '';
        const style = align ? ` style="text-align: ${align};"` : '';
        const inner = renderInlineHTML(node.content as any[]);
        return `<p${style} class="my-1.5 leading-relaxed text-slate-800">${inner || '<br>'}</p>`;
      }

      return '';
    })
    .filter(Boolean)
    .join('');
}

// -------------------------------------------------------------
// HELPER: Convert Markdown string to TipTap doc (Fallback support)
// -------------------------------------------------------------
function convertMarkdownStringToTipTap(text: string): JSONEditorContent {
  if (!text || text.trim() === '') {
    return { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
  }

  const lines = text.split('\n');
  const nodes: Array<Record<string, unknown>> = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Image Match: [![alt](src)](href) or ![alt](src)
    const linkedMatch = trimmed.match(/^\[!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)\]\((.*?)\)$/);
    const stdMatch = trimmed.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);

    if (linkedMatch || stdMatch) {
      const rawAlt = (linkedMatch ? linkedMatch[1] : stdMatch![1]) || '';
      const src = (linkedMatch ? linkedMatch[2] : stdMatch![2]) || '';
      const title = (linkedMatch ? linkedMatch[3] : stdMatch![3]) || '';
      const href = (linkedMatch ? linkedMatch[4] : '') || '';

      const altParts = rawAlt.split('|');
      const alt = altParts[0]?.trim() || '';
      let width = '100%';
      let align = 'center';

      for (let i = 1; i < altParts.length; i++) {
        const p = altParts[i].trim();
        if (p.startsWith('w:')) width = p.slice(2);
        else if (p === '25%' || p === '50%' || p === '75%' || p === '100%' || p.endsWith('px')) width = p;
        else if (p.startsWith('align:')) align = p.slice(6);
        else if (p === 'left' || p === 'center' || p === 'right') align = p;
      }

      nodes.push({
        type: 'image',
        attrs: { src, alt, title, width, align, href },
      });
      return;
    }

    if (trimmed.startsWith('# ')) {
      nodes.push({ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: trimmed.slice(2) }] });
      return;
    }

    if (trimmed.startsWith('## ')) {
      nodes.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: trimmed.slice(3) }] });
      return;
    }

    nodes.push({ type: 'paragraph', content: [{ type: 'text', text: line }] });
  });

  return { type: 'doc', content: (nodes.length > 0 ? nodes : [{ type: 'paragraph', content: [] }]) as any };
}

// -------------------------------------------------------------
// HELPER: DOM Element -> Standard TipTap JSON Schema
// -------------------------------------------------------------
function domToTipTap(container: HTMLElement): JSONEditorContent {
  const nodes: Array<Record<string, unknown>> = [];

  const extractInlineMarks = (parent: HTMLElement): Array<{ type: 'text'; text: string; marks?: Array<{ type: string; attrs?: Record<string, unknown> }> }> => {
    const inlineNodes: Array<{ type: 'text'; text: string; marks?: Array<{ type: string; attrs?: Record<string, unknown> }> }> = [];

    const traverse = (n: Node, activeMarks: Array<{ type: string; attrs?: Record<string, unknown> }>) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const text = n.textContent || '';
        if (text) {
          inlineNodes.push({
            type: 'text',
            text,
            ...(activeMarks.length > 0 ? { marks: [...activeMarks] } : {}),
          });
        }
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const newMarks = [...activeMarks];

        if (tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight, 10) >= 600) {
          newMarks.push({ type: 'bold' });
        }
        if (tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic') {
          newMarks.push({ type: 'italic' });
        }
        if (tag === 'u') {
          newMarks.push({ type: 'underline' });
        }
        if (tag === 'a') {
          const href = el.getAttribute('href') || el.getAttribute('data-href') || '#';
          newMarks.push({ type: 'link', attrs: { href } });
        }

        n.childNodes.forEach((child) => traverse(child, newMarks));
      }
    };

    parent.childNodes.forEach((child) => traverse(child, []));
    return inlineNodes;
  };

  const processNode = (node: Node): Record<string, unknown> | null => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // 1. Image Figure wrapper or standalone Image
      if (tag === 'figure' || tag === 'img' || (tag === 'a' && el.querySelector('img'))) {
        const img = (tag === 'img' ? el : el.querySelector('img')) as HTMLImageElement | null;
        if (!img) return null;

        const figure = tag === 'figure' ? el : el.closest('figure');
        const link = tag === 'a' ? (el as HTMLAnchorElement) : el.querySelector('a') || el.closest('a');

        let src = figure?.getAttribute('data-rawsrc') || img.getAttribute('data-rawsrc') || img.getAttribute('src') || '';
        if (src.includes('/uploads/')) {
          src = src.substring(src.indexOf('/uploads/'));
        }

        const alt = figure?.getAttribute('data-alt') || img.getAttribute('alt') || '';
        const title = figure?.getAttribute('data-title') || img.getAttribute('title') || '';
        const width = figure?.getAttribute('data-width') || img.getAttribute('data-width') || img.style.maxWidth || '100%';
        const align = figure?.getAttribute('data-align') || figure?.style.textAlign || el.style.textAlign || 'center';
        const href = figure?.getAttribute('data-href') || link?.getAttribute('href') || link?.getAttribute('data-href') || '';

        return {
          type: 'image',
          attrs: {
            src,
            alt,
            title,
            width: width.trim() || '100%',
            align: ['left', 'center', 'right'].includes(align) ? align : 'center',
            href: href.trim(),
          },
        };
      }

      // 2. Headings
      if (['h1', 'h2', 'h3'].includes(tag)) {
        const level = parseInt(tag.replace('h', ''), 10);
        const textAlign = el.style.textAlign || el.getAttribute('align') || undefined;
        return {
          type: 'heading',
          attrs: { level, ...(textAlign ? { textAlign } : {}) },
          content: extractInlineMarks(el),
        };
      }

      // 3. Bullet List
      if (tag === 'ul') {
        const items = Array.from(el.children).map((li) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: extractInlineMarks(li as HTMLElement),
            },
          ],
        }));
        return { type: 'bulletList', content: items };
      }

      // 4. Ordered List
      if (tag === 'ol') {
        const items = Array.from(el.children).map((li) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: extractInlineMarks(li as HTMLElement),
            },
          ],
        }));
        return { type: 'orderedList', content: items };
      }

      // 5. Blockquote
      if (tag === 'blockquote') {
        return {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: extractInlineMarks(el),
            },
          ],
        };
      }

      // 6. Paragraph or Div
      if (tag === 'p' || tag === 'div') {
        // If it contains an image or figure inside, extract them
        if (el.querySelector('img, figure')) {
          const imgChild = el.querySelector('figure') || el.querySelector('img');
          if (imgChild) return processNode(imgChild);
        }

        const textAlign = el.style.textAlign || el.getAttribute('align') || undefined;
        const inline = extractInlineMarks(el);
        if (inline.length === 0 && !el.textContent?.trim()) {
          return null;
        }

        return {
          type: 'paragraph',
          ...(textAlign ? { attrs: { textAlign } } : {}),
          content: inline,
        };
      }
    }

    return null;
  };

  Array.from(container.childNodes).forEach((child) => {
    const nodeObj = processNode(child);
    if (nodeObj) {
      nodes.push(nodeObj);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      Array.from(el.children).forEach((grand) => {
        const grandObj = processNode(grand);
        if (grandObj) nodes.push(grandObj);
      });
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      nodes.push({
        type: 'paragraph',
        content: [{ type: 'text', text: child.textContent }],
      });
    }
  });

  if (nodes.length === 0) {
    nodes.push({ type: 'paragraph', content: [] });
  }

  return {
    type: 'doc',
    content: nodes as unknown as JSONEditorContent['content'],
  };
}

export default function JSONRichEditor({
  label,
  value,
  onChange,
  placeholder = 'Nhập nội dung mô tả sản phẩm...',
}: JSONRichEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');
  const [copied, setCopied] = useState(false);

  // Modal States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isImageSettingsOpen, setIsImageSettingsOpen] = useState(false);
  const [selectedImageAttrs, setSelectedImageAttrs] = useState<ImageAttributes | null>(null);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedLinkText, setSelectedLinkText] = useState('');

  // Currently Selected Image in Visual Editor
  const [selectedImageEl, setSelectedImageEl] = useState<HTMLElement | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const isFocused = useRef(false);
  const lastReportedJSON = useRef<string>(JSON.stringify(value));

  // Initialize and configure default paragraph separator
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // ignore
    }
    if (editorRef.current && (!editorRef.current.innerHTML || editorRef.current.innerHTML.trim() === '')) {
      editorRef.current.innerHTML = tiptapToEditorHTML(value) || '<p><br></p>';
    }
  }, []);

  // Sync prop value into visual ContentEditable HTML ONLY when not actively focused / typing
  useEffect(() => {
    if (!editorRef.current) return;
    const newJSONStr = JSON.stringify(value);

    if (newJSONStr !== lastReportedJSON.current && !isFocused.current) {
      lastReportedJSON.current = newJSONStr;
      editorRef.current.innerHTML = tiptapToEditorHTML(value) || '<p><br></p>';
    }
  }, [value]);

  // Highlight active selected image with dedicated outline/ring specifically on the image
  useEffect(() => {
    if (!editorRef.current) return;
    const allImgs = editorRef.current.querySelectorAll('.editor-img-item, img');
    allImgs.forEach((imgNode) => {
      const img = imgNode as HTMLElement;
      if (img === selectedImageEl) {
        img.style.outline = '3px solid #4880FF';
        img.style.outlineOffset = '3px';
        img.style.boxShadow = '0 0 0 5px rgba(72, 128, 255, 0.25)';
        img.style.borderRadius = '12px';
      } else {
        img.style.outline = 'none';
        img.style.outlineOffset = '0px';
        img.style.boxShadow = 'none';
      }
    });
  }, [selectedImageEl]);

  // Sync changes from visual editor back to parent form
  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    const tipTapDoc = domToTipTap(editorRef.current);
    lastReportedJSON.current = JSON.stringify(tipTapDoc);
    onChange(tipTapDoc);
  }, [onChange]);

  const handleFocus = () => {
    isFocused.current = true;
    if (editorRef.current && (!editorRef.current.innerHTML || editorRef.current.innerHTML.trim() === '')) {
      editorRef.current.innerHTML = '<p><br></p>';
    }
  };

  const handleBlur = () => {
    isFocused.current = false;
    handleEditorInput();
  };

  // Execute standard formatting commands
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    handleEditorInput();
  };

  // -------------------------------------------------------------
  // ALIGNMENT ACTION: Works for selected image OR current text line
  // -------------------------------------------------------------
  const handleAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (selectedImageEl) {
      const figure = selectedImageEl.closest('figure') || selectedImageEl;
      figure.setAttribute('data-align', align);
      figure.style.textAlign = align;
      handleEditorInput();
      return;
    }

    if (align === 'left') execCmd('justifyLeft');
    else if (align === 'center') execCmd('justifyCenter');
    else if (align === 'right') execCmd('justifyRight');
    else if (align === 'justify') execCmd('justifyFull');
  };

  // -------------------------------------------------------------
  // IMAGE INSERTION: Inserts directly into Visual Canvas
  // -------------------------------------------------------------
  const handleInsertImage = (payload: SelectedImagePayload) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const fullSrc = getImageUrl(payload.url);
    const title = payload.title?.trim() || '';
    const alt = payload.alt?.trim() || payload.filename || 'Hình ảnh';

    const figureHTML = `<figure class="editor-image-wrapper my-4 relative group" data-align="center" data-rawsrc="${payload.url}" data-alt="${alt}" data-title="${title}" data-width="100%" data-href="" style="text-align: center; user-select: none;" contenteditable="false"><img src="${fullSrc}" alt="${alt}" title="${title}" data-rawsrc="${payload.url}" data-width="100%" style="max-width: 100%; display: inline-block; cursor: pointer;" class="editor-img-item rounded-xl shadow-sm border border-gray-200" />${title ? `<figcaption class="text-xs text-gray-500 mt-1.5 font-medium italic select-none">${title}</figcaption>` : ''}</figure><p><br></p>`;

    // If editor has nothing or just empty tag
    if (!editor.textContent?.trim() && !editor.querySelector('figure, img')) {
      editor.innerHTML = figureHTML;
    } else {
      document.execCommand('insertHTML', false, figureHTML);
    }

    handleEditorInput();
    setSelectedImageEl(null);

    // Place cursor in the paragraph right after the image so user can immediately type
    setTimeout(() => {
      if (!editor) return;
      const allP = editor.querySelectorAll('p');
      if (allP.length > 0) {
        const lastP = allP[allP.length - 1];
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(lastP);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 50);
  };

  // -------------------------------------------------------------
  // IMAGE CLICK (Select only) & DOUBLE CLICK (Open Modal)
  // -------------------------------------------------------------
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Single click an image: Selects image and displays floating toolbar
    if (target.tagName.toLowerCase() === 'img' || target.closest('figure')) {
      const img = target.tagName.toLowerCase() === 'img' ? target : target.closest('figure')!.querySelector('img');
      if (img) {
        setSelectedImageEl(img);
        return;
      }
    }

    // Clicked elsewhere: Deselect image
    setSelectedImageEl(null);

    // If clicked on empty space in editor canvas, make sure focus is active and ready for typing
    if (editorRef.current && (!editorRef.current.innerHTML || editorRef.current.innerHTML.trim() === '')) {
      editorRef.current.innerHTML = '<p><br></p>';
    }
  };

  // Double-click on image opens the full Image Settings Modal
  const handleEditorDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.tagName.toLowerCase() === 'img' || target.closest('figure')) {
      const img = target.tagName.toLowerCase() === 'img' ? target : target.closest('figure')!.querySelector('img');
      if (img) {
        handleOpenImageSettings(img as HTMLElement);
      }
    }
  };

  // Quick Width Change for selected image
  const applySelectedImageWidth = (width: string) => {
    if (!selectedImageEl) return;
    const figure = selectedImageEl.closest('figure');
    selectedImageEl.style.maxWidth = width;
    selectedImageEl.setAttribute('data-width', width);
    if (figure) figure.setAttribute('data-width', width);
    handleEditorInput();
  };

  // Image Clipboard Memory State (for Cut / Copy / Paste)
  const [imageClipboard, setImageClipboard] = useState<{
    rawSrc: string;
    alt: string;
    title: string;
    width: string;
    align: string;
    href: string;
  } | null>(null);

  // -------------------------------------------------------------
  // CUT, COPY & PASTE IMAGE FUNCTIONALITY
  // -------------------------------------------------------------
  const handleCutSelectedImage = () => {
    if (!selectedImageEl) return;
    const figure = selectedImageEl.closest('figure') || selectedImageEl.parentElement;
    const link = selectedImageEl.closest('a');

    const rawSrc = figure?.getAttribute('data-rawsrc') || selectedImageEl.getAttribute('data-rawsrc') || selectedImageEl.getAttribute('src') || '';
    const alt = figure?.getAttribute('data-alt') || selectedImageEl.getAttribute('alt') || '';
    const title = figure?.getAttribute('data-title') || selectedImageEl.getAttribute('title') || '';
    const width = figure?.getAttribute('data-width') || selectedImageEl.getAttribute('data-width') || selectedImageEl.style.maxWidth || '100%';
    const align = figure?.getAttribute('data-align') || figure?.style.textAlign || 'center';
    const href = figure?.getAttribute('data-href') || link?.getAttribute('href') || '';

    setImageClipboard({ rawSrc, alt, title, width, align, href });

    if (figure) {
      figure.remove();
    } else {
      selectedImageEl.remove();
    }

    setSelectedImageEl(null);
    handleEditorInput();
  };

  const handleCopySelectedImage = () => {
    if (!selectedImageEl) return;
    const figure = selectedImageEl.closest('figure') || selectedImageEl.parentElement;
    const link = selectedImageEl.closest('a');

    const rawSrc = figure?.getAttribute('data-rawsrc') || selectedImageEl.getAttribute('data-rawsrc') || selectedImageEl.getAttribute('src') || '';
    const alt = figure?.getAttribute('data-alt') || selectedImageEl.getAttribute('alt') || '';
    const title = figure?.getAttribute('data-title') || selectedImageEl.getAttribute('title') || '';
    const width = figure?.getAttribute('data-width') || selectedImageEl.getAttribute('data-width') || selectedImageEl.style.maxWidth || '100%';
    const align = figure?.getAttribute('data-align') || figure?.style.textAlign || 'center';
    const href = figure?.getAttribute('data-href') || link?.getAttribute('href') || '';

    setImageClipboard({ rawSrc, alt, title, width, align, href });
  };

  const handlePasteImage = () => {
    if (!imageClipboard) return;
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const fullSrc = getImageUrl(imageClipboard.rawSrc);
    let textAlignStyle = 'text-align: center;';
    if (imageClipboard.align === 'left') textAlignStyle = 'text-align: left;';
    if (imageClipboard.align === 'right') textAlignStyle = 'text-align: right;';

    const imgTag = `<img src="${fullSrc}" alt="${imageClipboard.alt}" title="${imageClipboard.title}" data-rawsrc="${imageClipboard.rawSrc}" data-width="${imageClipboard.width}" style="max-width: ${imageClipboard.width}; display: inline-block; cursor: pointer;" class="editor-img-item rounded-xl shadow-sm border border-gray-200" />`;

    const wrapped = imageClipboard.href
      ? `<a href="${imageClipboard.href}" data-href="${imageClipboard.href}" target="_blank" rel="noopener noreferrer" style="display: inline-block;">${imgTag}</a>`
      : imgTag;

    const figureHTML = `<figure class="editor-image-wrapper my-4 relative group" data-align="${imageClipboard.align}" data-rawsrc="${imageClipboard.rawSrc}" data-alt="${imageClipboard.alt}" data-title="${imageClipboard.title}" data-width="${imageClipboard.width}" data-href="${imageClipboard.href}" style="${textAlignStyle} user-select: none;" contenteditable="false">${wrapped}${imageClipboard.title ? `<figcaption class="text-xs text-gray-500 mt-1.5 font-medium italic select-none">${imageClipboard.title}</figcaption>` : ''}</figure><p><br></p>`;

    document.execCommand('insertHTML', false, figureHTML);
    handleEditorInput();
  };

  // -------------------------------------------------------------
  // MOVE UP / MOVE DOWN QUICK REORDERING
  // -------------------------------------------------------------
  const handleMoveImageUp = () => {
    if (!selectedImageEl) return;
    const figure = selectedImageEl.closest('figure') || selectedImageEl;
    const prev = figure.previousElementSibling;
    if (prev) {
      prev.before(figure);
      handleEditorInput();
    }
  };

  const handleMoveImageDown = () => {
    if (!selectedImageEl) return;
    const figure = selectedImageEl.closest('figure') || selectedImageEl;
    const next = figure.nextElementSibling;
    if (next) {
      next.after(figure);
      handleEditorInput();
    }
  };

  // Handle Keyboard shortcuts (Ctrl+X, Ctrl+C, Delete)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl && e.key.toLowerCase() === 'x' && selectedImageEl) {
      e.preventDefault();
      handleCutSelectedImage();
      return;
    }

    if (isCtrl && e.key.toLowerCase() === 'c' && selectedImageEl) {
      e.preventDefault();
      handleCopySelectedImage();
      return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedImageEl) {
      e.preventDefault();
      handleDeleteSelectedImage();
      return;
    }
  };

  // Open ImageSettingsModal for selected image (or double-clicked image)
  const handleOpenImageSettings = (imgEl?: HTMLElement) => {
    const target = imgEl || selectedImageEl;
    if (!target) return;
    const figure = target.closest('figure');
    const link = target.closest('a');

    const src = figure?.getAttribute('data-rawsrc') || target.getAttribute('data-rawsrc') || target.getAttribute('src') || '';
    const alt = figure?.getAttribute('data-alt') || target.getAttribute('alt') || '';
    const title = figure?.getAttribute('data-title') || target.getAttribute('title') || '';
    const width = figure?.getAttribute('data-width') || target.getAttribute('data-width') || target.style.maxWidth || '100%';
    const align = (figure?.getAttribute('data-align') || figure?.style.textAlign || 'center') as 'left' | 'center' | 'right';
    const href = figure?.getAttribute('data-href') || link?.getAttribute('href') || '';

    setSelectedImageEl(target);
    setSelectedImageAttrs({
      src,
      alt,
      title,
      width,
      align,
      href,
    });

    setIsImageSettingsOpen(true);
  };

  // Save changes from ImageSettingsModal
  const handleSaveImageSettings = (updated: ImageAttributes) => {
    if (!selectedImageEl) return;

    const figure = selectedImageEl.closest('figure') || selectedImageEl.parentElement;
    const fullSrc = getImageUrl(updated.src);

    selectedImageEl.setAttribute('src', fullSrc);
    selectedImageEl.setAttribute('data-rawsrc', updated.src);
    selectedImageEl.setAttribute('alt', updated.alt);
    selectedImageEl.setAttribute('title', updated.title);
    selectedImageEl.setAttribute('data-width', updated.width);
    selectedImageEl.style.maxWidth = updated.width;

    if (figure) {
      figure.setAttribute('data-align', updated.align);
      figure.setAttribute('data-rawsrc', updated.src);
      figure.setAttribute('data-alt', updated.alt);
      figure.setAttribute('data-title', updated.title);
      figure.setAttribute('data-width', updated.width);
      figure.setAttribute('data-href', updated.href);
      figure.style.textAlign = updated.align;

      // Update figcaption
      const figcap = figure.querySelector('figcaption');
      if (updated.title || updated.alt) {
        if (figcap) {
          figcap.textContent = updated.title || updated.alt;
        } else {
          const newFigcap = document.createElement('figcaption');
          newFigcap.className = 'text-xs text-gray-500 mt-1.5 font-medium italic select-none';
          newFigcap.textContent = updated.title || updated.alt;
          figure.appendChild(newFigcap);
        }
      } else if (figcap) {
        figcap.remove();
      }

      // Update Link wrapper
      const currentLink = figure.querySelector('a');
      if (updated.href) {
        if (currentLink) {
          currentLink.setAttribute('href', updated.href);
          currentLink.setAttribute('data-href', updated.href);
        } else {
          const newLink = document.createElement('a');
          newLink.setAttribute('href', updated.href);
          newLink.setAttribute('data-href', updated.href);
          newLink.setAttribute('target', '_blank');
          newLink.setAttribute('rel', 'noopener noreferrer');
          newLink.style.display = 'inline-block';
          selectedImageEl.parentNode?.insertBefore(newLink, selectedImageEl);
          newLink.appendChild(selectedImageEl);
        }
      } else if (currentLink) {
        // Remove link wrapper, keep img
        currentLink.parentNode?.insertBefore(selectedImageEl, currentLink);
        currentLink.remove();
      }
    }

    handleEditorInput();
  };

  // Delete selected image
  const handleDeleteSelectedImage = () => {
    if (!selectedImageEl) return;
    const figure = selectedImageEl.closest('figure');
    if (figure) figure.remove();
    else selectedImageEl.remove();
    setSelectedImageEl(null);
    handleEditorInput();
  };

  // -------------------------------------------------------------
  // LINK ACTIONS
  // -------------------------------------------------------------
  const handleOpenLinkModal = () => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    setSelectedLinkText(text);
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = (linkText: string, linkUrl: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim()) {
      execCmd('createLink', linkUrl);
    } else {
      const linkHTML = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-[#4880FF] hover:underline font-semibold">${linkText}</a>&nbsp;`;
      execCmd('insertHTML', linkHTML);
    }
  };

  const handleRemoveLink = () => {
    execCmd('unlink');
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(value || (editorRef.current ? domToTipTap(editorRef.current) : {}), null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentJSON = value || (editorRef.current ? domToTipTap(editorRef.current) : { type: 'doc', content: [] });

  return (
    <div className="space-y-2">
      {/* Header Label and Mode Switch Bar */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[#202224] flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#4880FF]" />
          {label}
        </label>

        {/* Tab switch */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-[#202224] shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#4880FF]" />
            <span>Soạn thảo trực quan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-[#202224] shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-orange-600" />
            <span>Xem trước</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'json'
                ? 'bg-[#4880FF] text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>TipTap JSON</span>
          </button>
        </div>
      </div>

      {/* 1. VISUAL WYSIWYG EDITOR TAB */}
      <div className={activeTab === 'editor' ? 'block' : 'hidden'}>
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-colors focus-within:border-gray-300">
          {/* Formatting Toolbar */}
          <div className="bg-gray-50/90 px-3 py-2 border-b border-gray-100 flex items-center gap-1 flex-wrap select-none">
            {/* Bold, Italic, Underline */}
            <button
              type="button"
              onClick={() => execCmd('bold')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="In đậm (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd('italic')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd('underline')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="Gạch chân (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            {/* Headings */}
            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<h1>')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="Tiêu đề 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<h2>')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="Tiêu đề 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            {/* Alignment Tools */}
            <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/80 gap-0.5">
              <button
                type="button"
                onClick={() => handleAlignment('left')}
                className="p-1 rounded-md text-xs font-bold text-gray-700 hover:bg-white hover:text-[#4880FF] transition-all cursor-pointer"
                title="Căn trái"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAlignment('center')}
                className="p-1 rounded-md text-xs font-bold text-gray-700 hover:bg-white hover:text-[#4880FF] transition-all cursor-pointer"
                title="Căn giữa"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAlignment('right')}
                className="p-1 rounded-md text-xs font-bold text-gray-700 hover:bg-white hover:text-[#4880FF] transition-all cursor-pointer"
                title="Căn phải"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAlignment('justify')}
                className="p-1 rounded-md text-xs font-bold text-gray-700 hover:bg-white hover:text-[#4880FF] transition-all cursor-pointer"
                title="Căn đều 2 bên"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            {/* Link Tools */}
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="Chèn liên kết (Link)"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRemoveLink}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-1 cursor-pointer"
              title="Hủy liên kết (Unlink)"
            >
              <Unlink className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            {/* Lists & Blockquote */}
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="Danh sách gạch đầu dòng"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="Danh sách đánh số"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => execCmd('formatBlock', '<blockquote>')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100 cursor-pointer"
              title="Trích dẫn"
            >
              <Quote className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            {/* IMAGE INSERTION & PASTE TOOLS */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="px-3 py-1.5 bg-[#4880FF] hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
                title="Chèn hình ảnh từ Thư viện Media"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Chèn ảnh</span>
              </button>

              {imageClipboard && (
                <button
                  type="button"
                  onClick={handlePasteImage}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border border-emerald-200 cursor-pointer animate-in fade-in"
                  title="Dán ảnh vừa cắt/sao chép vào vị trí con trỏ (Ctrl+V)"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Dán ảnh</span>
                </button>
              )}
            </div>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.innerHTML = '<p><br></p>';
                  handleEditorInput();
                  setSelectedImageEl(null);
                }
              }}
              className="p-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-1 cursor-pointer"
              title="Xóa toàn bộ nội dung"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <div className="ml-auto hidden sm:flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#4880FF]" />
                WYSIWYG Visual Editor
              </span>
            </div>
          </div>

          {/* Floating Selected Image Action Bar */}
          {selectedImageEl && (
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-between gap-2 flex-wrap animate-in fade-in duration-150">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-blue-800 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#4880FF]" />
                  <span>Đang chọn ảnh:</span>
                </span>

                {/* Width Presets */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-200 gap-0.5 text-xs font-bold text-gray-700">
                  <button
                    type="button"
                    onClick={() => applySelectedImageWidth('25%')}
                    className="px-2 py-0.5 hover:bg-blue-50 hover:text-[#4880FF] rounded"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => applySelectedImageWidth('50%')}
                    className="px-2 py-0.5 hover:bg-blue-50 hover:text-[#4880FF] rounded"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => applySelectedImageWidth('75%')}
                    className="px-2 py-0.5 hover:bg-blue-50 hover:text-[#4880FF] rounded"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => applySelectedImageWidth('100%')}
                    className="px-2 py-0.5 hover:bg-blue-50 hover:text-[#4880FF] rounded"
                  >
                    100%
                  </button>
                </div>

                {/* Alignment */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-200 gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleAlignment('left')}
                    className="p-1 hover:bg-blue-50 hover:text-[#4880FF] rounded"
                    title="Căn trái"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlignment('center')}
                    className="p-1 hover:bg-blue-50 hover:text-[#4880FF] rounded"
                    title="Căn giữa"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlignment('right')}
                    className="p-1 hover:bg-blue-50 hover:text-[#4880FF] rounded"
                    title="Căn phải"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Move Up / Down */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-200 gap-0.5">
                  <button
                    type="button"
                    onClick={handleMoveImageUp}
                    className="p-1 hover:bg-blue-50 hover:text-[#4880FF] rounded transition-colors"
                    title="Di chuyển ảnh lên trên đoạn trước"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMoveImageDown}
                    className="p-1 hover:bg-blue-50 hover:text-[#4880FF] rounded transition-colors"
                    title="Di chuyển ảnh xuống dưới đoạn sau"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cut & Copy Image Buttons */}
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-blue-200 gap-0.5 text-xs font-bold text-gray-700">
                  <button
                    type="button"
                    onClick={handleCutSelectedImage}
                    className="px-2 py-0.5 hover:bg-blue-50 hover:text-[#4880FF] rounded flex items-center gap-1"
                    title="Cắt ảnh (Ctrl+X)"
                  >
                    <Scissors className="w-3 h-3 text-red-500" />
                    <span>Cắt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySelectedImage}
                    className="px-2 py-0.5 hover:bg-blue-50 hover:text-[#4880FF] rounded flex items-center gap-1"
                    title="Sao chép ảnh (Ctrl+C)"
                  >
                    <Copy className="w-3 h-3 text-blue-600" />
                    <span>Chép</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenImageSettings()}
                  className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-[#4880FF] border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Cài đặt (Alt, Title, Link)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSelectedImage}
                  className="p-1 text-red-500 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
                  title="Xóa ảnh (Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Visual ContentEditable Canvas */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleEditorClick}
            onDoubleClick={handleEditorDoubleClick}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            className="w-full p-5 text-sm text-[#202224] focus:outline-none min-h-[220px] max-h-[500px] overflow-y-auto leading-relaxed font-sans cursor-text [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none"
          />
        </div>
      </div>

      {/* 2. LIVE PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm min-h-[160px] max-h-[440px] overflow-y-auto">
          <div
            className="prose prose-sm max-w-none text-slate-800"
            dangerouslySetInnerHTML={{
              __html: tiptapToEditorHTML(value || (editorRef.current ? domToTipTap(editorRef.current) : null)),
            }}
          />
        </div>
      )}

      {/* 3. JSON DOCUMENT TAB */}
      {activeTab === 'json' && (
        <div className="border border-gray-800 bg-gray-950 rounded-2xl p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-64 shadow-2xl relative group">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-green-400" />
              Real-time TipTap JSON Document Schema
            </span>
            <button
              type="button"
              onClick={handleCopyJSON}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép JSON</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-green-300 font-mono text-xs leading-relaxed">
            {JSON.stringify(currentJSON, null, 2)}
          </pre>
        </div>
      )}

      {/* MEDIA MANAGER MODAL */}
      <MediaManagerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={handleInsertImage}
        title="Chèn hình ảnh vào mô tả sản phẩm"
      />

      {/* IMAGE SETTINGS MODAL */}
      <ImageSettingsModal
        isOpen={isImageSettingsOpen}
        onClose={() => {
          setIsImageSettingsOpen(false);
          setSelectedImageAttrs(null);
        }}
        initialData={selectedImageAttrs}
        onSave={handleSaveImageSettings}
        onDelete={handleDeleteSelectedImage}
        onChangeImage={() => {
          setIsImageSettingsOpen(false);
          setIsMediaModalOpen(true);
        }}
      />

      {/* LINK INSERT MODAL */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setSelectedLinkText('');
        }}
        initialText={selectedLinkText}
        onSave={handleSaveLink}
      />
    </div>
  );
}
