import { memberSubscriptionTypes } from '@/app/types/enums/memberSubscriptionTypes'
import { InvoiceDetail } from '@/app/types/invoiceDetail'
import { periodKeyToTermText } from '@/utils/helpers/periodKeyHelper'
import { subscriptionTypeFromString } from '@/utils/helpers/subscriptionTypeHelper'
import { createClient } from '@/utils/supabase/server'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

// Optional: register a font (using standard fonts here)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v12/helvetica-regular.ttf' },
  ],
})

export const InvoicePDF = async ({ invoiceId }: { invoiceId: number }) => {

  const supabase = await createClient()
  //fetch club data and invoice data to generate the invoice data object for the PDF
  const { data: clubSettings }:PostgrestSingleResponse<ClubSetting> = await supabase
      .from("club_settings")
      .select("*")
      .single();

  const { data: invoiceData }:PostgrestSingleResponse<InvoiceDetail> = await supabase
    .from("invoices")
    .select('*')
    .eq("InvoiceId", invoiceId)
    .single()
  
  const { data: subs }:PostgrestSingleResponse<SubscriptionRates> = await supabase
  .from("member_subscription_types")
  .select("*")
  .eq("MembershipType", invoiceData?.MemberSubscriptionType)
  .single()

  // Format date to dd/MM/yyyy
  function formatDateToDDMMYYYY(dateString?: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  console.log('Invoice Data:', invoiceData?.StartDate);
  const term = periodKeyToTermText(invoiceData?.PeriodKey || '', subscriptionTypeFromString(invoiceData?.MemberSubscriptionType || ''), invoiceData?.StartDate ? new Date(invoiceData.StartDate) : undefined)
  // Sample invoice data
  const InvoicePdfData = {
    invoiceId: invoiceId,
    term: term,
    date: formatDateToDDMMYYYY(invoiceData?.StartDate),
    subtotalDisplay: `$${subs?.rate}`,
    totalDisplay: `$${subs?.rate}`,
    items: [
      {
        quantity: `1 x ${invoiceData?.MemberSubscriptionType} Membership`,
        description:
          `${invoiceData?.MemberSubscriptionType} Membership Subscription (${term})`,
        unitPrice: `$${subs?.rate}`,
      },
    ],
  }
      
  //calculate subtotal
  const subtotal = InvoicePdfData.items.reduce((acc: number, item: any) => acc + parseFloat(item.unitPrice.replace('$', '')), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerLeft}>{clubSettings?.club_name} Inc. {clubSettings?.gst_number}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{clubSettings?.club_name}</Text>
            <Text>{clubSettings?.address_line_1}</Text>
            <Text>{clubSettings?.address_line_2}</Text>
            <Text>{clubSettings?.email}</Text>
            <Text>{clubSettings?.phone}</Text>
          </View>
        </View>

        <Text style={styles.invoiceTitle}>Tax Invoice</Text>

        <View style={styles.divider} />

        {/* Invoice Terms */}
        <View style={styles.invoiceTermsRow}>
          <View style={styles.invoiceTermsLeft}>
            <Text style={styles.labelBold}>Invoice Term:</Text>
            <Text style={styles.termValue}>{InvoicePdfData.term}</Text>

            <Text style={[styles.labelBold, { marginTop: 10 }]}>Date:</Text>
            <Text>{InvoicePdfData.date}</Text>
          </View>
          <View style={{ flex: 1 }} />
        </View>

        <Text style={{ marginTop: 10 }}>Invoice for Samurais Membership:</Text>

        {/* Table with Border */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.quantityCell]}>Quantity</Text>
            <Text style={[styles.tableCell, styles.descriptionCell]}>Description</Text>
            <Text style={[styles.tableCell, styles.unitPriceCell]}>Unit Price</Text>
          </View>

          {/* Table Items */}
          {InvoicePdfData.items.map((item: any, idx: number) => (
            <View key={idx} style={[styles.tableRow]}>
              <Text style={[styles.tableCell, styles.quantityCell]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.descriptionCell]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.unitPriceCell]}>{item.unitPrice}</Text>
            </View>
          ))}

          {/* Empty rows for spacing */}
          {[...Array(4)].map((_, i) => (
            <View key={'empty-' + i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.quantityCell]}></Text>
              <Text style={[styles.tableCell, styles.descriptionCell]}></Text>
              <Text style={[styles.tableCell, styles.unitPriceCell]}></Text>
            </View>
          ))}

          {/* Subtotal */}
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableCell, styles.quantityCell]}></Text>
            <Text style={[styles.tableCell, styles.descriptionCell, { textAlign: 'left' }]}>Subtotal</Text>
            <Text style={[styles.tableCell, styles.unitPriceCell]}>{`— ${InvoicePdfData.subtotalDisplay}`}</Text>
          </View>

          {/* Total */}
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableCell, styles.quantityCell]}></Text>
            <Text style={[styles.tableCell, styles.descriptionCell, styles.totalLabel]}>Total:</Text>
            <Text style={[styles.tableCell, styles.unitPriceCell, styles.totalValue]}>{InvoicePdfData.totalDisplay}</Text>
          </View>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Please pay the amount to the bank account number below:
        </Text>
        <Text style={styles.footerNoteBold}>{clubSettings?.bank_account}</Text>
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    fontSize: 11,
  },
  headerRight: {
    textAlign: 'right',
    fontSize: 9,
    color: '#445566',
    lineHeight: 1.2,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2E5C81', // blue color from sample
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#888',
    marginBottom: 10,
  },
  invoiceTermsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  invoiceTermsLeft: {
    flex: 1,
  },
  labelBold: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2E5C81',
  },
  termValue: {
    fontSize: 12,
    marginBottom: 5,
  },
  tableContainer: {
    marginTop: 10,
    border: '1px solid #ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 24,
    alignItems: 'center',
    borderBottom: '1px solid #ddd', // Softer borders between rows
  },
  tableHeader: {
    backgroundColor: '#2E5C81',
    color: '#fff',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    borderRight: '1px solid #ddd', // Soft border between columns
  },
  quantityCell: {
    flex: 1.5,
  },
  descriptionCell: {
    flex: 4,
  },
  unitPriceCell: {
    flex: 1.5,
    textAlign: 'right',
  },
  tableFooter: {
    borderTop: '1px solid #ddd', // Soft border on top of footer row
    borderBottom: 'none', // Remove bottom border for clean look
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  footerNote: {
    marginTop: 20,
    fontSize: 10,
  },
  footerNoteBold: {
    fontSize: 10,
    fontWeight: 'bold',
  },
})

export default InvoicePDF;
