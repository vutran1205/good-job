import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notification.store';

interface UserRef { id: string; name: string }
interface Media { id: string; type: string; url: string; status: string }
interface Reaction { id: string; emoji: string; user: UserRef }
interface Comment { id: string; text?: string; mediaUrl?: string; user: UserRef; createdAt: string }
export interface KudoItem {
  id: string;
  points: number;
  description: string;
  tag: string;
  createdAt: string;
  sender: UserRef;
  recipient: UserRef;
  media: Media[];
  reactions: Reaction[];
  comments: Comment[];
}

async function fetchFeedPage({ pageParam }: { pageParam: string | undefined }) {
  const params = new URLSearchParams({ limit: '20' });
  if (pageParam) params.set('cursor', pageParam);
  const { data } = await api.get(`/api/kudos?${params}`);
  return data as { items: KudoItem[]; nextCursor: string | null };
}

export function useKudosFeed() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const showNotification = useNotificationStore((s) => s.show);

  const query = useInfiniteQuery({
    queryKey: ['kudos-feed'],
    queryFn: fetchFeedPage,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
      queryClient.invalidateQueries({ queryKey: ['kudos-feed'] });

      try {
        const msg = JSON.parse(event.data as string);
        // kudo:created has a recipient field — other events do not
        if (msg.recipient?.id && msg.recipient.id === currentUserId) {
          queryClient.invalidateQueries({ queryKey: ['me'] });
          showNotification(`🎉 You received ${msg.points} pts from ${msg.sender?.name}!`);
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => ws.close();
  }, [queryClient, currentUserId, showNotification]);

  return query;
}
