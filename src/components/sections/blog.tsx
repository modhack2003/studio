import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { CardShell } from '@/components/card-shell';

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
    <section id="blog" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <CardShell key={post.id}>
            <div className="flex flex-col p-6">
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{post.readTime}</span>
              </div>
              <CardHeader className="p-0">
                <CardTitle className="text-base leading-snug">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-border">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  asChild
                >
                  <a href={`/blog/${post.slug}`}>
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </div>
          </CardShell>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="text-sm">
          View All Posts
        </Button>
      </div>
    </section>
  );
}
