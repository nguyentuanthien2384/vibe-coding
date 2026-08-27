import { BlogPostListItem } from '@/types/blog';
import { HeroFeaturedPostCard } from './hero-featured-post-card';
import { SecondaryFeaturedPostCard } from './secondary-featured-post-card';

export interface BlogHeroSectionProps {
  heroPost: BlogPostListItem;
  secondaryPosts: BlogPostListItem[];
}

export const BlogHeroSection = ({ heroPost, secondaryPosts }: BlogHeroSectionProps) => {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Col Left (Featured 1): 7 cols desktop */}
        <div className="col-span-12 lg:col-span-7 h-full">
          <HeroFeaturedPostCard post={heroPost} />
        </div>

        {/* Col Right (Featured 2 & 3): 5 cols desktop */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 h-full">
          {secondaryPosts.map((post) => (
            <SecondaryFeaturedPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};
