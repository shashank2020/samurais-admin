import { generateAndSaveInvoicePdfFileToSupabase } from '@/app/invoices/GenerateInvoicePdf'
import { NextResponse } from 'next/server'


export async function POST(req: Request) {
  try {
    const { InvoiceId } = await req.json()

    const pdfUrl = await generateAndSaveInvoicePdfFileToSupabase(InvoiceId)

    return NextResponse.json({
      pdfUrl,
      previewUrl: pdfUrl
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error generating PDF' },
      { status: 500 }
    )
  }
}