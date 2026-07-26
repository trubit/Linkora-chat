import { logger } from '../../../logger/index.js';
import { emailService } from '../../../emails/service.js';
import type { ChannelAdapter, DeliveryContext } from '../types.js';

// ---------------------------------------------------------------------------
// Email channel adapter
// ---------------------------------------------------------------------------

export class EmailAdapter implements ChannelAdapter {
  readonly channel = 'email' as const;

  isAvailable(): boolean {
    return true;
  }

  async deliver(ctx: DeliveryContext): Promise<void> {
    const payload = (ctx.payload ?? {}) as Record<string, unknown>;
    const recipientEmail = payload['recipientEmail'] as string | undefined;
    if (!recipientEmail) {
      logger.warn('[EmailAdapter] No recipientEmail in payload — cannot deliver', {
        notificationId: ctx.notificationId,
        correlationId: ctx.correlationId,
      });
      return;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${ctx.title}</h2>
        <p style="color: #555; line-height: 1.6;">${ctx.body}</p>
        ${
          payload['deepLink']
            ? `<p><a href="${payload['deepLink'] as string}" style="color: #007bff;">View in app</a></p>`
            : ''
        }
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">You are receiving this notification from Linkora.</p>
      </div>
    `;

    await emailService.send({
      to: recipientEmail,
      subject: ctx.title,
      html,
      text: ctx.body,
    });

    logger.debug('[EmailAdapter] Notification email sent', {
      notificationId: ctx.notificationId,
      recipientId: ctx.recipientId,
      correlationId: ctx.correlationId,
    });
  }
}

export const emailAdapter = new EmailAdapter();
