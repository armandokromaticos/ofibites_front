"use client";

import { cn } from "@heroui/react";
import { Search } from "lucide-react";

import { AtInput } from "@/ui/atomic/atoms";

import { MlSearchBarProps } from "./ml-search-bar.types";

export function MlSearchBar({
  placeholder = "Buscar...",
  value,
  onValueChange,
  label,
  variant = "compact",
  className,
}: MlSearchBarProps) {
  if (variant === "inset") {
    return (
      <AtInput
        type="search"
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        isClearable
        onClear={() => onValueChange?.("")}
        startContent={<Search aria-hidden="true" className="size-3.5 shrink-0 text-placeholder" strokeWidth={2.25} />}
        className={cn("w-full", className)}
        classNames={{
          // Sin borde en reposo, hover ni foco: el foco se ve por el anillo de AtInput.
          inputWrapper: cn(
            "h-10 min-h-10 gap-2.5 bg-background px-[18px] shadow-none",
            "border-transparent data-[hover=true]:border-transparent group-data-[focus=true]:border-transparent",
          ),
          input: "text-sm font-normal placeholder:text-muted [&::-webkit-search-cancel-button]:hidden",
          clearButton: "text-muted",
        }}
      />
    );
  }

  if (variant === "catalog") {
    return (
      <AtInput
        type="search"
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        isClearable
        onClear={() => onValueChange?.("")}
        startContent={<Search aria-hidden="true" className="size-[18px] shrink-0 text-muted" />}
        className={cn("w-full", className)}
        classNames={{
          inputWrapper: "h-12 bg-content1 px-4 gap-2",
          input: "text-sm font-semibold [&::-webkit-search-cancel-button]:hidden",
          clearButton: "text-muted",
        }}
      />
    );
  }

  return (
    <AtInput
      aria-label={label ?? placeholder}
      placeholder={placeholder}
      value={value}
      onValueChange={onValueChange}
      className={cn("max-w-sm", className)}
      classNames={{
        inputWrapper:
          "bg-white h-10 focus-within:ring-0 focus-within:outline-none",
        innerWrapper: "h-full flex items-center",
        input: "text-center leading-none outline-none",
      }}
    />
  );
}
