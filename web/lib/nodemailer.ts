import { Transporter, createTransport } from 'nodemailer'

type MailData = {
  to: {
    name: string
    address: string
  }
  subject: string
  html: string
}

export class Nodemailer {
  private readonly transporter: Transporter

  constructor() {
    this.transporter = createTransport({
      host: NODEMAILER_TRANSPORTER_HOST,
      port: Number(NODEMAILER_TRANSPORTER_PORT),
      secure: true,
      auth: {
        user: NODEMAILER_TRANSPORTER_USERNAME,
        pass: NODEMAILER_TRANSPORTER_PASSWORD
      }
    })
  }

  async send(data: MailData): Promise<void> {
    await this.transporter.sendMail({
      from: {
        name: MAIL_NAME,
        address: MAIL_ADDRESS
      },
      ...data
    })
  }
}
