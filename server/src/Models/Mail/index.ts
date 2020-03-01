import nodemailer, { SendMailOptions, Transporter, createTransport } from "nodemailer";
import { Mail } from "../../Utils/Interfaces";
import { transOptions } from "../../Utils/Types";

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

        public create(): Transporter | null {
            if (!this.getMailer()) return null;

            if (this.getTransporter()) return this.transporter;

            this.transporter = createTransport(this.getMailerConfig());
            return this.transporter;
        }

        public async send(to: string, subject: string, text: string): Promise<any> {
            try {
                const senderProps: object = this.getSender();
                if (!senderProps) return null;
                return await this.getTransporter()?.sendMail({
                    ...senderProps,
                    subject,
                    text,
                    to
                });
            } catch (error) {
                console.error(error);
                return null;
            }
        }

    }
}

export default Mailer;