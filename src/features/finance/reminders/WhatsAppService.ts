import { Member, Contribution, Payment } from "@/generated/prisma/client";

export interface IWhatsAppProvider {
  sendMessage(phone: string, message: string): Promise<boolean>;
}

export class MockWhatsAppProvider implements IWhatsAppProvider {
  async sendMessage(phone: string, message: string): Promise<boolean> {
    console.log(`[MOCK WhatsApp] Sending to ${phone}:`);
    console.log(message);
    return true;
  }
}

export class WhatsAppService {
  private provider: IWhatsAppProvider;

  constructor(provider: IWhatsAppProvider = new MockWhatsAppProvider()) {
    this.provider = provider;
  }

  async sendDueReminder(member: Member, contribution: Contribution): Promise<boolean> {
    if (!member.whatsapp) return false;
    
    const message = `🙏 Namaskaram ${member.name},
Your contribution of ₹${contribution.expectedAmount.toString()} for period ${contribution.period} is due on ${contribution.dueDate.toLocaleDateString()}.
Please complete your payment to support the community.
Thank you!`;
    
    return this.provider.sendMessage(member.whatsapp, message);
  }

  async sendPaymentReceipt(member: Member, payment: Payment): Promise<boolean> {
    if (!member.whatsapp) return false;

    const message = `🙏 Namaskaram ${member.name},
We have received your payment of ₹${payment.amount.toString()} (Ref: ${payment.providerOrderId}).
Thank you for your generous support!`;

    return this.provider.sendMessage(member.whatsapp, message);
  }
}

export const whatsappService = new WhatsAppService();
