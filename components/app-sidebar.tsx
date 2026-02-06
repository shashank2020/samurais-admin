'use client'
import * as React from "react"
import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import { createClient } from "@/utils/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation'
import { NavUser } from "./nav-user"
import { useEffect, useState } from "react"
import { ThemeSwitcher } from "./theme-switcher";

// This is sample data.
const data = {
  user: {
    name: "Sam",
    email: "m@example.com",
    avatar: "",
  },
}
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    isActive: true,
  },
  {
    title: "Members",
    url: "/members"
  },
  {
    title: "Invoices",
    url: "/invoices",
  },
  {
    title: "Club Settings",
    url: "/settings",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [user, setUser] = useState<any>(null)
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])
  
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser user={{name: user?.name ?? "", email: user?.email ?? "" , avatar:""}} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive= {usePathname() === item.url}>
                    <a href={item.url}>
                      <span>{item.title}</span>
                    </a> 
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <ThemeSwitcher />
    </Sidebar>
    
  )
}
