import type {
  StatusSummary,
  StatusGroupSummary,
  StatusViewSummary,
  StatusType,
  StatusPrivacy,
} from '@shared/types/status.js';

export type { StatusSummary, StatusGroupSummary, StatusViewSummary };

export interface CreateStatusDto {
  type: StatusType;
  content?: string;
  backgroundColor?: string;
  font?: string;
  media?: {
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
  };
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
  };
  privacy?: StatusPrivacy;
  allowedUserIds?: string[];
  excludedUserIds?: string[];
  allowReplies?: boolean;
}

export interface ReactToStatusDto {
  reaction: string;
}

export interface ReplyToStatusDto {
  content: string;
}

export interface GetStatusesQuery {
  page?: number;
  limit?: number;
}
