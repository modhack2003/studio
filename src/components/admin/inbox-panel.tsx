'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, RefreshCw, Reply, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { api, errorMessage } from './api-client';
import { Btn, EmptyState, Panel, formatDate } from './ui';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function InboxPanel({ onUnreadChange }: { onUnreadChange?: (n: number) => void }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await api<Message[]>('/api/messages'));
    } catch (e) {
      toast({ title: 'Could not load messages', description: errorMessage(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    onUnreadChange?.(messages.filter((m) => !m.read).length);
  }, [messages, onUnreadChange]);

  const setRead = async (m: Message, read: boolean) => {
    try {
      await api(`/api/messages/${m.id}`, { method: 'PATCH', body: { read } });
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read } : x)));
    } catch (e) {
      toast({ title: 'Not updated', description: errorMessage(e), variant: 'destructive' });
    }
  };

  const toggle = (m: Message) => {
    setOpen(open === m.id ? null : m.id);
    if (!m.read) setRead(m, true);
  };

  const remove = async (m: Message) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await api(`/api/messages/${m.id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e) {
      toast({ title: 'Not deleted', description: errorMessage(e), variant: 'destructive' });
    }
  };

  return (
    <Panel
      title="Inbox"
      description="Messages sent through the contact form on your site."
      actions={
        <Btn variant="ghost" size="sm" onClick={load} aria-label="Reload">
          <RefreshCw className="h-3.5 w-3.5" />
        </Btn>
      }
    >
      {loading ? (
        <p className="py-8 text-center monofont text-xs uppercase tracking-[0.3em] text-muted-foreground">loading…</p>
      ) : messages.length === 0 ? (
        <EmptyState>No messages yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-signal/20 border-y border-signal/20">
          {messages.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => toggle(m)} className="flex w-full items-start gap-3 py-3 text-left">
                {m.read ? <MailOpen className="mt-0.5 h-4 w-4 text-muted-foreground" /> : <Mail className="mt-0.5 h-4 w-4 text-signal" />}
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm', m.read ? 'text-bone/80' : 'font-semibold text-bone')}>{m.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.name} · {m.email}
                  </p>
                </div>
                <span className="shrink-0 monofont text-[10px] text-muted-foreground">{formatDate(m.createdAt, { dateStyle: 'short', timeStyle: 'short' })}</span>
              </button>
              {open === m.id && (
                <div className="mb-3 border border-signal/30 bg-ink/60 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-bone/90">{m.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                      className="inline-flex items-center gap-2 bg-signal px-3 py-1.5 monofont text-[10px] uppercase tracking-[0.18em] text-ink hover:bg-bone"
                    >
                      <Reply className="h-3.5 w-3.5" /> Reply
                    </a>
                    <Btn variant="outline" size="sm" onClick={() => setRead(m, !m.read)}>
                      Mark {m.read ? 'unread' : 'read'}
                    </Btn>
                    <Btn variant="danger" size="sm" onClick={() => remove(m)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Btn>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
