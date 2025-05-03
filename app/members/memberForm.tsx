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
import { MemberStatus } from "../types/enums/memberStatusTypes";

const formSchema = z.object({
  givenName: z.string().nonempty({ message: "Given name cannot be empty" }),
  preferredName: z.string().nonempty({ message: "Preferred name cannot be empty" }),
  address: z.string().nonempty({ message: "Address cannot be empty" }),
  postCode: z.string().nonempty({ message: "Post code cannot be empty" }),
  mobileNumber: z.string().nonempty({ message: "Mobile number cannot be empty" }),
  emailAddress: z.string().email({ message: "Invalid email address" }),
  dateOfBirth: z.coerce.date({ required_error: "Date of birth is required" }),
  school: z.string().optional(),
  medicalInformation: z.string().optional(),
  emergencyContact1: z.string().nonempty({ message: "Emergency contact 1 is required" }),
  emergencyContact2: z.string().optional(),
  membershipType: z.string().nonempty({ message: "Membership type is required" }),
  guardianName: z.string().optional(),
  guardianEmail: z.string().optional()
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
      postCode: "",
      mobileNumber: "",
      emailAddress: "",
      dateOfBirth: new Date(), // or "" if you want an empty string instead
      school: "",
      medicalInformation: "",
      emergencyContact1: "",
      emergencyContact2: "",
      membershipType: "",
      guardianName: "",
      guardianEmail: "",
    },
  });

  useEffect(() => {
    if (memberData) {
      // Set form values only when memberData is available
      form.setValue("givenName", memberData.GivenName);
      form.setValue("preferredName", memberData.PreferredName);
      form.setValue("address", memberData.Address);
      form.setValue("postCode", memberData.PostCode);
      form.setValue("mobileNumber", memberData.MobileNumber);
      form.setValue("emailAddress", memberData.EmailAddress);
      form.setValue("dateOfBirth", memberData.DateOfBirth);
      form.setValue("school", memberData.School);
      form.setValue("medicalInformation", memberData.MedicalInformation);
      form.setValue("emergencyContact1", memberData.EmergencyContact1);
      form.setValue("emergencyContact2", memberData.EmergencyContact2);
      form.setValue("membershipType", memberData.MembershipType);
      form.setValue("guardianName", memberData.GuardianName);
      form.setValue("guardianEmail", memberData.GuardianEmail);

    }
  }, [memberData, form]);

  // Don't render the form until the data is available
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <Dialog>
      <DialogTrigger asChild>
      {memberData?.Status == MemberStatus.Pending ?
      (<a style={{ cursor: "pointer" }} className="text-blue-200 underline">
        Review details
      </a>) : (<a style={{ cursor: "pointer" }} className="text-blue-200 underline">
          View details
        </a>)
      }
        
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
        <FormField control={form.control} name="givenName" render={({ field }) => (
          <FormItem>
            <FormLabel>Given Name</FormLabel>
            <FormControl>
              <Input placeholder="Given Name" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="preferredName" render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Name</FormLabel>
            <FormControl>
              <Input placeholder="Preferred Name" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Address" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="flex gap-x-4">
        <FormField control={form.control} name="postCode" render={({ field }) => (
          <FormItem>
            <FormLabel>Post Code</FormLabel>
            <FormControl>
              <Input placeholder="Post Code" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="mobileNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Mobile Number</FormLabel>
            <FormControl>
              <Input placeholder="Mobile Number" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="emailAddress" render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input placeholder="Email Address" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="flex gap-x-4">        
        <FormField control={form.control} name="school" render={({ field }) => (
          <FormItem>
            <FormLabel>School</FormLabel>
            <FormControl>
              <Input placeholder="School" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="medicalInformation" render={({ field }) => (
          <FormItem>
            <FormLabel>Medical Information</FormLabel>
            <FormControl>
              <Input placeholder="Medical Information" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth</FormLabel>
            <FormControl>
              <Input
                type="date"
                placeholder="Date of Birth"
                {...field} value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                onChange={(e) => field.onChange(new Date(e.target.value))}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="flex gap-x-4">
        <FormField control={form.control} name="emergencyContact1" render={({ field }) => (
          <FormItem>
            <FormLabel>Emergency Contact 1</FormLabel>
            <FormControl>
              <Input placeholder="Emergency Contact 1" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="emergencyContact2" render={({ field }) => (
          <FormItem>
            <FormLabel>Emergency Contact 2</FormLabel>
            <FormControl>
              <Input placeholder="Emergency Contact 2" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="membershipType" render={({ field }) => (
          <FormItem>
            <FormLabel>Membership Type</FormLabel>
            <FormControl>
              <Input placeholder="Membership Type" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="flex gap-x-4">
        <FormField control={form.control} name="guardianName" render={({ field }) => (
          <FormItem>
            <FormLabel>Guardian Name</FormLabel>
            <FormControl>
              <Input placeholder="Guardian Name" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="guardianEmail" render={({ field }) => (
          <FormItem>
            <FormLabel>Guardian Email</FormLabel>
            <FormControl>
              <Input placeholder="Guardian Email" {...field} className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />        
      </div>
      {memberData?.Status == MemberStatus.Pending ?
      (<Button type="submit">Activate</Button>) : (<Button type="submit">Update</Button>)
      }   
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
