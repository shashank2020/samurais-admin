'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Member } from '../types/member'
import { InvoiceMemberRecipientTable } from './invoiceMemberRecipientTable'
import { Textarea } from "@/components/ui/textarea"
import { useUpdateInvoiceNotifyStatus } from '../invoiceModulation/useUpdateInvoiceNotifyStatus'
import { useRouter } from 'next/navigation';

type EmailProps = {
  members: Member[],
  invoiceId: number,
  publicUrl?: string
};

export default function InvoiceEmailForm({ members, invoiceId, publicUrl }: EmailProps) {
  const [generatingDocument, setGeneratingDocument] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>([])
  const [pdfUrl, setPdfUrl] = useState(publicUrl || '')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const formSchema = z.object({    
    emailSubject: z.string().nonempty("Email subject cannot be empty"),
    emailBody: z.string().nonempty("Email body cannot be empty")
  });

  const {
        mutate: updateInvoiceNotifyStatus,
      } = useUpdateInvoiceNotifyStatus();

  const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        emailSubject: "",
        emailBody: "",
      },
    });

  const handleGenerateDocument = async (values: z.infer<typeof formSchema>) => {
    setGeneratingDocument(true)
    setError('')
    setPdfUrl('')

    try {
      const response = await fetch('/api/invoice/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          InvoiceId: invoiceId,
        }),
      })

      if (response.ok) {
        const data = await response.json()        
        setPdfUrl(data.pdfUrl)
      } else {
        throw new Error('Error generating PDF')
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setGeneratingDocument(false)
    }
  }

  const handleSendEmail = async (values: z.infer<typeof formSchema>) => {
    if(emailRecipients.length === 0) {
      return alert("Please select at least one recipient.")
    }
    if (!pdfUrl) return
    setSendingEmail(true)

    try {
      const response = await fetch('/api/Email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: values.emailSubject,
          body: values.emailBody,
          recipient: emailRecipients,
          pdfUrl: `Invoices/invoice_${invoiceId}.pdf`,
        }),
      })

      if (response.ok) {
        alert('Email sent successfully!')
        updateInvoiceNotifyStatus({ invoiceId, isNotified: true }, {
        onSuccess: () => {          
          
        },
        onError: (error: any) => {
          alert("Error updating invoice notification status: " + error.message);
        },
      });

      }
    } catch (error) {
      alert('Error sending email')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setEmailRecipients([]);
      setGeneratingDocument(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
            Send invoice <Send />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-fit" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Send invoice email</DialogTitle>
          <DialogDescription>Email details</DialogDescription>
        </DialogHeader>

        <div className="items-center space-x-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-4">
                    
                    <FormField control={form.control} name="emailSubject" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email subject</FormLabel>
                    <FormControl>
                        <Input  placeholder="Email Subject" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                    )} />

                    <FormField control={form.control} name="emailBody" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email body</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Email Body" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                    )} />
                    <InvoiceMemberRecipientTable members={members} onSelectionChange={setEmailRecipients} />
                    {generatingDocument || sendingEmail ? (
                        (generatingDocument && <div className="loading">Generating invoice...</div>)
                        || (sendingEmail && <div className="loading">Sending email...</div>)
                    ) : (
                    <>
                        {!pdfUrl && <Button name="generateInvoice" type="button" onClick={form.handleSubmit(handleGenerateDocument)}>
                          Generate invoice
                        </Button>}
                        {pdfUrl && (
                        <div className="align-items-right">
                            <div className="flex gap-2">
                                <Button
                                    name="previewInvoice"
                                    type="button"
                                    onClick={() => { window.open(pdfUrl, "_blank", "noopener,noreferrer")}}
                                  >
                                    Preview invoice
                                </Button>
                                <Button type="submit" name="sendEmail">
                                    Send email
                                </Button>
                            </div>
                        </div>
                        )}
                    </>
                    )}

                    {error && <p className="error">{error}</p>}
                </form>
            </Form>
        </div>
        <DialogFooter>
          <DialogClose asChild></DialogClose>
        </DialogFooter>
      </DialogContent>  
    </Dialog>
  )
}
