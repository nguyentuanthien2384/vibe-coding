import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TipTapDoc, TipTapNode, TipTapMark } from '@/types/tiptap';

export interface BlogContentRendererProps {
  doc: TipTapDoc;
  className?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function renderMarks(text: string, marks?: TipTapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{acc}</strong>;
      case 'italic':
        return <em>{acc}</em>;
      case 'underline':
        return <u>{acc}</u>;
      case 'strike':
        return <s className="line-through">{acc}</s>;
      case 'code':
        return (
          <code className="px-1.5 py-0.5 bg-slate-100 text-orange-600 rounded font-mono text-sm">
            {acc}
          </code>
        );
      case 'link':
        return (
          <Link
            href={mark.attrs?.href || '#'}
            target={mark.attrs?.target || '_self'}
            className="text-orange-600 hover:underline font-medium"
          >
            {acc}
          </Link>
        );
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  if (node.type === 'text') {
    return <React.Fragment key={index}>{renderMarks(node.text || '', node.marks)}</React.Fragment>;
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-slate-700 leading-relaxed text-base md:text-lg mb-5">
          {children}
        </p>
      );

    case 'heading': {
      const level = node.attrs?.level || 2;
      const textContent = node.content?.map((c) => c.text).join('') || '';
      const anchorId = slugify(textContent);

      if (level === 2) {
        return (
          <h2
            key={index}
            id={anchorId}
            className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-10 mb-4 pt-4 tracking-tight scroll-mt-24 flex items-center group"
          >
            <a href={`#${anchorId}`} className="hover:text-orange-600 transition-colors">
              {children}
            </a>
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3
            key={index}
            id={anchorId}
            className="text-xl md:text-2xl font-bold text-slate-800 mt-8 mb-3 scroll-mt-24 group"
          >
            <a href={`#${anchorId}`} className="hover:text-orange-600 transition-colors">
              {children}
            </a>
          </h3>
        );
      }
      return (
        <h4 key={index} className="text-lg font-bold text-slate-800 mt-6 mb-2">
          {children}
        </h4>
      );
    }

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-slate-700 text-base md:text-lg pl-2">
          {children}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 mb-6 text-slate-700 text-base md:text-lg pl-2">
          {children}
        </ol>
      );

    case 'listItem':
      return (
        <li key={index} className="leading-relaxed">
          {children}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="border-l-4 border-orange-500 pl-5 py-3 my-6 italic bg-orange-50/50 rounded-r-2xl text-slate-700 text-base md:text-lg"
        >
          {children}
        </blockquote>
      );

    case 'image':
      return (
        <figure key={index} className="my-8 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            <Image
              src={node.attrs?.src || ''}
              alt={node.attrs?.alt || 'Hình ảnh bài viết'}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>
          {node.attrs?.caption && (
            <figcaption className="p-3 text-center text-xs md:text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
              {node.attrs.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'horizontalRule':
      return <hr key={index} className="my-8 border-slate-200" />;

    case 'hardBreak':
      return <br key={index} />;

    default:
      return <div key={index}>{children}</div>;
  }
}

export const BlogContentRenderer = ({ doc, className = '' }: BlogContentRendererProps) => {
  if (!doc || !doc.content) return null;

  return (
    <div className={`prose-content ${className}`}>
      {doc.content.map((node, i) => renderNode(node, i))}
    </div>
  );
};
