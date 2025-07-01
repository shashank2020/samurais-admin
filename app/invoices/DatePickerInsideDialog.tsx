// components/DatePickerInsideDialog.tsx
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // optional utility to combine classNames

type Props = {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  className?: string;
};

export const DatePickerInsideDialog = ({ label, value, onChange, className }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-48 justify-between font-normal"
          >
            {value ? value.toLocaleDateString("en-NZ") : "Select date"}
            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        {/* Popover rendered inline, NOT in portal */}
        <PopoverContent
          align="start"
          disablePortal
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="single"
            selected={value ?? undefined}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) {
                onChange(date);
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
