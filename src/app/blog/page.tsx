import { HeaderNav } from '@/components/header-nav';
import { SectionHeader } from '@/components/cyber/primitives';
import { BlogCard } from '@/components/sections/blog';
import { prisma } from '@/lib/prisma';
import { isBuildPhase, type Jsonify } from '@/lib/portfolio-data';

export const revalidate = 60;

export const metadata = {
  title: 'Transmissions | Blog',
  description: 'Write-ups and notes on offensive security, CTFs and secure engineering.',
};

async function getPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, content: true, tags: true, publishedAt: true },
    });
    return JSON.parse(JSON.stringify(posts)) as Jsonify<typeof posts>;
  } catch (error) {
    if (isBuildPhase()) return [];
    throw error;
  }
}

async function getNavData() {
  try {
    const [personal, experienceCount] = await Promise.all([
      prisma.personalData.findFirst({ select: { name: true } }),
      prisma.experience.count(),
    ]);
    return { personal, hasExperience: experienceCount > 0 };
  } catch {
    return { personal: null, hasExperience: false };
  }
}

export default async function BlogIndex() {
  const [posts, { personal, hasExperience }] = await Promise.all([getPosts(), getNavData()]);
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav personalData={personal} hasExperience={hasExperience} solid />
      <main className="relative flex-1">
        <div aria-hidden className="grid-cross pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-[1440px] space-y-14 px-6 pb-28 pt-36 sm:px-10">
          <SectionHeader index={String(posts.length).padStart(2, '0')} jp="記録" eyebrow="Archive / Transmissions" title="Security Insights" subtitle="Every published write-up, newest first." />
          {posts.length === 0 ? (
            <p className="border border-dashed border-signal/40 px-6 py-16 text-center monofont text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {'// no transmissions yet'}
            </p>
          ) : (
            <div className="grid gap-px border border-signal/40 bg-signal/40 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <div key={post.id} className="bg-background">
                  <BlogCard post={post} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
