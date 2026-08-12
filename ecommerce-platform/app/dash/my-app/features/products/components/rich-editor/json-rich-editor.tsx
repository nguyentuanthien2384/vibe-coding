'use client';

import { useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  FileText,
  Copy,
  Check,
  Sparkles,
  Eraser,
} from 'lucide-react';
import { JSONEditorContent } from '../../types/product.types';

interface JSONRichEditorProps {
  label: string;
  value: JSONEditorContent | null;
  onChange: (value: JSONEditorContent) => void;
  placeholder?: string;
}

// Convert raw text with markdown/toolbar cues to standard TipTap/ProseMirror JSON format
function convertTextToJSON(text: string): JSONEditorContent {
  if (!text || text.trim() === '') {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    };
  }

  const lines = text.split('\n');
  const nodes: Array<Record<string, unknown>> = [];

  let currentListItems: Array<Record<string, unknown>> = [];
  let currentListType: 'bulletList' | 'orderedList' | null = null;

  const flushList = () => {
    if (currentListType && currentListItems.length > 0) {
      nodes.push({
        type: currentListType,
        content: currentListItems,
      });
      currentListItems = [];
      currentListType = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // 1. Heading 1 (# ...)
    if (trimmed.startsWith('# ')) {
      flushList();
      nodes.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineText(trimmed.slice(2)),
      });
      return;
    }

    // 2. Heading 2 (## ...)
    if (trimmed.startsWith('## ')) {
      flushList();
      nodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineText(trimmed.slice(3)),
      });
      return;
    }

    // 3. Blockquote (> ...)
    if (trimmed.startsWith('> ')) {
      flushList();
      nodes.push({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: parseInlineText(trimmed.slice(2)),
          },
        ],
      });
      return;
    }

    // 4. Bullet List (- ... or * ...)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentListType !== 'bulletList') {
        flushList();
        currentListType = 'bulletList';
      }
      currentListItems.push({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: parseInlineText(trimmed.slice(2)),
          },
        ],
      });
      return;
    }

    // 5. Ordered List (1. ... or 2. ...)
    if (/^\d+\.\s/.test(trimmed)) {
      if (currentListType !== 'orderedList') {
        flushList();
        currentListType = 'orderedList';
      }
      const itemText = trimmed.replace(/^\d+\.\s/, '');
      currentListItems.push({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: parseInlineText(itemText),
          },
        ],
      });
      return;
    }

    // 6. Normal Paragraph
    flushList();
    if (line !== '') {
      nodes.push({
        type: 'paragraph',
        content: parseInlineText(line),
      });
    }
  });

  flushList();

  return {
    type: 'doc',
    content: nodes.length > 0 ? (nodes as unknown as JSONEditorContent['content']) : [],
  };
}

// Parse bold (**text**) and italic (*text*) inside text strings into marks
function parseInlineText(text: string) {
  if (!text) return [];

  const parts: Array<{ type: 'text'; text: string; marks?: Array<{ type: string }> }> = [];

  // Simple parser supporting **bold** and *italic*
  const regex = /(\*\*.*?\*\*|\*.*?\*|[^*]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const chunk = match[0];
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
      parts.push({
        type: 'text',
        text: chunk.slice(2, -2),
        marks: [{ type: 'bold' }],
      });
    } else if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      parts.push({
        type: 'text',
        text: chunk.slice(1, -1),
        marks: [{ type: 'italic' }],
      });
    } else {
      parts.push({
        type: 'text',
        text: chunk,
      });
    }
  }

  return parts;
}

export default function JSONRichEditor({
  label,
  value,
  onChange,
  placeholder = 'Nhập nội dung mô tả sản phẩm...',
}: JSONRichEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'json'>('editor');
  const [copied, setCopied] = useState(false);

  // Initialize raw text from value
  const [text, setText] = useState(() => {
    if (!value || !value.content) return '';
    return extractTextFromJSON(value);
  });

  // Extract human readable text from JSON doc for editing
  function extractTextFromJSON(jsonDoc: JSONEditorContent): string {
    if (!jsonDoc || !jsonDoc.content) return '';
    return jsonDoc.content
      .map((node) => {
        if (node.type === 'heading') {
          const prefix = node.type === 'heading' ? '# ' : '';
          const str = node.content?.map((c) => c.text || '').join('') || '';
          return `${prefix}${str}`;
        }
        if (node.type === 'paragraph') {
          return node.content?.map((c) => c.text || '').join('') || '';
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  // Handle Text changes and auto-convert to JSON
  const handleTextChange = (newText: string) => {
    setText(newText);
    const jsonResult = convertTextToJSON(newText);
    onChange(jsonResult);
  };

  // Helper toolbar actions
  const applyToolbarFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (textarea && textarea.tagName === 'TEXTAREA') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = text.substring(start, end);

      const replacement = `${prefix}${selected || 'Nội dung'}${suffix}`;
      const newText = text.substring(0, start) + replacement + text.substring(end);

      handleTextChange(newText);
    } else {
      handleTextChange(`${text}\n${prefix}Nội dung mới${suffix}`);
    }
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(value || convertTextToJSON(text), null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentJSON = value || convertTextToJSON(text);

  return (
    <div className="space-y-2">
      {/* Label and Mode Switch Bar */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[#202224] flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#4880FF]" />
          {label}
        </label>

        {/* Tab switch: Visual Editor vs JSON Code Inspector */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-[#202224] shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✏️ Trình soạn thảo
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
            <span>Tự động chuyển JSON</span>
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        /* Visual Editor Box */
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#4880FF] focus-within:border-transparent transition-all shadow-sm">
          {/* Formatting Toolbar */}
          <div className="bg-gray-50/90 px-3 py-2 border-b border-gray-100 flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => applyToolbarFormat('**', '**')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100"
              title="In đậm (**text**)"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => applyToolbarFormat('*', '*')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100"
              title="In nghiêng (*text*)"
            >
              <Italic className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={() => applyToolbarFormat('# ')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100"
              title="Tiêu đề 1 (# Heading)"
            >
              <Heading1 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => applyToolbarFormat('## ')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100"
              title="Tiêu đề 2 (## Heading)"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={() => applyToolbarFormat('- ')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100"
              title="Danh sách dấu gạch đầu dòng (- Item)"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => applyToolbarFormat('1. ')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100"
              title="Danh sách đánh số (1. Item)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => applyToolbarFormat('> ')}
              className="p-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-[#4880FF] transition-all flex items-center gap-1 border border-transparent hover:border-blue-100"
              title="Trích dẫn (> Quote)"
            >
              <Quote className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={() => handleTextChange('')}
              className="p-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-1"
              title="Xóa nội dung"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#4880FF]" />
                Auto-convert to JSON
              </span>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full p-4 text-sm text-[#202224] placeholder-gray-400 focus:outline-none resize-y min-h-[120px] font-sans leading-relaxed"
          />
        </div>
      ) : (
        /* Real-time JSON Code Inspector Output */
        <div className="border border-gray-800 bg-gray-950 rounded-2xl p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-64 shadow-2xl relative group">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-green-400" />
              Real-time Generated JSON Document (TipTap Schema)
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
    </div>
  );
}
