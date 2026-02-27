import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmailWithAttachment } from '@/app/invoices/EmailInvoice';

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
