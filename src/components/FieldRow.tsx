"use client";

import * as m from "motion/react-m";
import { CheckIcon, XIcon } from "lucide-react";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] leading-none transition-colors duration-150 select-none",
        "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        active
          ? "border-primary/40 bg-primary/10 text-foreground shadow-[inset_0_0_0_1px_var(--color-primary)] dark:bg-primary/15"
          : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
        className,
      )}
    >
      {active && <CheckIcon className="size-3 text-primary" />}
      {children}
    </m.button>
  );
}

export function FieldRow({
  label,
  hint,
  placeholder,
  value,
  options,
  onChange,
  icon,
  autoFocus,
  step,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon: React.ReactNode;
  autoFocus?: boolean;
  step: number;
}) {
  const id = useId();
  const filled = value.trim().length > 0;

  return (
    <m.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold tabular-nums transition-colors",
            filled
              ? "border-primary/40 bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
          aria-hidden
        >
          {filled ? <CheckIcon className="size-3.5" /> : step}
        </span>
        <span className="text-muted-foreground [&>svg]:size-4" aria-hidden>
          {icon}
        </span>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className="h-11 rounded-xl bg-card pr-10 text-[15px] shadow-none transition-shadow focus-visible:shadow-[0_0_0_4px_var(--color-glow)]"
        />
        {filled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onChange("")}
            aria-label={`Clear ${label}`}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
      </div>

      {options.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {options.map((o) => (
            <Chip key={o} active={value === o} onClick={() => onChange(value === o ? "" : o)}>
              {o}
            </Chip>
          ))}
        </div>
      )}
    </m.section>
  );
}

