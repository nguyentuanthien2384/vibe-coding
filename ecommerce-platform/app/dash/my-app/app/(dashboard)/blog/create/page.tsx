import BlogFormContainer from '../../../../features/blog/components/form/blog-form-container';

export const metadata = {
  title: 'Viết bài mới | Admin Dashboard',
  description: 'Soạn thảo và xuất bản bài viết blog mới trên TechBite',
};

export default function CreateBlogPage() {
  return <BlogFormContainer mode="create" />;
}
