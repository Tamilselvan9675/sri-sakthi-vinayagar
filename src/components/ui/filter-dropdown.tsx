"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Messages } from "@/i18n/get-messages";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  paramName: string;
  options: FilterOption[];
  defaultValue?: string;
  placeholder: string;
  messages: Messages;
}

export function FilterDropdown({
  paramName,
  options,
  defaultValue = "",
  placeholder,
}: FilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentParam = searchParams.get(paramName) ?? defaultValue;
  const [selectedValue, setSelectedValue] = useState(currentParam);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    
    startTransition(() => {
      const queryString = createQueryString(paramName, value);
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-auto">
      <select
        className={`w-full sm:w-auto min-w-[150px] appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isPending ? 'opacity-70' : ''}`}
        value={selectedValue}
        onChange={handleChange}
        disabled={isPending}
        aria-label={placeholder}
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
