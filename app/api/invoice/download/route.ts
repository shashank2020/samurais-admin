import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer';
import InvoicePDF from '@/components/pdf/InvoicePDF'
import { createClient } from "@/utils/supabase/server";
import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js"
import { InvoiceDetail } from '@/app/types/invoiceDetail';



const streamToBuffer = async (stream: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = []

  return new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("end", () => resolve(Buffer.concat(chunks)))
    stream.on("error", reject)
  })
}
const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer
}

const bufferToFile = (buffer: Buffer, fileName: string) => {
  const arrayBuffer = bufferToArrayBuffer(buffer)

  return new File([arrayBuffer], fileName, {
    type: "application/pdf",
  })
}

export const generateAndSaveInvoicePdfFileToSupabase = async (invoiceId: number) => {
  const supabase = await createClient()
  const pdfStream = await renderToStream(
    await InvoicePDF({ invoiceId: invoiceId })
  )

  const pdfBuffer = await streamToBuffer(pdfStream)
  const pdfFile = bufferToFile(
    pdfBuffer,
    `invoice_${invoiceId}.pdf`
  )
  const storagePath = `Invoices/${pdfFile.name}`

  const { error } = await supabase.storage
    .from("Samurais Files")
    .upload(storagePath, pdfFile, {
      contentType: "application/pdf",
      upsert: true,
    })

  if (error) {console.error(error); throw error}

  const { data } = supabase.storage
    .from("Samurais Files")
    .getPublicUrl(storagePath)
    
  return data.publicUrl
}

export async function POST(req: Request) {
  try {
    const {InvoiceId} = await req.json()   

    // Generate the PDF and save it to a file
    const pdfUrl = await generateAndSaveInvoicePdfFileToSupabase(InvoiceId)

    // Create a preview URL
    const previewUrl = pdfUrl

    // Return URLs to frontend
    return NextResponse.json({ pdfUrl, previewUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}