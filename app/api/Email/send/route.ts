import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

async function sendEmailWithAttachment(pdfBuffer: Buffer, subject: string, body: string, recipient: string[]) {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "shashankmylarapu@gmail.com", // your email address
      pass: "gnbx oufx czej qlse", // your email password or app password
    },
    tls: {
      rejectUnauthorized: false, // Disable certificate validation (only for dev purposes)
    },
  })

  const mailOptions = {
    from: "shashankmylarapu@gmail.com",
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

export async function POST(req: Request) {
  try {
    const { subject, body, recipient, pdfUrl } = await req.json()

    // Read the PDF file from the public folder
    const filePath = path.join(process.cwd(), 'public', pdfUrl)
    const pdfBuffer = fs.readFileSync(filePath)

    // Send the email with the PDF attached
    await sendEmailWithAttachment(pdfBuffer, subject, body, recipient)

    return new NextResponse('Email sent with invoice PDF attachment', { status: 200 })
  } catch (error) {
    return new NextResponse('Error sending email', { status: 500 })
  }
}
