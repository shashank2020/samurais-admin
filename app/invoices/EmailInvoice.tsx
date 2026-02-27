import nodemailer from 'nodemailer'

export async function sendEmailWithAttachment(pdfBuffer: Buffer, subject: string, body: string, recipient: string[]) {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_SENDER_EMAIL, // your email address
      pass: process.env.NEXT_PUBLIC_SENDER_EMAIL_PASSWORD, // your email password or app password
    },
    tls: {
      rejectUnauthorized: false, // Disable certificate validation (only for dev purposes)
    },
  })

  const mailOptions = {
    from: process.env.NEXT_PUBLIC_SENDER_EMAIL,
    to: recipient,
    subject: subject,
    text: body,
    attachments: [
      {
        filename: 'invoice.pdf',
        content: pdfBuffer,
        encoding: 'base64',
      },
    ],
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Error sending email.')
  }
}