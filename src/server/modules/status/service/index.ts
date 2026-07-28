import { logger } from '../../../logger/index.js';
import { statusRepository } from '../repository/index.js';
import type { IStatusUpdate } from '../../../database/models/StatusUpdate.js';
import type { IStatusView } from '../../../database/models/StatusView.js';
import type { CreateStatusInput } from '../validator/index.js';
import type { StatusSummary, StatusGroupSummary, StatusViewSummary } from '@shared/types/status.js';

// ---------------------------------------------------------------------------
// Friend/contact lookup helper — import lazily to avoid circular deps
// ---------------------------------------------------------------------------

async function getFriendIds(userId: string): Promise<string[]> {
  try {
    const { FriendshipModel } = await import('../../../database/models/Friendship.js');
    const { default: mn } = await import('mongoose');
    const oid = new mn.Types.ObjectId(userId);
    const friendships = await FriendshipModel.find({
      $or: [{ user1Id: oid }, { user2Id: oid }],
    })
      .select('user1Id user2Id')
      .lean()
      .exec();

    return friendships.map((f) => {
      const uid = String(f.user1Id);
      const fid = String(f.user2Id);
      return uid === userId ? fid : uid;
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toSummary(doc: IStatusUpdate, viewedByMe: boolean, myReaction?: string): StatusSummary {
  return {
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    author: {
      userId: doc.userId.toString(),
      username: '',
      displayName: '',
    },
    type: doc.type,
    content: doc.content,
    backgroundColor: doc.backgroundColor,
    font: doc.font,
    media: doc.media,
    linkPreview: doc.linkPreview,
    privacy: doc.privacy,
    viewsCount: doc.viewsCount,
    reactionsCount: doc.reactionsCount,
    viewedByMe,
    myReaction,
    allowReplies: doc.allowReplies,
    expiresAt: doc.expiresAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };
}

function toViewSummary(doc: IStatusView): StatusViewSummary {
  const viewerDoc = (
    doc as unknown as { viewerId: { _id: unknown; username: string; displayName: string } }
  ).viewerId;
  return {
    _id: doc._id.toString(),
    statusId: doc.statusId.toString(),
    viewer: {
      userId:
        typeof viewerDoc === 'object' && viewerDoc !== null
          ? (viewerDoc._id?.toString() ?? doc.viewerId.toString())
          : doc.viewerId.toString(),
      username:
        typeof viewerDoc === 'object' && viewerDoc !== null ? (viewerDoc.username ?? '') : '',
      displayName:
        typeof viewerDoc === 'object' && viewerDoc !== null ? (viewerDoc.displayName ?? '') : '',
    },
    reaction: doc.reaction,
    viewedAt: doc.viewedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// StatusService
// ---------------------------------------------------------------------------

export class StatusService {
  async createStatus(userId: string, dto: CreateStatusInput): Promise<StatusSummary> {
    const doc = await statusRepository.create(userId, dto);
    const summary = toSummary(doc, false);
    logger.debug('[StatusService] Status created', { statusId: doc._id.toString(), userId });
    return summary;
  }

  async getMyStatuses(userId: string): Promise<StatusSummary[]> {
    const docs = await statusRepository.findByUserId(userId);
    return docs.map((d) => toSummary(d, true));
  }

  async getStatus(requesterId: string, statusId: string): Promise<StatusSummary> {
    const doc = await statusRepository.findById(statusId);
    if (!doc) {
      throw Object.assign(new Error('Status not found or expired'), {
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    // Privacy check
    const isOwner = doc.userId.toString() === requesterId;
    if (!isOwner) {
      if (doc.privacy === 'only_share_with') {
        const allowed = doc.allowedUsers.map((id) => id.toString());
        if (!allowed.includes(requesterId)) {
          throw Object.assign(new Error('Access denied'), { statusCode: 403, code: 'FORBIDDEN' });
        }
      } else if (doc.privacy === 'contacts_except') {
        const excluded = doc.excludedUsers.map((id) => id.toString());
        if (excluded.includes(requesterId)) {
          throw Object.assign(new Error('Access denied'), { statusCode: 403, code: 'FORBIDDEN' });
        }
      }
    }

    return toSummary(doc, isOwner);
  }

  // Get feed: statuses from all contacts, grouped by user
  async getFeed(userId: string): Promise<StatusGroupSummary[]> {
    const friendIds = await getFriendIds(userId);

    // Include own statuses at the front
    const allUserIds = [userId, ...friendIds];
    const docs = await statusRepository.findByUserIds(allUserIds);

    // Fetch user profiles for author display names & avatars
    const { UserModel } = await import('../../../database/models/User.js');
    const { ProfileModel } = await import('../../../database/models/Profile.js');
    const { default: mn } = await import('mongoose');
    const objectIds = allUserIds.map((id) => new mn.Types.ObjectId(id));

    const users = await UserModel.find({ _id: { $in: objectIds } }, { _id: 1, username: 1 })
      .lean()
      .exec();
    const profiles = await ProfileModel.find(
      { userId: { $in: objectIds } },
      { userId: 1, displayName: 1, 'avatar.url': 1 },
    )
      .lean()
      .exec();

    const usernameMap = new Map(users.map((u) => [u._id.toString(), u.username]));
    const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    // Group by userId
    const grouped = new Map<string, IStatusUpdate[]>();
    for (const doc of docs) {
      const uid = doc.userId.toString();
      if (!grouped.has(uid)) grouped.set(uid, []);
      grouped.get(uid)!.push(doc);
    }

    const result: StatusGroupSummary[] = [];
    for (const [uid, statuses] of grouped.entries()) {
      const latest = statuses[0]!;
      const username = usernameMap.get(uid) ?? 'user';
      const profile = profileMap.get(uid);
      result.push({
        userId: uid,
        author: {
          userId: uid,
          username,
          displayName: profile?.displayName ?? username,
          avatar: profile?.avatar?.url,
        },
        statuses: statuses.map((s) => toSummary(s, uid === userId)),
        latestAt: latest.createdAt.toISOString(),
        hasUnseen: uid !== userId,
      });
    }

    // Own statuses first
    result.sort((a) => (a.userId === userId ? -1 : 1));

    return result;
  }

  async viewStatus(viewerId: string, statusId: string): Promise<{ isNew: boolean }> {
    const doc = await statusRepository.findById(statusId);
    if (!doc) {
      throw Object.assign(new Error('Status not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    if (doc.userId.toString() === viewerId) {
      return { isNew: false };
    }

    const { isNew } = await statusRepository.recordView(statusId, doc.userId.toString(), viewerId);
    return { isNew };
  }

  async reactToStatus(viewerId: string, statusId: string, reaction: string): Promise<void> {
    const doc = await statusRepository.findById(statusId);
    if (!doc) {
      throw Object.assign(new Error('Status not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }
    await statusRepository.recordReaction(statusId, doc.userId.toString(), viewerId, reaction);

    // Notify status owner (non-blocking)
    const ownerId = doc.userId.toString();
    if (ownerId !== viewerId) {
      import('../../../lib/notification-triggers/index.js')
        .then(({ triggerStatusReaction }) => {
          triggerStatusReaction({
            recipientId: ownerId,
            actor: { userId: viewerId, username: '', displayName: '' },
            statusId,
            reaction,
          });
        })
        .catch(() => {});
    }
  }

  async getStatusViews(
    ownerId: string,
    statusId: string,
    opts: { page: number; limit: number },
  ): Promise<{ views: StatusViewSummary[]; total: number }> {
    const doc = await statusRepository.findById(statusId);
    if (!doc || doc.userId.toString() !== ownerId) {
      throw Object.assign(new Error('Status not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    const { views, total } = await statusRepository.getViews(statusId, opts);
    return { views: views.map(toViewSummary), total };
  }

  async replyToStatus(senderId: string, statusId: string, content: string): Promise<void> {
    const doc = await statusRepository.findById(statusId);
    if (!doc) {
      throw Object.assign(new Error('Status not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    if (!doc.allowReplies) {
      throw Object.assign(new Error('Replies are disabled for this status'), {
        statusCode: 403,
        code: 'REPLIES_DISABLED',
      });
    }

    const ownerId = doc.userId.toString();
    await statusRepository.createReply(statusId, ownerId, senderId, content);

    // Notify status owner & create DM message in chat room
    if (ownerId !== senderId) {
      try {
        const { triggerStatusReply } = await import('../../../lib/notification-triggers/index.js');
        const { UserModel } = await import('../../../database/models/User.js');
        const { ProfileModel } = await import('../../../database/models/Profile.js');

        const senderUser = await UserModel.findById(senderId, { username: 1 }).lean().exec();
        const senderProfile = await ProfileModel.findOne({ userId: senderId }, { displayName: 1 })
          .lean()
          .exec();

        const senderName = senderProfile?.displayName ?? senderUser?.username ?? 'Someone';

        triggerStatusReply({
          recipientId: ownerId,
          actor: {
            userId: senderId,
            username: senderUser?.username ?? '',
            displayName: senderName,
          },
          statusId,
          content,
        });

        // Send status reply directly into the 1-on-1 DM chat room
        const { ConversationRepository } = await import('../../conversations/repository/index.js');
        const { MessageRepository } = await import('../../messages/repository/index.js');

        const convRepo = new ConversationRepository();
        const msgRepo = new MessageRepository();

        let conv = await convRepo.findDirect(senderId, ownerId);
        if (!conv) {
          conv = await convRepo.createDirect(senderId, ownerId);
        }

        if (conv) {
          const previewText = doc.content ? `"${doc.content.slice(0, 35)}..."` : 'Status update';
          const msgContent = `📷 Status Reply to ${previewText}:\n${content}`;
          await msgRepo.create({
            conversationId: conv._id.toString(),
            senderId,
            content: msgContent,
            type: 'text',
          });
        }
      } catch (err) {
        logger.warn('[StatusService] Failed to notify/post status reply', { error: err });
      }
    }
  }

  async deleteStatus(userId: string, statusId: string): Promise<void> {
    const deleted = await statusRepository.softDelete(userId, statusId);
    if (!deleted) {
      throw Object.assign(new Error('Status not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }
  }
}

export const statusService = new StatusService();
