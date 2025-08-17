import { Member } from "./member";

export type InvoiceDetail = {
  InvoiceId: number;
  DueDate: string;
  StartDate: string;
  subscriptiontype: number;
  MemberSubscriptionType: string;
  TermLabel: string;
  MemberIds: number[];
};

export type MemberInvoiceDetail = {
    MemberInvoiceId: number
    InvoiceId: number;
    MemberId: number;
    IsPaid: boolean;
    IsNotified: boolean;
};

export type InvoiceWithMemberDetails = {
  invoice: InvoiceDetail;
  memberDetails: Member[];
  MemberInvoiceDetails: MemberInvoiceDetail[];
};
