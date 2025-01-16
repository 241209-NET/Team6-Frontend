/// <reference types="vite/client" />

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Tweet {
  id: number;
  body: string;
  likes: number;
  parentId: number | null;
  createdAt: string;
  userId: number;
  user: User;
  replies: Tweet[] | null;
  isReplied?: boolean;
}

export interface TweetProps {
  tweet: Tweet;
  currentUser: User | null;
  handleLike: (id: number) => void;
  handleDislike: (id: number) => void;
  handleDeleteTweet: (id: number) => void;
  handleUpdateTweet: (id: number, newBody: string) => void;

  setReplyParentId: (id: number | null) => void;
  handlePostReply: (parentId: number) => void;

  replyParentId: number | null;
  replyBody: string;
  setReplyBody: (body: string) => void;

  tweets: Tweet[];
  isFirst: boolean;
}

export interface TweetFeedProps {
  tweets: Tweet[];
  currentUser: User | null;

  handleLike: (id: number) => void;
  handleDislike: (id: number) => void;
  handleDeleteTweet: (id: number) => void;
  handleUpdateTweet: (id: number, newBody: string) => void;

  setReplyParentId: (id: number | null) => void;
  handlePostReply: (parentId: number) => void;

  replyParentId: number | null;
  replyBody: string;
  setReplyBody: (body: string) => void;
}
