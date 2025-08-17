'use client';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Member } from "../types/member";
import { MemberStatus } from "../types/enums/memberStatusTypes";
import { memberSubscriptionTypes } from "../types/enums/memberSubscriptionTypes";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

import { useActivateMember } from "../memberModulation/useActivateMember";
// import { useUpdateMember } from "../memberModulation/useUpdateMember"; // You'll create this

import { useEffect } from "react";
import { useUpdateMember } from "../memberModulation/useUpdateMember";

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
  guardianName: z.string().optional(),
  guardianEmail: z.string().optional(),
});

type MemberFormProps = { row: Member };

export default function MemberForm({ row }: MemberFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  // Initialize form with react-hook-form + zod resolver
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
      guardianName: "",
      guardianEmail: "",
    },
  });

  // Fill form when `row` changes
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
        guardianName: row.GuardianName ?? "",
        guardianEmail: row.GuardianEmailAddress ?? "",
      });
    }
  }, [row, form]);

  // React Query mutation hooks for activate and update
  const {
    mutate: activateMember,
    isPending: isActivating,
  } = useActivateMember();

  const {
    mutate: updateMember,
    isPending: isUpdating,
  } = useUpdateMember();

  // Handle form submit
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (row.Status === MemberStatus.Pending) {
      // Activate member (mutation expects id)
      activateMember(row.Id, {
        onSuccess: (data) => {
          toast({ title: "Member Activated", description: `${data.GivenName} is now active!` });
          router.refresh();
        },
        onError: (error: any) => {
          toast({ variant: "destructive", title: "Activation failed", description: error.message });
        },
      });
    } else {
      // Update member (mutation expects updated data)
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
      };

      updateMember(
        { id: row.Id, data: payload },
        {
          onSuccess: (data) => {
            toast({ title: "Member Updated", description: `${data.GivenName} has been updated.` });
            router.refresh();
          },
          onError: (error: any) => {
            toast({ variant: "destructive", title: "Update failed", description: error.message });
          },
        }
      );
    }
  };

  const loading = isActivating || isUpdating;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <a className="text-primary underline cursor-pointer">
          {row.Status === MemberStatus.Pending ? "Review details" : "View details"}
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
      </div>
      </div>
      <Button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : row.Status === MemberStatus.Pending
                ? "Activate"
                : "Update"}
            </Button>
    </form>
  </Form>
        </div>

        <DialogFooter>
          <DialogClose asChild>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
