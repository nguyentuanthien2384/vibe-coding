import BlogFormContainer from '../../../../../features/blog/components/form/blog-form-container';

export const metadata = {
  title: 'Chỉnh sửa bài viết | Admin Dashboard',
  description: 'Chỉnh sửa và cập nhật bài viết blog trên TechBite',
};

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  return <BlogFormContainer mode="edit" postId={Number(id)} />;
}
