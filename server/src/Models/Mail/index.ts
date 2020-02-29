import nodemailer, { SendMailOptions, Transporter, createTransport, TransportOptions } from "nodemailer";

namespace Mailer {

    export class MailManager {
        private transporter: Transporter | null = null;
        private mailer: Transport;
        private mailSender: object;

        constructor(mailer: Transport, mailSender: object) {
            this.mailer = mailer;
            this.mailSender = mailSender;
        }

        public getMailer(): Transport {
            return this.mailer;
        }

        public getTransporter(): Transporter | null {
            return this.transporter;
        }

        public getSender(): object {
            return this.mailSender;
        }

        public create(config: SendMailOptions): Transporter | null {
            if (!this.getMailer()) return null;
            this.transporter = createTransport(this.getMailer(), config);
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