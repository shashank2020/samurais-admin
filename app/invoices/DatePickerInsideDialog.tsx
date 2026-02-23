"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  className?: string;
  mode?: "date" | "month" | "year";
  readOnly?: boolean;
};

export const DatePickerInsideDialog = ({
  label,
  value,
  onChange,
  className,
  mode = "date",
  readOnly = false,
}: Props) => {
  const [open, setOpen] = useState(false);

  // Format the value depending on mode
  const formatValue = (date: Date | null) => {
    if (!date) return "Select date";
    switch (mode) {
      case "date":
        return date.toLocaleDateString("en-NZ");
      case "month":
        return date.toLocaleDateString("en-NZ", { month: "long", year: "numeric" });
      case "year":
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString("en-NZ");
    }
  };

  // When a date is selected, adjust it based on mode
  const handleSelect = (date: Date) => {
    if (mode === "month") {
      onChange(new Date(date.getFullYear(), date.getMonth(), 1)); // first day of month
    } else if (mode === "year") {
      onChange(new Date(date.getFullYear(), 0, 1)); // Jan 1st
    } else {
      onChange(date);
    }
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-48 justify-between font-normal"
            disabled={readOnly}
          >
            {formatValue(value)}
            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" disablePortal onPointerDown={(e) => e.stopPropagation()}>
          <Calendar
            mode="single"
            required={true}
            selected={value ?? undefined}
            captionLayout="dropdown"
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
