import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Optional: register a font (using standard fonts here)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v12/helvetica-regular.ttf' },
  ],
})

export const InvoicePDF = ({ invoice }: { invoice: any }) => {
  // calculate subtotal
  const subtotal = invoice.items.reduce((acc: number, item: any) => acc + item.amount, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerLeft}>Samurais Volleyball Inc. 142-899-558</Text>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>Samurais Volleyball</Text>
            <Text>13 Kopiko Way, Brooklyn</Text>
            <Text>Wellington  6021</Text>
            <Text>samuraisvolleyball@gmail.com</Text>
            <Text>021 268 5727</Text>
          </View>
        </View>

        <Text style={styles.invoiceTitle}>Tax Invoice</Text>

        <View style={styles.divider} />

        {/* Invoice Terms */}
        <View style={styles.invoiceTermsRow}>
          <View style={styles.invoiceTermsLeft}>
            <Text style={styles.labelBold}>Invoice Term:</Text>
            <Text style={styles.termValue}>{invoice.term}</Text>

            <Text style={[styles.labelBold, { marginTop: 10 }]}>Date:</Text>
            <Text>{invoice.date}</Text>
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
          {invoice.items.map((item: any, idx: number) => (
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
            <Text style={[styles.tableCell, styles.unitPriceCell]}>{`— ${invoice.subtotalDisplay}`}</Text>
          </View>

          {/* Total */}
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableCell, styles.quantityCell]}></Text>
            <Text style={[styles.tableCell, styles.descriptionCell, styles.totalLabel]}>Total:</Text>
            <Text style={[styles.tableCell, styles.unitPriceCell, styles.totalValue]}>{invoice.totalDisplay}</Text>
          </View>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Please pay the amount to the bank account number below:
        </Text>
        <Text style={styles.footerNoteBold}>{invoice.bankAccount}</Text>
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
