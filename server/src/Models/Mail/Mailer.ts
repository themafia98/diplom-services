import { SendMailOptions, Transporter, SentMessageInfo, createTransport } from 'nodemailer';
import { Mail } from '../../Utils/Interfaces/Interfaces.global';
import { transOptions } from '../../Utils/Types/types.global';

class Mailer implements Mail {
  private transporter: Transporter | null = null;

  private readonly mailSender: SendMailOptions;

  private readonly mailerConfig: transOptions;

  constructor(mailerConfig: transOptions, mailSender: SendMailOptions) {
    this.mailSender = mailSender;
    this.mailerConfig = mailerConfig;
  }

  public getMailerConfig(): transOptions {
    return this.mailerConfig;
  }

  public getTransporter(): Transporter | null {
    return this.transporter;
  }

  public getSender(): SendMailOptions {
    return this.mailSender;
  }

  public async create(): Promise<boolean> {
    if (this.getTransporter()) {
      return true;
    }

    this.transporter = createTransport(this.getMailerConfig());

    try {
      const result = await this.transporter.verify();

      if (!result) throw new Error('Invalid varify mailer');
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  public async send(to: string, subject: string, text: string, html = false): Promise<SentMessageInfo> {
    try {
      const senderProps: Record<string, any> = this.getSender();
      if (!senderProps || [to, subject, text].every((type) => typeof type !== 'string')) {
        return null;
      }

      const validEmail = /\w+@\w+\.\D+/i.test(to);

      if (!validEmail) {
        return null;
      }

      const transport: Transporter | null = this.getTransporter();
      if (!transport) {
        throw new TypeError('Bad mail transporter');
      }

      const mailBody = html ? { html: text } : { text };

      const result: Promise<SentMessageInfo> = transport.sendMail({
        ...senderProps,
        ...mailBody,
        subject,
        to,
      });

      if (!result) throw new Error('Invalid send mail');

      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default Mailer;
