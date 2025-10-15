import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import PixelCard from '../pixel-card';
import { AnimatedTitle } from '@/components/animated-title';

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
    <section id="blog" className="space-y-12">
      <div className="text-center">
        <AnimatedTitle title="Security Insights" />
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          My thoughts on cybersecurity trends, methodologies, and best practices.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <PixelCard key={post.id}>
            <div className="bg-transparent p-6 rounded-sm h-full flex flex-col">
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  <Clock className="h-3 w-3 ml-2" />
                  <span>{post.readTime}</span>
                </div>
                <CardTitle className="font-code text-primary text-lg leading-tight">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between p-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-code bg-primary/10 text-primary text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-accent hover:text-glow-accent self-start"
                  asChild
                >
                  <a href={`/blog/${post.slug}`}>
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </div>
          </PixelCard>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          View All Posts
        </Button>
      </div>
    </section>
  );
}
