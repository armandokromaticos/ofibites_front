"use client";

import { AtInput } from "@/libs/cantaritos-ui/atoms";

import { MlSearchBarProps } from "./ml-search-bar.types";

export function MlSearchBar({
  placeholder = "Buscar...",
  value,
  onValueChange,
}: MlSearchBarProps) {
  return (
    <AtInput
      placeholder={placeholder}
      value={value}
      onValueChange={onValueChange}
      className="max-w-sm"
      classNames={{
        inputWrapper:
          "bg-white h-10 focus-within:ring-0 focus-within:outline-none",
        innerWrapper: "h-full flex items-center",
        input: "text-center leading-none outline-none",
      }}
    />
  );
}