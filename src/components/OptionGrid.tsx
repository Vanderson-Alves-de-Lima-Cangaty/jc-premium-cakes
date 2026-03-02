"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

type Option<T extends string> = {
  id: T;
  label: React.ReactNode;
  description?: React.ReactNode;
};

type SingleChoiceProps<T extends string> = {
  multiple?: false;
  value: T | null;
  onChange: (value: T) => void;
};

type MultipleChoiceProps<T extends string> = {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
};

type OptionGridProps<T extends string> = {
  options: Option<T>[];
  className?: string;
} & (SingleChoiceProps<T> | MultipleChoiceProps<T>);

export function OptionGrid<T extends string>(props: OptionGridProps<T>) {
  const { options, className } = props;

  const handleClick = (id: T) => {
    if (props.multiple) {
      const currentValue = props.value as T[];
      const newValue = currentValue.includes(id)
        ? currentValue.filter((item) => item !== id)
        : [...currentValue, id];
      props.onChange(newValue);
    } else {
      props.onChange(id);
    }
  };

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {options.map((option) => {
        const isActive = props.multiple
          ? (props.value as T[]).includes(option.id)
          : props.value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleClick(option.id)}
            className="group block text-left"
          >
            <Card
              className={cn(
                "relative p-4 transition-all duration-150 ease-in-out group-hover:-translate-y-px group-hover:shadow-medium",
                isActive
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border"
              )}
            >
              {isActive && (
                <div className="absolute right-2 top-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
              <div className="font-semibold text-foreground">{option.label}</div>
              {option.description && (
                <div className="text-sm text-muted-foreground">
                  {option.description}
                </div>
              )}
            </Card>
          </button>
        );
      })}
    </div>
  );
}
