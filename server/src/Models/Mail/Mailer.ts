import nodemailer, { SendMailOptions, Transporter, createTransport, SentMessageInfo } from 'nodemailer';
import _ from 'lodash';
import { Mail } from '../../Utils/Interfaces/Interfaces.global';
import { transOptions } from '../../Utils/Types/types.global';

namespace Mailer {
  export class MailManager implements Mail {
    private transporter: Transporter | null = null;
    private readonly mailer: typeof nodemailer;
    private readonly mailSender: SendMailOptions;
    private readonly mailerConfig: transOptions;

    constructor(mailer: typeof nodemailer, mailerConfig: transOptions, mailSender: SendMailOptions) {
      this.mailer = mailer;
      this.mailSender = mailSender;
      this.mailerConfig = mailerConfig;
    }

    public getMailerConfig(): transOptions {
      return this.mailerConfig;
    }

    public getMailer(): typeof nodemailer {
      return this.mailer;
    }

    public getTransporter(): Transporter | null {
      return this.transporter;
    }

    public getSender(): SendMailOptions {
      return this.mailSender;
    }

    public async create(): Promise<boolean> {
      if (!this.getMailer()) {
        return false;
      }

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

    public async send(to: string, subject: string, text: string): Promise<SentMessageInfo> {
      try {
        const senderProps: object = this.getSender();
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
        const result: Promise<SentMessageInfo> = transport.sendMail({
          ...senderProps,
          subject,
          text,
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
}

export default Mailer;
