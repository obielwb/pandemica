import { Transporter, createTransport } from 'nodemailer'

export type MailData = {
  to: {
    name: string
    address: string
  }
  subject: string
  html: string
}

const {
  NODEMAILER_TRANSPORTER_HOST,
  NODEMAILER_TRANSPORTER_PORT,
  NODEMAILER_TRANSPORTER_USERNAME,
  NODEMAILER_TRANSPORTER_PASSWORD,
  MAIL_NAME,
  MAIL_ADDRESS
} = process.env

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
        name: MAIL_NAME!,
        address: MAIL_ADDRESS!
      },
      ...data
    })
  }
}
