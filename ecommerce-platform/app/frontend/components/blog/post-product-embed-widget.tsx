import { PostProductItem } from '@/types/blog';
import { PostProductEmbedCard } from './post-product-embed-card';

export interface PostProductEmbedWidgetProps {
  products: PostProductItem[];
}

export const PostProductEmbedWidget = ({ products }: PostProductEmbedWidgetProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mb-10 p-6 bg-orange-50/60 border border-orange-100 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🛒</span>
        <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
          Sản phẩm được nhắc đến trong bài
        </h3>
      </div>

      <div className="space-y-4">
        {products.map((item) => (
          <PostProductEmbedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
