'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Member } from "../types/member";
import { MemberStatus } from "../types/enums/memberStatusTypes";
import { memberSubscriptionTypes } from "../types/enums/memberSubscriptionTypes";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

import { useActivateMember } from "../memberModulation/useActivateMember";
import { useUpdateMember } from "../memberModulation/useUpdateMember";
import { useAddMember } from "../memberModulation/useAddMember";

import { useEffect, useState } from "react";

const formSchema = z.object({
  givenName: z.string().nonempty("Given name cannot be empty"),
  preferredName: z.string().nonempty("Preferred name cannot be empty"),
  address: z.string().nonempty("Address cannot be empty"),
  postCode: z.string().nonempty("Post code cannot be empty"),
  mobileNumber: z.string().nonempty("Mobile number cannot be empty"),
  emailAddress: z.string().email("Invalid email address"),
  dateOfBirth: z.coerce.date({ required_error: "Date of birth is required" }),
  school: z.string().optional(),
  medicalInformation: z.string().optional(),
  emergencyContact1: z.string().nonempty("Emergency contact 1 is required"),
  emergencyContact2: z.string().optional(),
  membershipType: z.string().nonempty("Membership type is required"),
  memberStatusType: z.string().optional(),
  guardianName: z.string().optional(),
  guardianEmail: z.string().optional(),
});

type MemberFormProps = {
  row?: Member;
  mode: "edit" | "add";
  trigger?: React.ReactNode;
};

export default function MemberForm({ row, mode, trigger }: MemberFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      givenName: "",
      preferredName: "",
      address: "",
      postCode: "",
      mobileNumber: "",
      emailAddress: "",
      dateOfBirth: new Date(),
      school: "",
      medicalInformation: "",
      emergencyContact1: "",
      emergencyContact2: "",
      membershipType: "",
      memberStatusType: "",
      guardianName: "",
      guardianEmail: "",
    },
  });

  useEffect(() => {
    if (row) {
      form.reset({
        givenName: row.GivenName,
        preferredName: row.PreferredName,
        address: row.Address,
        postCode: row.PostCode,
        mobileNumber: row.MobileNumber,
        emailAddress: row.EmailAddress,
        dateOfBirth: row.DateOfBirth ? new Date(row.DateOfBirth) : new Date(),
        school: row.School ?? "",
        medicalInformation: row.MedicalInformation ?? "",
        emergencyContact1: row.EmergencyContact1,
        emergencyContact2: row.EmergencyContact2 ?? "",
        membershipType: row.MembershipType,
        memberStatusType: MemberStatus[row.Status],
        guardianName: row.GuardianName ?? "",
        guardianEmail: row.GuardianEmailAddress ?? "",
      });
    } else {
      form.reset();
    }
  }, [row, form]);

  const { mutate: activateMember, isPending: isActivating } = useActivateMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();
  const { mutate: addMember, isPending: isAdding } = useAddMember();

  const loading = isActivating || isUpdating || isAdding;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: Partial<Member> = {
      GivenName: values.givenName,
      PreferredName: values.preferredName,
      Address: values.address,
      PostCode: values.postCode,
      MobileNumber: values.mobileNumber,
      EmailAddress: values.emailAddress,
      DateOfBirth: values.dateOfBirth,
      School: values.school,
      MedicalInformation: values.medicalInformation,
      EmergencyContact1: values.emergencyContact1,
      EmergencyContact2: values.emergencyContact2,
      MembershipType: values.membershipType,
      GuardianName: values.guardianName,
      GuardianEmailAddress: values.guardianEmail,
      Status: MemberStatus[values.memberStatusType as keyof typeof MemberStatus] ?? MemberStatus.Active,
    };

    if (mode === "add") {
      addMember(payload, {
        onSuccess: () => {
          toast({ title: "Member Added" });
          setOpen(false);
          router.refresh();
        },
      });
      return;
    }

    if (row?.Status === MemberStatus.Pending) {
      activateMember(row.Id, {
        onSuccess: () => {
          toast({ title: "Member Activated" });
          setOpen(false);
          router.refresh();
        },
      });
      return;
    }

    updateMember(
      { id: row!.Id, data: payload },
      {
        onSuccess: () => {
          toast({ title: "Member Updated" });
          setOpen(false);
          router.refresh();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <a className="text-primary underline cursor-pointer">
            {mode === "add"
              ? "Add Member"
              : row?.Status === MemberStatus.Pending
              ? "Review details"
              : "View details"}
          </a>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Member" : row?.GivenName}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter new member details"
              : "Member Details"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div>
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
                    {/* <Input placeholder="Membership Type" {...field} className="w-full" /> */}
                    <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Membership Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(memberSubscriptionTypes)
                    .filter((key) => isNaN(Number(key))) // Skip reverse enum keys
                    .map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
              {(row?.Status !== MemberStatus.Pending && <FormField control={form.control} name="memberStatusType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Member status</FormLabel>
                  <FormControl>
                    {/* <Input placeholder="Membership Type" {...field} className="w-full" /> */}
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Member Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(MemberStatus)
                    .filter((key) => isNaN(Number(key))) // Skip reverse enum keys
                    .map((type) => (type !== "undefined") && (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} /> )}    
            </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "add"
                ? "Add Member"
                : row?.Status === MemberStatus.Pending
                ? "Activate"
                : "Update"}
            </Button>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}