// ---------------------------------------------------------------------------
// Shared Global Search Types — Phase 8 Part 2
// ---------------------------------------------------------------------------

export type SearchResultType = 'user' | 'message' | 'group' | 'community' | 'channel' | 'status';

export interface SearchResultUser {
  type: 'user';
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isFriend: boolean;
  mutualFriends?: number;
}

export interface SearchResultMessage {
  type: 'message';
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  highlight?: string;
  createdAt: string;
}

export interface SearchResultGroup {
  type: 'group';
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  isMember: boolean;
  privacy: string;
}

export interface SearchResultCommunity {
  type: 'community';
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  isMember: boolean;
  privacy: string;
}

export interface SearchResultChannel {
  type: 'channel';
  _id: string;
  name: string;
  description?: string;
  groupId: string;
  groupName: string;
  memberCount: number;
  isMember: boolean;
}

export type SearchResult =
  | SearchResultUser
  | SearchResultMessage
  | SearchResultGroup
  | SearchResultCommunity
  | SearchResultChannel;

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  took: number;
  facets: {
    users: number;
    messages: number;
    groups: number;
    communities: number;
    channels: number;
  };
}

export interface SearchSuggestion {
  text: string;
  type: SearchResultType;
  id: string;
}
