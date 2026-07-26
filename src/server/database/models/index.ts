// ---------------------------------------------------------------------------
// MongoDB Models — barrel export
// ---------------------------------------------------------------------------

export { UserModel } from './User.js';
export type { IUser } from './User.js';

export { ProfileModel } from './Profile.js';
export type { IProfile } from './Profile.js';

export { SessionModel } from './Session.js';
export type { ISession } from './Session.js';

export { DeviceModel } from './Device.js';
export type { IDevice } from './Device.js';

export { RefreshTokenModel } from './RefreshToken.js';
export type { IRefreshToken } from './RefreshToken.js';

export { VerificationTokenModel } from './VerificationToken.js';
export type { IVerificationToken } from './VerificationToken.js';

export { PasswordResetTokenModel } from './PasswordResetToken.js';
export type { IPasswordResetToken } from './PasswordResetToken.js';

export { UserPreferencesModel } from './UserPreferences.js';
export type { IUserPreferences } from './UserPreferences.js';

export { SecurityLogModel } from './SecurityLog.js';
export type { ISecurityLog, SecurityEventType } from './SecurityLog.js';

export { AuditLogModel } from './AuditLog.js';
export type { IAuditLog } from './AuditLog.js';

export { ContactModel } from './Contact.js';
export type { IContact } from './Contact.js';

export { FriendRequestModel } from './FriendRequest.js';
export type { IFriendRequest } from './FriendRequest.js';

export { FriendshipModel } from './Friendship.js';
export type { IFriendship } from './Friendship.js';

export { BlockedUserModel } from './BlockedUser.js';
export type { IBlockedUser } from './BlockedUser.js';

export { MutedUserModel } from './MutedUser.js';
export type { IMutedUser } from './MutedUser.js';

export { PresenceModel } from './Presence.js';
export type { IPresence } from './Presence.js';

export { PrivacySettingModel } from './PrivacySetting.js';
export type { IPrivacySetting } from './PrivacySetting.js';

export { ContactSyncLogModel } from './ContactSyncLog.js';
export type { IContactSyncLog } from './ContactSyncLog.js';

export { ConversationModel } from './Conversation.js';
export type {
  IConversation,
  ConversationType,
  ConversationStatus,
  IConversationLastMessage,
  IConversationMetadata,
} from './Conversation.js';

export { ConversationMemberModel } from './ConversationMember.js';
export type { IConversationMember, MemberRole } from './ConversationMember.js';

export { MessageModel } from './Message.js';
export type {
  IMessage,
  MsgType,
  MsgStatus,
  IMessageReaction,
  IReadReceipt,
  IDeliveryReceipt,
  IMessageMedia,
  IEditEntry,
} from './Message.js';

export { MediaFileModel } from './MediaFile.js';
export type { IMediaFile, MediaFileType, MediaFileStatus } from './MediaFile.js';

export { StickerPackModel } from './StickerPack.js';
export type { IStickerPack, ISticker } from './StickerPack.js';

export { SharedContactModel } from './SharedContact.js';
export type { ISharedContact, IContactPhone, IContactEmail } from './SharedContact.js';

export { SharedLocationModel } from './SharedLocation.js';
export type { ISharedLocation } from './SharedLocation.js';

// ---------------------------------------------------------------------------
// Phase 7 — Groups, Communities, Channels
// ---------------------------------------------------------------------------

export { GroupModel } from './Group.js';
export type {
  IGroup,
  IGroupSettings,
  GroupType,
  GroupStatus,
  InvitePermission,
  MessagePermission,
} from './Group.js';

export { GroupMemberModel } from './GroupMember.js';
export type { IGroupMember, GroupMemberRole } from './GroupMember.js';

export { GroupRoleModel, ALL_GROUP_PERMISSIONS, DEFAULT_MEMBER_PERMISSIONS } from './GroupRole.js';
export type { IGroupRole, GroupPermission } from './GroupRole.js';

export { GroupBanModel } from './GroupBan.js';
export type { IGroupBan } from './GroupBan.js';

export { GroupMuteModel } from './GroupMute.js';
export type { IGroupMute } from './GroupMute.js';

export { GroupInvitationModel } from './GroupInvitation.js';
export type { IGroupInvitation, InvitationStatus, InvitationType } from './GroupInvitation.js';

export { GroupJoinRequestModel } from './GroupJoinRequest.js';
export type { IGroupJoinRequest, JoinRequestStatus } from './GroupJoinRequest.js';

export { GroupMessageModel } from './GroupMessage.js';
export type {
  IGroupMessage,
  IGroupMessageMedia,
  IGroupMessageReaction,
  IGroupMention,
  GroupMsgType,
  GroupMsgStatus,
} from './GroupMessage.js';

export { GroupMessageReadModel } from './GroupMessageRead.js';
export type { IGroupMessageRead } from './GroupMessageRead.js';

export { CommunityModel } from './Community.js';
export type {
  ICommunity,
  ICommunitySettings,
  ICommunityAvatar,
  CommunityType,
  CommunityStatus,
} from './Community.js';

export { CommunityMemberModel } from './CommunityMember.js';
export type { ICommunityMember, CommunityMemberRole } from './CommunityMember.js';

export { CommunityGroupModel } from './CommunityGroup.js';
export type { ICommunityGroup } from './CommunityGroup.js';

export { ChannelModel } from './Channel.js';
export type {
  IChannel,
  IChannelPermissionOverride,
  ChannelType,
  ChannelStatus,
} from './Channel.js';

export { ChannelMemberModel } from './ChannelMember.js';
export type { IChannelMember } from './ChannelMember.js';

export { AnnouncementModel } from './Announcement.js';
export type {
  IAnnouncement,
  IAnnouncementAttachment,
  AnnouncementScope,
  AnnouncementStatus,
} from './Announcement.js';

// ---------------------------------------------------------------------------
// Phase 8 — Notifications Platform
// ---------------------------------------------------------------------------

export { NotificationModel } from './Notification.js';
export type { INotification } from './Notification.js';

export { NotificationPreferenceModel } from './NotificationPreference.js';
export type { INotificationPreference, ICategoryPreference } from './NotificationPreference.js';

export { NotificationDeviceModel } from './NotificationDevice.js';
export type { INotificationDevice, NotificationDeviceType } from './NotificationDevice.js';

export { NotificationTokenModel } from './NotificationToken.js';
export type { INotificationToken, NotificationTokenPurpose } from './NotificationToken.js';

export { NotificationLogModel } from './NotificationLog.js';
export type { INotificationLog, NotificationLogAction } from './NotificationLog.js';

export { NotificationTemplateModel } from './NotificationTemplate.js';
export type { INotificationTemplate, ITemplateLocalization } from './NotificationTemplate.js';

export { NotificationCategoryModel } from './NotificationCategory.js';
export type { INotificationCategory } from './NotificationCategory.js';

export { NotificationChannelConfigModel } from './NotificationChannelConfig.js';
export type {
  INotificationChannelConfig,
  IChannelRateLimit,
} from './NotificationChannelConfig.js';

export { NotificationDeliveryModel } from './NotificationDelivery.js';
export type { INotificationDelivery, DeliveryStatus } from './NotificationDelivery.js';

export { NotificationFailureModel } from './NotificationFailure.js';
export type { INotificationFailure, FailureReason } from './NotificationFailure.js';

export { NotificationMetricsModel } from './NotificationMetrics.js';
export type { INotificationMetrics, MetricGranularity, IChannelMetrics } from './NotificationMetrics.js';

// Phase 8 Part 2 — Status/Stories & Sync
export { StatusUpdateModel } from './StatusUpdate.js';
export type { IStatusUpdate } from './StatusUpdate.js';

export { StatusViewModel } from './StatusView.js';
export type { IStatusView } from './StatusView.js';

export { StatusReplyModel } from './StatusReply.js';
export type { IStatusReply } from './StatusReply.js';

export { SyncEventModel } from './SyncEvent.js';
export type { ISyncEvent } from './SyncEvent.js';

export { SyncStateModel } from './SyncState.js';
export type { ISyncState } from './SyncState.js';
