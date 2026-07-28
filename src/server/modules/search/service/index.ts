import mongoose from 'mongoose';
import { logger } from '../../../logger/index.js';
import type {
  SearchResponse,
  SearchResult,
  SearchResultUser,
  SearchResultGroup,
  SearchResultCommunity,
  SearchResultChannel,
  SearchResultMessage,
} from '@shared/types/search.js';

// ---------------------------------------------------------------------------
// SearchService — cross-collection full-text search
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

interface SearchQueryOpts {
  q: string;
  types?: string[];
  page?: number;
  limit?: number;
  conversationId?: string;
}

export class SearchService {
  async search(userId: string, opts: SearchQueryOpts): Promise<SearchResponse> {
    const start = Date.now();
    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const q = opts.q.trim();

    if (!q) {
      return {
        query: q,
        results: [],
        total: 0,
        page,
        limit,
        hasMore: false,
        took: 0,
        facets: { users: 0, messages: 0, groups: 0, communities: 0, channels: 0 },
      };
    }

    const searchTypes = opts.types ?? ['user', 'message', 'group', 'community', 'channel'];

    const [users, messages, groups, communities, channels] = await Promise.all([
      searchTypes.includes('user') ? this.searchUsers(q, userId) : [],
      searchTypes.includes('message') ? this.searchMessages(q, userId) : [],
      searchTypes.includes('group') ? this.searchGroups(q, userId) : [],
      searchTypes.includes('community') ? this.searchCommunities(q, userId) : [],
      searchTypes.includes('channel') ? this.searchChannels(q, userId) : [],
    ]);

    const allResults: SearchResult[] = [
      ...users,
      ...groups,
      ...communities,
      ...channels,
      ...messages,
    ];

    const total = allResults.length;
    const paginatedResults = allResults.slice(skip, skip + limit);

    const took = Date.now() - start;
    logger.debug('[SearchService] Search completed', {
      query: q,
      total,
      took,
      userId,
    });

    return {
      query: q,
      results: paginatedResults,
      total,
      page,
      limit,
      hasMore: total > page * limit,
      took,
      facets: {
        users: users.length,
        messages: messages.length,
        groups: groups.length,
        communities: communities.length,
        channels: channels.length,
      },
    };
  }

  private async searchUsers(q: string, requesterId: string): Promise<SearchResultUser[]> {
    try {
      const { UserModel } = await import('../../../database/models/User.js');
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const docs = await UserModel.find({
        $or: [{ username: regex }, { displayName: regex }],
        _id: { $ne: new mongoose.Types.ObjectId(requesterId) },
        isActive: true,
      })
        .select('username')
        .limit(20)
        .lean()
        .exec();

      return docs.map((u) => ({
        type: 'user' as const,
        _id: u._id.toString(),
        username: u.username as string,
        displayName: u.username as string,
        isFriend: false,
      }));
    } catch (err) {
      logger.warn('[SearchService] User search failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  private async searchMessages(q: string, userId: string): Promise<SearchResultMessage[]> {
    try {
      const { MessageModel } = await import('../../../database/models/Message.js');
      const { ConversationMemberModel } =
        await import('../../../database/models/ConversationMember.js');

      const userOid = new mongoose.Types.ObjectId(userId);
      const memberships = await ConversationMemberModel.find({
        userId: userOid,
        leftAt: null,
      })
        .select('conversationId')
        .lean()
        .exec();

      const convIds = memberships.map((m) => m.conversationId);
      if (convIds.length === 0) return [];

      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const docs = await MessageModel.find({
        conversationId: { $in: convIds },
        content: regex,
        deletedAt: { $exists: false },
      })
        .select('conversationId senderId content createdAt')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec();

      return docs.map((m) => ({
        type: 'message' as const,
        _id: m._id.toString(),
        conversationId: m.conversationId.toString(),
        senderId: m.senderId.toString(),
        senderName: '',
        content: m.content as string,
        highlight: (m.content as string).slice(0, 150),
        createdAt: (m.createdAt as Date).toISOString(),
      }));
    } catch (err) {
      logger.warn('[SearchService] Message search failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  private async searchGroups(q: string, _userId: string): Promise<SearchResultGroup[]> {
    try {
      const { GroupModel } = await import('../../../database/models/Group.js');
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const docs = await GroupModel.find({
        $or: [{ name: regex }, { description: regex }],
        type: { $in: ['public', 'private'] },
        deletedAt: { $exists: false },
      })
        .select('name description avatar memberCount type')
        .limit(20)
        .lean()
        .exec();

      return docs.map((g) => ({
        type: 'group' as const,
        _id: g._id.toString(),
        name: g.name as string,
        description: g.description as string | undefined,
        avatar: g.avatar as string | undefined,
        memberCount: (g.memberCount as number | undefined) ?? 0,
        isMember: false,
        privacy: g.type as string,
      }));
    } catch (err) {
      logger.warn('[SearchService] Group search failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  private async searchCommunities(q: string, _userId: string): Promise<SearchResultCommunity[]> {
    try {
      const { CommunityModel } = await import('../../../database/models/Community.js');
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const docs = await CommunityModel.find({
        $or: [{ name: regex }, { description: regex }],
        deletedAt: { $exists: false },
      })
        .select('name description avatar memberCount type')
        .limit(20)
        .lean()
        .exec();

      return docs.map((c) => ({
        type: 'community' as const,
        _id: c._id.toString(),
        name: c.name as string,
        description: c.description as string | undefined,
        avatar: c.avatar as string | undefined,
        memberCount: (c.memberCount as number | undefined) ?? 0,
        isMember: false,
        privacy: c.type as string,
      }));
    } catch (err) {
      logger.warn('[SearchService] Community search failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  private async searchChannels(q: string, _userId: string): Promise<SearchResultChannel[]> {
    try {
      const { ChannelModel } = await import('../../../database/models/Channel.js');
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const docs = await ChannelModel.find({
        $or: [{ name: regex }, { description: regex }],
      })
        .select('name description groupId')
        .populate('groupId', 'name')
        .limit(20)
        .lean()
        .exec();

      return docs.map((ch) => {
        const group = ch.groupId as unknown as { _id: unknown; name: string } | undefined;
        return {
          type: 'channel' as const,
          _id: ch._id.toString(),
          name: ch.name as string,
          description: ch.description as string | undefined,
          groupId: group?._id?.toString() ?? '',
          groupName: group?.name ?? '',
          memberCount: 0,
          isMember: false,
        };
      });
    } catch (err) {
      logger.warn('[SearchService] Channel search failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  async getSuggestions(userId: string, q: string): Promise<string[]> {
    try {
      const { UserModel } = await import('../../../database/models/User.js');
      const regex = new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const users = await UserModel.find({
        username: regex,
        isActive: true,
        _id: { $ne: new mongoose.Types.ObjectId(userId) },
      })
        .select('username')
        .limit(5)
        .lean()
        .exec();

      return users.map((u) => u.username as string);
    } catch {
      return [];
    }
  }
}

export const searchService = new SearchService();
