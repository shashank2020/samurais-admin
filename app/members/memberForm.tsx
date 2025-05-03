'use client'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member } from "../types/member";
import { Row } from "@tanstack/react-table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { getMemberDetailsById } from "../fetchData/getMemberData";
import { useCallback, useEffect, useState } from "react";

const formSchema = z.object({
  givenName: z.string().nonempty({
    message: "Given name cannot be empty",
  }),
  address: z.string().nonempty({
    message: "Address cannot be empty",
  }),
  preferredName:z.string().nonempty({
    message: "Preferred name cannot be empty",
  }),
});

type RowProps = {
  row: Member;
};

export default function MemberForm({ row }: RowProps) { 

  // const getMemberData = useCallback(async () => {
  //   setLoading(true); // Set loading state before fetching data
  //   const id: number = row.getValue("Id");
  //   const data = await getMemberDetailsById(id);
  //   setMemberData(data || null); // Set fetched member data
  //   setLoading(false); // Set loading state to false after data is fetched
  // }, [row]);

  // useEffect(() => {
  //   if (row.getValue("Id")) {
  //     getMemberData();
  //   }
  // }, [row, getMemberData]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    alert(values.givenName);
  }

  const [memberData, setMemberData] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    if (row) {
      setMemberData(row);
    }
  }, [row]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      givenName: "",
      preferredName: "",
      address: "",
    },
  });

  useEffect(() => {
    if (memberData) {
      // Set form values only when memberData is available
      form.setValue("givenName", memberData.GivenName);
      form.setValue("address", memberData.Address);
      form.setValue("preferredName", memberData.PreferredName);

    }
  }, [memberData, form]);

  // Don't render the form until the data is available
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <a style={{ cursor: "pointer" }} className="text-blue-200 underline">
          View details
        </a>
      </DialogTrigger>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>{row.GivenName}</DialogTitle>
          <DialogDescription>Details</DialogDescription>
        </DialogHeader>
        <div className="items-center space-x-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex gap-x-4">
              <FormField
                control={form.control}
                name="givenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Given name</FormLabel>
                    <FormControl>
                      <Input placeholder="Given name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Name</FormLabel>
                    <FormControl>
                      <Input placeholder="preferredName" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
