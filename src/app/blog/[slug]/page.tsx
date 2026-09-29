import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { HeaderNav } from '@/components/header-nav';
import { Markdown } from '@/lib/markdown';
import { prisma } from '@/lib/prisma';
import { isBuildPhase, readTime } from '@/lib/portfolio-data';

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  try {
    return await prisma.blogPost.findFirst({ where: { slug, published: true } });
  } catch (error) {
    if (isBuildPhase()) return null;
    throw error;
  }
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not found' };
  return { title: `${post.title} | Blog`, description: post.excerpt || undefined };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, personal, experienceCount] = await Promise.all([
    getPost(slug),
    prisma.personalData.findFirst({ select: { name: true } }).catch(() => null),
    prisma.experience.count().catch(() => 0),
  ]);
  const hasExperience = experienceCount > 0;
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav personalData={personal} hasExperience={hasExperience} solid />
      <main className="relative flex-1">
        <div aria-hidden className="grid-cross pointer-events-none absolute inset-0 opacity-40" />
        <article className="relative mx-auto max-w-3xl px-6 pb-28 pt-36 sm:px-10">
          <Link href="/blog" className="inline-flex items-center gap-2 monofont text-[11px] uppercase tracking-[0.25em] text-signal hover:text-bone">
            <ArrowLeft className="h-3.5 w-3.5" /> All transmissions
          </Link>

          <header className="mt-8 border-b border-signal/40 pb-8">
            <p className="monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {post.publishedAt?.toLocaleDateString('en-US', { dateStyle: 'long' })} · {readTime(post.content)}
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] text-bone sm:text-6xl">{post.title}</h1>
            {post.excerpt && <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>}
            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="border border-signal/40 px-2 py-0.5 monofont text-[10px] uppercase tracking-wider text-bone/80">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="mt-10">
            <Markdown source={post.content || post.excerpt} />
          </div>
        </article>
      </main>
    </div>
  );
}
