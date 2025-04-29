import { DataTable } from "@/components/ui/data-table"
import { Member, columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/utils/supabase/client';

async function getActiveMemberData(): Promise<Member[]> {
  // Fetch data from your API here.
  return [
    {
      GivenName: "Monkey D Garp",
      EmailAddress: "m@example.com",
      Status: "active",
      MembershipType: "Weekly",
      MobileNumber: "123123123"
    },
    {
      GivenName: "Shanks",
      EmailAddress: "m@example.com",
      Status: "active",
      MembershipType: "Monthly",
      MobileNumber: "123123123"
    },
    {
      GivenName: "Nami",
      EmailAddress: "m@example.com",
      Status: "active",
      MembershipType: "Annual",
      MobileNumber: "123123123"
    },
  ]
}

export default async function Page() {
  const supabase = await createClient();  
  const activeMemberData = await getActiveMemberData()
  // const { data }:PostgrestResponse<Member> = await supabase
  //       .from("member_form_submissions")
  //       .select('*')
  const pendingMemberData = activeMemberData//data || [];
  return (
    <div className="w-screen container mx-auto">      
      <Tabs defaultValue="Active">
        <div className="flex justify-between mb-4">
          <TabsList>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
          </TabsList>
          <Button variant="default">
            <Plus/>Add Member
          </Button>
        </div>
        <TabsContent value="Active">
          <DataTable columns={columns} data={activeMemberData} />
        </TabsContent>
        <TabsContent value="Pending">
          <DataTable columns={columns} data={pendingMemberData} />
        </TabsContent>
      </Tabs>      
    </div>
  )
}

