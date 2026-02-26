import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/utils/supabase/server';
import { PostgrestResponse } from "@supabase/supabase-js"
import { Member } from "../types/member"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import MemberForm from "./memberForm"

export default async function Page() {
  const supabase = await createClient();
  
  const { data }:PostgrestResponse<Member> = await supabase
  .from("member_details_table")
  .select('*')
  .order("Id", {ascending: true})
  
  const pendingMemberData = data?.filter(x => x.Status == 3) || [];
  const activeMemberData = data?.filter(x => x.Status == 1) || [];
  const inactiveMemberData = data?.filter(x => x.Status == 2) || [];

  
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* <SidebarTrigger /> */}
      {/* <SidebarInset>       */}
      <div className="container mx-auto px-4 py-10">      
        <Tabs defaultValue="Active">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="Active">Active</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Inactive">Inactive</TabsTrigger>
            </TabsList>
            <MemberForm
              mode="add"
              trigger={<Button><Plus/>Add Member</Button>}
            />
          </div>
          <TabsContent value="Active">
            <DataTable columns={columns} data={activeMemberData} />
          </TabsContent>
          <TabsContent value="Pending">
            <DataTable columns={columns} data={pendingMemberData} />
          </TabsContent>
          <TabsContent value="Inactive">
            <DataTable columns={columns} data={inactiveMemberData} />
          </TabsContent>
        </Tabs>      
      </div>
      
    </SidebarProvider>
  )
}

