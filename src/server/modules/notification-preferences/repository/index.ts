import mongoose from 'mongoose';
import {
  NotificationPreferenceModel,
  type INotificationPreference,
} from '../../../database/models/NotificationPreference.js';
import type { UpdatePreferencesInput } from '../validator/index.js';

export class NotificationPreferenceRepository {
  async findOrCreate(userId: string): Promise<INotificationPreference> {
    const oid = new mongoose.Types.ObjectId(userId);
    let doc = await NotificationPreferenceModel.findOne({ userId: oid }).exec();
    if (!doc) {
      doc = await NotificationPreferenceModel.create({ userId: oid });
    }
    return doc;
  }

  async findByUserId(userId: string): Promise<INotificationPreference | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    return NotificationPreferenceModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  }

  async update(userId: string, input: UpdatePreferencesInput): Promise<INotificationPreference> {
    const oid = new mongoose.Types.ObjectId(userId);

    // Build flat $set / $unset
    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, unknown> = {};

    if (input.globalEnabled !== undefined) setFields['globalEnabled'] = input.globalEnabled;
    if (input.language !== undefined) setFields['language'] = input.language;
    if (input.timezone !== undefined) setFields['timezone'] = input.timezone;

    if (input.mutedUntil === null) {
      unsetFields['mutedUntil'] = '';
    } else if (input.mutedUntil !== undefined) {
      setFields['mutedUntil'] = new Date(input.mutedUntil);
    }

    if (input.doNotDisturb) {
      for (const [k, v] of Object.entries(input.doNotDisturb)) {
        if (v !== undefined) setFields[`doNotDisturb.${k}`] = v;
      }
    }

    if (input.categories) {
      for (const [cat, catPref] of Object.entries(input.categories)) {
        if (!catPref) continue;
        for (const [k, v] of Object.entries(catPref)) {
          if (v !== undefined && k !== 'channels') {
            setFields[`categories.${cat}.${k}`] = v;
          }
        }
        if (catPref.channels) {
          for (const [ch, val] of Object.entries(catPref.channels)) {
            if (val !== undefined) setFields[`categories.${cat}.channels.${ch}`] = val;
          }
        }
      }
    }

    const updateOp: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) updateOp['$set'] = setFields;
    if (Object.keys(unsetFields).length > 0) updateOp['$unset'] = unsetFields;

    const doc = await NotificationPreferenceModel.findOneAndUpdate({ userId: oid }, updateOp, {
      new: true,
      upsert: true,
    }).exec();

    return doc!;
  }

  async muteEntity(
    userId: string,
    type: 'conversation' | 'group' | 'community' | 'channel',
    entityId: string,
  ): Promise<INotificationPreference> {
    const oid = new mongoose.Types.ObjectId(userId);
    const entityOid = new mongoose.Types.ObjectId(entityId);

    const fieldMap: Record<string, string> = {
      conversation: 'mutedConversations',
      group: 'mutedGroups',
      community: 'mutedCommunities',
      channel: 'mutedChannels',
    };

    const doc = await NotificationPreferenceModel.findOneAndUpdate(
      { userId: oid },
      { $addToSet: { [fieldMap[type]!]: entityOid } },
      { new: true, upsert: true },
    ).exec();

    return doc!;
  }

  async unmuteEntity(
    userId: string,
    type: 'conversation' | 'group' | 'community' | 'channel',
    entityId: string,
  ): Promise<INotificationPreference> {
    const oid = new mongoose.Types.ObjectId(userId);
    const entityOid = new mongoose.Types.ObjectId(entityId);

    const fieldMap: Record<string, string> = {
      conversation: 'mutedConversations',
      group: 'mutedGroups',
      community: 'mutedCommunities',
      channel: 'mutedChannels',
    };

    const doc = await NotificationPreferenceModel.findOneAndUpdate(
      { userId: oid },
      { $pull: { [fieldMap[type]!]: entityOid } },
      { new: true, upsert: true },
    ).exec();

    return doc!;
  }

  async resetToDefaults(userId: string): Promise<INotificationPreference> {
    const oid = new mongoose.Types.ObjectId(userId);
    await NotificationPreferenceModel.deleteOne({ userId: oid }).exec();
    return this.findOrCreate(userId);
  }
}

export const notificationPreferenceRepository = new NotificationPreferenceRepository();
