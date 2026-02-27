import { renderToStream } from '@react-pdf/renderer'
import InvoicePDF from '@/components/pdf/InvoicePDF'
import { createClient } from "@/utils/supabase/server";

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
    await InvoicePDF({ invoiceId })
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

  if (error) throw error

  const { data } = supabase.storage
    .from("Samurais Files")
    .getPublicUrl(storagePath)

  return data.publicUrl
}