"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FieldDef } from "@/lib/presets";
import { cn } from "@/lib/utils";

/**
 * One refine row: label · editable value · suggestion popover.
 * Reads like a spec sheet line, not a form card.
 */
export function RefineRow({
  def,
  value,
  onChange,
  developing,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
  developing: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const filled = value.trim().length > 0;

  return (
    <div
      className={cn(
        "group grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 py-1.5 sm:grid-cols-[112px_minmax(0,1fr)_auto]",
      )}
    >
      <label htmlFor={id} className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full transition-colors duration-300",
            filled ? "bg-primary" : "bg-border",
          )}
        />
        {def.label}
      </label>

      <div className="relative min-w-0">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "h-9 w-full min-w-0 rounded-md bg-transparent px-2 text-[15px] text-foreground outline-none transition-colors",
            "placeholder:text-muted-foreground/55 hover:bg-accent/60 focus:bg-accent/80 focus-visible:outline-none",
            developing && filled && "animate-develop",
          )}
        />
      </div>

      <div className="flex items-center">
        {filled && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Clear ${def.label}`}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground/70 opacity-0 transition hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
          >
            <XIcon className="size-3.5" />
          </button>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`${def.label} suggestions`}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[12px] text-muted-foreground transition hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
            >
              <span className="hidden sm:inline">Ideas</span>
              <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={6} className="w-72 p-1.5">
            <p className="px-2 pt-1 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {def.label}
            </p>
            <ul role="listbox" aria-label={`${def.label} suggestions`} className="max-h-72 overflow-auto">
              {def.options.map((o) => {
                const active = value === o;
                return (
                  <li key={o} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(active ? "" : o);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-[14px] transition-colors hover:bg-accent",
                        active && "text-primary",
                      )}
                    >
                      {o}
                      <AnimatePresence>
                        {active && (
                          <m.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                            <CheckIcon className="size-3.5" />
                          </m.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
