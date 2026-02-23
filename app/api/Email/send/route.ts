import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/utils/supabase/server'

async function sendEmailWithAttachment(pdfBuffer: Buffer, subject: string, body: string, recipient: string[]) {
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

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { subject, body, recipient, pdfUrl } = await req.json()

    const { data, error } = await supabase.storage.from("Samurais Files").download(pdfUrl);
    
    if (error) {
    throw new Error('Error downloading PDF from Supabase Storage: ' + error.message);
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    // Send the email with the PDF attached
    await sendEmailWithAttachment(buffer, subject, body, recipient)

    return new NextResponse('Email sent with invoice PDF attachment', { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new NextResponse('Error sending email: ' + errorMessage, { status: 500 })
  }
}
