import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer';
import InvoicePDF from '@/components/pdf/InvoicePDF'
import path from 'path'
import fs from 'fs'

// simulate invoice data
const sampleInvoice = {
  term: 'August',
  date: '1/8/25',
  subtotalDisplay: '$60 ($50)',
  totalDisplay: '$60 ($50)',
  bankAccount: '06-0606-0922974-00',
  items: [
    {
      quantity: '1 x Monthly Membership',
      description:
        'Monthly Membership Subscription (August) (You can pay $50 if you can only make the 1 session per week, roughly 4 session per month)',
      unitPrice: '$60 ($50)',
    },
  ],
}

const generatePDFFile = async (invoiceData: any) => {
  const pdfStream = await renderToStream(InvoicePDF({ invoice: invoiceData }))    
  const pdfPath = path.join(process.cwd(), 'public', 'invoices', `invoice_${Date.now()}.pdf`)
  const writeStream = fs.createWriteStream(pdfPath)

  return new Promise<string>((resolve, reject) => {
    pdfStream.pipe(writeStream)
    writeStream.on('finish', () => resolve(`/invoices/${path.basename(pdfPath)}`))
    writeStream.on('error', reject)
  })
}

export async function GET() {
  const pdfStream = await renderToStream(InvoicePDF({ invoice: sampleInvoice }))

  return new NextResponse(pdfStream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="invoice2.pdf"',
    },
  })
}

export async function POST(req: Request) {
  try {

    // Sample invoice data
    const sampleInvoice = {
      term: 'August',
      date: '1/8/25',
      subtotalDisplay: '$60 ($50)',
      totalDisplay: '$60 ($50)',
      bankAccount: '06-0606-0922974-00',
      items: [
        {
          quantity: '1 x Monthly Membership',
          description:
            'Monthly Membership Subscription (August) (You can pay $50 if you can only make the 1 session per week, roughly 4 session per month)',
          unitPrice: '$60 ($50)',
        },
      ],
    }

    // Generate the PDF and save it to a file
    const pdfUrl = await generatePDFFile(sampleInvoice)

    // Create a preview URL
    const previewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${pdfUrl}`

    // Return URLs to frontend
    return NextResponse.json({ pdfUrl, previewUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}