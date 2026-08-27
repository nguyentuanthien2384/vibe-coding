import { PenSquare } from 'lucide-react';
import { JSONEditorContent } from '../../../../products/types/product.types';
import JSONRichEditor from '../../../../products/components/rich-editor/json-rich-editor';
import { TipTapDoc } from '../../../types/tiptap.types';

interface BlogEditorSectionProps {
  content: TipTapDoc | null;
  onChange: (doc: TipTapDoc) => void;
}

export default function BlogEditorSection({ content, onChange }: BlogEditorSectionProps) {
  // TipTapDoc is structurally compatible with JSONEditorContent
  const handleChange = (val: JSONEditorContent) => {
    onChange(val as unknown as TipTapDoc);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <PenSquare className="w-4 h-4 text-[#4880FF]" />
        </div>
        <h2 className="text-sm font-bold text-[#202224]">Nội dung bài viết</h2>
      </div>

      {/* Reuse existing JSONRichEditor from products feature */}
      <JSONRichEditor
        label=""
        value={content as unknown as JSONEditorContent | null}
        onChange={handleChange}
        placeholder="Bắt đầu viết nội dung bài viết của bạn..."
      />
    </div>
  );
}
