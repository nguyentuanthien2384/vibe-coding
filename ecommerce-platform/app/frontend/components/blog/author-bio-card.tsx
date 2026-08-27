import Image from 'next/image';
import { AuthorSummary } from '@/types/blog';

export interface AuthorBioCardProps {
  author: AuthorSummary;
}

export const AuthorBioCard = ({ author }: AuthorBioCardProps) => {
  return (
    <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
      {/* Avatar */}
      {author.avatarUrl && (
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
          <Image
            src={author.avatarUrl}
            alt={author.fullName}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}

      {/* Details */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <h3 className="text-base font-bold text-slate-900">{author.fullName}</h3>
          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-700">
            {author.role}
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {author.bio ||
            'Kỹ sư phần mềm & Cây bút nội dung tại TechBite. Đam mê chia sẻ các giải pháp nâng cao hiệu suất làm việc và lối sống lành mạnh cho giới IT.'}
        </p>
      </div>
    </div>
  );
};
