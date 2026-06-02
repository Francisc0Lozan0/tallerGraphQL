import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendNotificationSms(phoneNumber: string, message: string): Promise<boolean> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();

    if (!accountSid || !authToken || !fromNumber) {
      this.logger.warn('SMS not sent because Twilio is not configured');
      return false;
    }

    try {
      const body = new URLSearchParams({
        From: fromNumber,
        To: phoneNumber,
        Body: message,
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok) {
        const responseText = await response.text();
        this.logger.error(`Failed to send SMS to ${phoneNumber}: ${response.status} ${responseText}`);
        return false;
      }

      this.logger.log(`Notification SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      return false;
    }
  }
}