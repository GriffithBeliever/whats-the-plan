// src/types/social.ts
export type User = {
  id: string;
  name: string;
  username: string;
  phone: string;
  bio: string;
  avatarEmoji: string;
  avatarGradient: [string, string];
  bannerGradient: [string, string];
};

export type ChatMessage = {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderEmoji: string;
  text: string;
  createdAt: string; // ISO string
};

export type Group = {
  id: string;
  planId: string;
  messages: ChatMessage[];
};
