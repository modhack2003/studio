import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/cyber/primitives';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  slug: string;
}

// Sample blog posts - in a real app, these would come from a CMS or database
const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding Modern Penetration Testing Methodologies',
    excerpt: 'A comprehensive guide to modern penetration testing approaches, from reconnaissance to reporting, with real-world examples and best practices.',
    content: '',
    author: 'Bikram Dey',
    publishedAt: '2024-01-15',
    readTime: '8 min read',
    tags: ['Penetration Testing', 'Security', 'Methodology'],
    slug: 'modern-penetration-testing-methodologies'
  },
  {
    id: '2',
    title: 'Building Secure Web Applications: A Developer\'s Guide',
    excerpt: 'Essential security practices every web developer should implement to protect their applications from common vulnerabilities.',
    content: '',
    author: 'Bikram Dey',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    tags: ['Web Security', 'OWASP', 'Development'],
    slug: 'secure-web-applications-developer-guide'
  },
  {
    id: '3',
    title: 'IoT Security: Protecting Connected Devices',
    excerpt: 'An analysis of IoT security challenges and practical solutions for securing connected devices in enterprise environments.',
    content: '',
    author: 'Bikram Dey',
    publishedAt: '2024-01-05',
    readTime: '10 min read',
    tags: ['IoT Security', 'Network Security', 'Vulnerability Assessment'],
    slug: 'iot-security-protecting-connected-devices'
  }
];

export function BlogSection() {
  return (
    <section className="grid gap-px border border-signal/40 bg-signal/40 md:grid-cols-3">
      {blogPosts.map((post, i) => (
        <Reveal key={post.id} delay={i * 0.1} className="bg-background">
          <a
            href={`/blog/${post.slug}`}
            className="group relative flex h-full min-h-[380px] flex-col overflow-hidden p-6 transition-colors duration-500 hover:bg-signal hover:text-ink"
          >
            <div className="flex items-center justify-between monofont text-[10px] uppercase tracking-[0.3em] text-signal group-hover:text-ink">
              <span>TX-{String(i + 1).padStart(3, '0')}</span>
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>

            <span aria-hidden className="mt-6 font-display text-[6rem] font-bold leading-none text-outline-red transition-all duration-500 group-hover:text-outline-ink group-hover:tracking-widest">
              {String(i + 1).padStart(2, '0')}
            </span>

            <h3 className="mt-4 font-display text-2xl font-bold uppercase leading-tight text-bone group-hover:text-ink">{post.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-ink/80">{post.excerpt}</p>

            <div className="mt-auto pt-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="border border-signal/40 px-2 py-0.5 monofont text-[10px] uppercase tracking-wider group-hover:border-ink/50">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-signal/30 pt-4 monofont text-[11px] uppercase tracking-[0.2em] group-hover:border-ink/40">
                <span>{post.readTime}</span>
                <span className="flex items-center gap-1">
                  Read More <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </a>
        </Reveal>
      ))}
    </section>
  );
}
