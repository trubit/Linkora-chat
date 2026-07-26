import { z } from 'zod';

const STATUS_TYPES = ['text', 'image', 'video', 'voice', 'link'] as const;
const STATUS_PRIVACY = ['all_contacts', 'contacts_except', 'only_share_with'] as const;

const mediaItemSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  mimeType: z.string().min(1).max(100),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  size: z.number().positive().optional(),
});

const linkPreviewSchema = z.object({
  url: z.string().url(),
  title: z.string().max(300).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  siteName: z.string().max(100).optional(),
});

export const createStatusSchema = z
  .object({
    type: z.enum(STATUS_TYPES),
    content: z.string().max(700).optional(),
    backgroundColor: z.string().max(20).optional(),
    font: z.string().max(50).optional(),
    media: mediaItemSchema.optional(),
    linkPreview: linkPreviewSchema.optional(),
    privacy: z.enum(STATUS_PRIVACY).default('all_contacts'),
    allowedUserIds: z.array(z.string()).max(500).optional(),
    excludedUserIds: z.array(z.string()).max(500).optional(),
    allowReplies: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'text' && !data.content) {
      ctx.addIssue({ code: 'custom', message: 'content is required for text status', path: ['content'] });
    }
    if ((data.type === 'image' || data.type === 'video' || data.type === 'voice') && !data.media) {
      ctx.addIssue({ code: 'custom', message: 'media is required for this status type', path: ['media'] });
    }
    if (data.type === 'link' && !data.linkPreview?.url) {
      ctx.addIssue({ code: 'custom', message: 'linkPreview.url is required for link status', path: ['linkPreview'] });
    }
  });

export const reactToStatusSchema = z.object({
  reaction: z.string().min(1).max(10),
});

export const replyToStatusSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const getStatusViewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type ReactToStatusInput = z.infer<typeof reactToStatusSchema>;
export type ReplyToStatusInput = z.infer<typeof replyToStatusSchema>;
export type GetStatusViewsInput = z.infer<typeof getStatusViewsSchema>;
