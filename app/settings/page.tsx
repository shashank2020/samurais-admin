"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Plus, Save } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useToast } from "@/hooks/use-toast";
import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";

export default function ClubSettingsPage() {
  const supabase = createClient();

  const [settings, setSettings] = useState<ClubSetting | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRates[]>([]);

  const { toast } = useToast();
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const { data: clubSettings }: PostgrestSingleResponse<ClubSetting> = await supabase
        .from("club_settings")
        .select("*")
        .single();

      const { data: subs }: PostgrestResponse<SubscriptionRates> = await supabase
        .from("member_subscription_types")
        .select("*")
        .order("Id");

      if (clubSettings) setSettings(clubSettings);
      if (subs) setSubscriptions(subs);
    };

    fetchData();
  }, [supabase]);

  // Update club settings
  const saveClubSettings = async () => {
    if (!settings) return;
    await supabase.from("club_settings").update(settings).eq("id", settings.id);
    toast({
      title: "Settings saved",
      description: "Your club settings have been updated successfully.",
    });
  };

  // Update subscriptions
  const saveSubscriptions = async () => {
    debugger;
    for (let sub of subscriptions) {
      await supabase.from("member_subscription_types").upsert(sub);
    }
    toast({
      title: "Subscriptions saved",
      description: "Your subscription types have been updated successfully.",
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
    <div className="container mx-auto space-y-6 py-10">
      {/* Club Info */}
      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {settings && (
            <>
              <div>
                <Label>Club Name</Label>
                <Input
                  value={settings.club_name || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, club_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>GST number</Label>
                <Input
                  value={settings.gst_number || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, gst_number: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Street address</Label>
                <Input
                  value={settings.address_line_1 || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, address_line_1: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={settings.address_line_2 || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, address_line_2: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={settings.email || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={settings.phone || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Bank account</Label>
                <Input
                  value={settings.bank_account || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, bank_account: e.target.value })
                  }
                />
              </div>
              <Button onClick={saveClubSettings} className="w-fit">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription Rates */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Subscription Types</CardTitle>
          {/* <Button onClick={addSubscription} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button> */}
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptions.map((sub, idx) => (
            <div key={sub.Id} className="grid grid-cols-3 gap-4">
              <Input
                name = {`MembershipType${sub.Id}`}
                placeholder="Name (e.g. Monthly)"
                value={sub.MembershipType}
                onChange={(e) => {
                  const copy = [...subscriptions];
                  copy[idx].MembershipType = e.target.value;
                  setSubscriptions(copy);
                }}
              />
              <Input
                name = {`Rate${sub.Id}`}
                type="number"
                placeholder="Rate"
                value={sub.rate}
                onChange={(e) => {
                  const copy = [...subscriptions];
                  copy[idx].rate = parseFloat(e.target.value);
                  setSubscriptions(copy);
                }}
              />
            </div>
          ))}
          <Button onClick={saveSubscriptions} className="w-fit">
            <Save className="mr-2 h-4 w-4" /> Save Subscriptions
          </Button>
        </CardContent>
      </Card>
    </div>
    </SidebarProvider>
  );
}
