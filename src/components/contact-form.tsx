'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Send, CheckCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [website, setWebsite] = useState(''); // honeypot — humans never see this field

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Please try again or contact me directly via email.');
      }

      setIsSubmitted(true);
      toast({
        title: 'Message sent successfully!',
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'Please try again or contact me directly via email.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    'peer w-full border-0 border-b border-signal/40 bg-transparent px-0 pb-2 pt-6 text-bone outline-none transition-colors placeholder:text-transparent focus:border-signal focus:ring-0';
  const labelClass =
    'pointer-events-none absolute left-0 top-0 monofont text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors peer-focus:text-signal';

  if (isSubmitted) {
    return (
      <div className="clip-notch flex min-h-[420px] flex-col items-center justify-center border border-signal/50 bg-card p-10 text-center">
        <CheckCircle className="mb-6 h-14 w-14 text-signal" />
        <h3 className="font-display text-3xl font-bold uppercase text-signal">Message Sent!</h3>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          Thank you for reaching out. I&apos;ll get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="bracket mt-8 px-5 py-3 monofont text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-ink"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="clip-notch border border-signal/50 bg-card">
      <div className="flex items-center justify-between border-b border-signal/40 px-6 py-3 monofont text-[10px] uppercase tracking-[0.3em] text-signal">
        <span>{'// Send a Message'}</span>
        <span className="flex items-center gap-2 text-cyan">
          <span className="h-1.5 w-1.5 animate-blink bg-cyan" /> aes-256
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          <div className="relative">
            <input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Name" className={fieldClass} />
            <label htmlFor="name" className={labelClass}>Name</label>
          </div>
          <div className="relative">
            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="Email" className={fieldClass} />
            <label htmlFor="email" className={labelClass}>Email</label>
          </div>
        </div>
        <div className="relative">
          <input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required placeholder="Subject" className={fieldClass} />
          <label htmlFor="subject" className={labelClass}>Subject</label>
        </div>
        <div className="relative">
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={5}
            placeholder="Tell me about your project or just say hello..."
            className={`${fieldClass} resize-none placeholder:text-muted-foreground/40`}
          />
          <label htmlFor="message" className={labelClass}>Message</label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bracket flex w-full items-center justify-center gap-3 bg-signal px-6 py-4 monofont text-xs font-bold uppercase tracking-[0.25em] text-ink transition-colors hover:bg-bone disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-b-transparent" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
