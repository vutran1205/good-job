export interface UserRef {
  id: string;
  name: string;
}

export interface Media {
  id: string;
  type: string;
  url: string;
  status: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  user: UserRef;
}

export interface Comment {
  id: string;
  text?: string;
  mediaUrl?: string;
  user: UserRef;
  createdAt: string;
  reactions: Reaction[];
}

export interface KudoData {
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
