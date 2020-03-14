import nodemailer, { SendMailOptions, Transporter, createTransport } from 'nodemailer';
import _ from 'lodash';
import { Mail } from '../../Utils/Interfaces';
import { transOptions } from '../../Utils/Types';

namespace Mailer {
  export class MailManager implements Mail {
    private transporter: Transporter | null = null;
    private mailer: typeof nodemailer;
    private mailSender: SendMailOptions;
    private mailerConfig: transOptions;

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

    public async create(): Promise<Transporter | null> {
      if (!this.getMailer()) return null;

      if (this.getTransporter()) return this.transporter;

      this.transporter = createTransport(this.getMailerConfig());

      try {
        const result = await this.transporter?.verify();

        if (!result) throw new Error('Invalid varify mailer');
      } catch (error) {
        console.error(error);
        return null;
      }

      return this.transporter;
    }

    public async send(to: string, subject: string, text: string): Promise<any> {
      try {
        const senderProps: object = this.getSender();
        if (!senderProps || !_.isString(to) || !_.isString(subject) || !_.isString(text)) {
          return null;
        }

        const validEmail = /\w+\@\w+\.\D+/i.test(to);

        if (!validEmail) {
          return null;
        }

        const result = await this.getTransporter()?.sendMail({
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
