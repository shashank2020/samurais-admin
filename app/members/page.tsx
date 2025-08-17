import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/utils/supabase/client';
import { PostgrestResponse } from "@supabase/supabase-js"
import { Member } from "../types/member"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function Page() {
  const supabase = await createClient();

  const { data }:PostgrestResponse<Member> = await supabase
  .from("member_details_table")
  .select('*')
  .order("Id", {ascending: true})
  
  const pendingMemberData = data?.filter(x => x.Status == 3) || [];
  const activeMemberData = data?.filter(x => x.Status == 1) || [];
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <SidebarInset>      
      <div className="w-screen container mx-auto">      
        <Tabs defaultValue="Active">
          <div className="flex justify-between">
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
      </SidebarInset>
    </SidebarProvider>
  )
}

