import { logger } from '../../logger/index.js';
import { notificationEngine } from '../notification-engine/index.js';
import type { NotificationActor, NotificationTarget } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Notification trigger helpers — fire-and-forget.
// All functions swallow errors so callers are never blocked.
// ---------------------------------------------------------------------------

async function trigger(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    logger.warn('[NotificationTrigger] Failed to create notification', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ── Messages ─────────────────────────────────────────────────────────────────

export function triggerMessageReceived(opts: {
  recipientId: string;
  actor: NotificationActor;
  conversationId: string;
  messageId: string;
  messageType: string;
  preview: string;
  idempotencyKey?: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'message_received',
      category: 'messages',
      priority: 'normal',
      title: opts.actor.displayName,
      body: opts.messageType === 'text' ? opts.preview : `[${opts.messageType}]`,
      actor: opts.actor,
      target: { type: 'conversation', id: opts.conversationId },
      payload: {
        conversationId: opts.conversationId,
        messageId: opts.messageId,
        messageType: opts.messageType,
        preview: opts.preview,
      },
      idempotencyKey: opts.idempotencyKey ?? `msg:${opts.messageId}:${opts.recipientId}`,
    }),
  );
}

export function triggerMessageMention(opts: {
  recipientId: string;
  actor: NotificationActor;
  conversationId: string;
  messageId: string;
  preview: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'message_mention',
      category: 'messages',
      priority: 'high',
      title: `${opts.actor.displayName} mentioned you`,
      body: opts.preview,
      actor: opts.actor,
      target: { type: 'conversation', id: opts.conversationId },
      payload: { conversationId: opts.conversationId, messageId: opts.messageId },
      idempotencyKey: `mention:${opts.messageId}:${opts.recipientId}`,
    }),
  );
}

// ── Friends ──────────────────────────────────────────────────────────────────

export function triggerFriendRequest(opts: {
  recipientId: string;
  actor: NotificationActor;
  requestId: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'friend_request',
      category: 'social',
      priority: 'normal',
      title: 'Friend request',
      body: `${opts.actor.displayName} sent you a friend request`,
      actor: opts.actor,
      payload: { requestId: opts.requestId },
      idempotencyKey: `friend_req:${opts.requestId}:${opts.recipientId}`,
    }),
  );
}

export function triggerFriendAccepted(opts: {
  recipientId: string;
  actor: NotificationActor;
  requestId: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'friend_accepted',
      category: 'social',
      priority: 'normal',
      title: 'Friend request accepted',
      body: `${opts.actor.displayName} accepted your friend request`,
      actor: opts.actor,
      payload: { requestId: opts.requestId },
      idempotencyKey: `friend_accept:${opts.requestId}:${opts.recipientId}`,
    }),
  );
}

// ── Groups ────────────────────────────────────────────────────────────────────

export function triggerGroupInvite(opts: {
  recipientId: string;
  actor: NotificationActor;
  target: NotificationTarget;
  inviteToken?: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'group_invite',
      category: 'groups',
      priority: 'normal',
      title: `Invited to ${opts.target.name ?? 'a group'}`,
      body: `${opts.actor.displayName} invited you to join`,
      actor: opts.actor,
      target: opts.target,
      payload: { groupId: opts.target.id, inviteToken: opts.inviteToken },
      idempotencyKey: `group_invite:${opts.target.id}:${opts.recipientId}`,
    }),
  );
}

export function triggerGroupMention(opts: {
  recipientId: string;
  actor: NotificationActor;
  target: NotificationTarget;
  messageId: string;
  preview: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'group_mention',
      category: 'groups',
      priority: 'high',
      title: `${opts.actor.displayName} mentioned you in ${opts.target.name ?? 'a group'}`,
      body: opts.preview,
      actor: opts.actor,
      target: opts.target,
      payload: { groupId: opts.target.id, messageId: opts.messageId, preview: opts.preview },
      idempotencyKey: `group_mention:${opts.messageId}:${opts.recipientId}`,
    }),
  );
}

// ── Calls ────────────────────────────────────────────────────────────────────

export function triggerIncomingCall(opts: {
  recipientId: string;
  actor: NotificationActor;
  callId: string;
  conversationId: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'call_incoming',
      category: 'calls',
      priority: 'urgent',
      title: 'Incoming call',
      body: `${opts.actor.displayName} is calling you`,
      actor: opts.actor,
      target: { type: 'conversation', id: opts.conversationId },
      payload: { callId: opts.callId, conversationId: opts.conversationId },
      idempotencyKey: `call:${opts.callId}:${opts.recipientId}`,
    }),
  );
}

export function triggerMissedCall(opts: {
  recipientId: string;
  actor: NotificationActor;
  callId: string;
  callDuration?: number;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'call_missed',
      category: 'calls',
      priority: 'high',
      title: 'Missed call',
      body: `You missed a call from ${opts.actor.displayName}`,
      actor: opts.actor,
      payload: { callId: opts.callId, callDuration: opts.callDuration },
      idempotencyKey: `missed_call:${opts.callId}:${opts.recipientId}`,
    }),
  );
}

// ── Security ─────────────────────────────────────────────────────────────────

export function triggerSecurityAlert(opts: {
  recipientId: string;
  action: string;
  metadata?: Record<string, unknown>;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'security_alert',
      category: 'security',
      priority: 'urgent',
      title: 'Security alert',
      body: opts.action,
      deliveryChannels: ['in_app', 'email'],
      payload: { action: opts.action, metadata: opts.metadata },
    }),
  );
}

// ── System ───────────────────────────────────────────────────────────────────

export function triggerSystemNotification(opts: {
  recipientId: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'system',
      category: 'system',
      priority: 'low',
      title: opts.title,
      body: opts.body,
      payload: { metadata: opts.metadata },
    }),
  );
}

// ── Status ────────────────────────────────────────────────────────────────────

export function triggerStatusReaction(opts: {
  recipientId: string;
  actor: NotificationActor;
  statusId: string;
  reaction: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'status_reaction',
      category: 'social',
      priority: 'low',
      title: `${opts.actor.displayName} reacted to your status`,
      body: opts.reaction,
      actor: opts.actor,
      payload: { statusId: opts.statusId, reactionEmoji: opts.reaction },
      idempotencyKey: `status_react:${opts.statusId}:${opts.actor.userId}`,
    }),
  );
}

export function triggerStatusReply(opts: {
  recipientId: string;
  actor: NotificationActor;
  statusId: string;
  content: string;
}): void {
  void trigger(() =>
    notificationEngine.create({
      recipientId: opts.recipientId,
      type: 'status_reply',
      category: 'social',
      priority: 'high',
      title: `${opts.actor.displayName} replied to your status`,
      body: opts.content,
      actor: opts.actor,
      payload: { statusId: opts.statusId, preview: opts.content },
      idempotencyKey: `status_reply:${opts.statusId}:${opts.actor.userId}:${Date.now()}`,
    }),
  );
}
