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
