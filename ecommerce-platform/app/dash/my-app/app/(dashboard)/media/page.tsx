import { Metadata } from 'next';
import MediaPageClient from '@/features/media/components/media-page-client';

export const metadata: Metadata = {
  title: 'Quản lý Media | Admin Dashboard',
  description: 'Quản lý kho hình ảnh, tải lên và chỉnh sửa tệp media của hệ thống',
};

export default function MediaPage() {
  return <MediaPageClient />;
}
