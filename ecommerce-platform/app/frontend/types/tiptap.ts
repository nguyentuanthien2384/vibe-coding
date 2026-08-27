export type TipTapNodeType =
  | 'doc'
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'listItem'
  | 'blockquote'
  | 'image'
  | 'horizontalRule'
  | 'hardBreak'
  | 'text';

export interface TipTapMark {
  type: 'bold' | 'italic' | 'strike' | 'underline' | 'link' | 'code' | 'highlight';
  attrs?: {
    href?: string;
    target?: string;
    color?: string;
  };
}

export interface TipTapNodeAttrs {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  src?: string;
  alt?: string;
  title?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  caption?: string;
}

export interface TipTapNode {
  type: TipTapNodeType;
  attrs?: TipTapNodeAttrs;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapDoc {
  type: 'doc';
  content: TipTapNode[];
}
