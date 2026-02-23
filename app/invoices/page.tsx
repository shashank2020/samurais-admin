import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NewInvoiceForm from "./newInvoiceForm";
import { InvoiceDetail, InvoiceWithMemberDetails, MemberInvoiceDetail } from "../types/invoiceDetail";
import { createClient } from '@/utils/supabase/server';
import { PostgrestResponse } from "@supabase/supabase-js"
import { Member } from "../types/member";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import InvoiceCards from "./InvoiceCards";

export default async function Page() {
  const supabase = await createClient();

  const { data: invoiceData }:PostgrestResponse<InvoiceDetail> = await supabase
  .from("invoices")
  .select('*')
  .order("InvoiceId", {ascending: false})

  const { data: memberInvoiceData }:PostgrestResponse<MemberInvoiceDetail> = await supabase
  .from("member_invoice_details")
  .select('*') 

  const { data: memberData }:PostgrestResponse<Member> = await supabase
  .from("member_details_table")
  .select("*")
  .eq("Status", 1)

  // Combine invoiceData, memberInvoiceData, and memberData into invoiceWithMemberDetails arrays
  function getInvoiceWithMemberDetails(type?: string) {
  if (!invoiceDataWithUrls || !memberInvoiceData || !memberData) return [];

  return invoiceDataWithUrls
    .filter(inv => !type || inv.MemberSubscriptionType === type)
    .map(inv => {
      const members = memberData.filter(m =>
        memberInvoiceData.some(mInv =>
          mInv.MemberId === m.Id && mInv.InvoiceId === inv.InvoiceId
        )
      );

      return {
        invoice: inv,
        memberDetails: members,
        MemberInvoiceDetails: memberInvoiceData.filter(
          mInv => mInv.InvoiceId === inv.InvoiceId
        )
      } as InvoiceWithMemberDetails;
    });
  }

  async function listAllFiles(bucketName: string) {
    const { data, error } = await supabase.storage.from(bucketName).list('Invoices', {
      limit: 100, // adjust as needed
      offset: 0,
      sortBy: { column: 'created_at', order: 'asc' },
    });

    if (error) {
      console.error('Error listing files:', error.message);
      return [];
    }
    return data;
  }

  async function getAllPublicUrls(bucketName: string) {
    const files = await listAllFiles(bucketName);
    if (!files?.length) return {};

    const urlMap: Record<string, string> = {};

    files.forEach(file => {
      const filePath = file.name;

      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(`Invoices/${filePath}`);

      urlMap[filePath] = publicUrl;
    });

    return urlMap;
  }

  const publicUrlMap = await getAllPublicUrls('Samurais Files');
  const invoiceDataWithUrls = invoiceData?.map(inv => {
  const expectedFileName = `invoice_${inv.InvoiceId}.pdf`;

    return {
      ...inv,
      PublicUrl: publicUrlMap[expectedFileName] ?? null
    };
  });
  const MEMBERSHIP_TYPES = [
    { key: "All", label: "All", filter: undefined },
    { key: "Casual", label: "Casual", filter: "Casual" },
    { key: "Monthly", label: "Monthly", filter: "Monthly" },
    { key: "SemiAnnual", label: "Semi-Annual", filter: "SemiAnnual" },
    { key: "Annual", label: "Annual", filter: "Annual" },
  ];

  const invoiceDataDict = Object.fromEntries(
    MEMBERSHIP_TYPES.map(({ key, filter }) => [
      key,
      getInvoiceWithMemberDetails(filter),
    ])
  );

  return (
  <SidebarProvider>
    <AppSidebar />
    <div className="container mx-auto px-4 py-10">
      <Tabs defaultValue="All">
        <div className="flex justify-between mb-4">
          <TabsList>
            {MEMBERSHIP_TYPES.map(({ key, label }) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <NewInvoiceForm />
        </div>

        {MEMBERSHIP_TYPES.map(({ key }) => (
          <TabsContent key={key} value={key}>
            <InvoiceCards
              invoiceWithMemberDetails={invoiceDataDict[key]}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  </SidebarProvider>
  );
}