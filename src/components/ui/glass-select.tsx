"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

/**
 * Drop-in replacement for a native <select>. It keeps a real (visually hidden)
 * <select> in the DOM so value / onChange / react-hook-form `register` / form
 * submission behave exactly as before, and only swaps the option list UI for a
 * glassmorphism popup. The trigger inherits the `className` given to the select.
 */

type Opt = { value: string; label: string; disabled?: boolean };

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) {
    return textOf((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function collect(children: React.ReactNode, out: Opt[] = []): Opt[] {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: React.ReactNode;
    };
    if (child.type === "option") {
      const label = textOf(props.children);
      out.push({
        value: props.value !== undefined ? String(props.value) : label,
        label,
        disabled: props.disabled,
      });
    } else if (props.children) {
      collect(props.children, out);
    }
  });
  return out;
}

export const GlassSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function GlassSelect({ className, children, disabled, ...rest }, forwardedRef) {
  const selectRef = React.useRef<HTMLSelectElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const options = collect(children);

  const setRefs = (el: HTMLSelectElement | null) => {
    selectRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  };

  // Mirror the native select's value (covers controlled, uncontrolled and RHF).
  React.useEffect(() => {
    setMounted(true);
    const v = selectRef.current?.value ?? "";
    setCurrent((prev) => (prev === v ? prev : v));
  });

  const selected = options.find((o) => o.value === current);

  const updateRect = React.useCallback(() => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
  }, []);

  React.useEffect(() => {
    if (!open) return;
    updateRect();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, updateRect]);

  const commit = (opt: Opt) => {
    if (opt.disabled) return;
    const el = selectRef.current;
    if (el) {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value"
      )?.set;
      setter?.call(el, opt.value);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setCurrent(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const openList = () => {
    if (disabled) return;
    const idx = options.findIndex((o) => o.value === current);
    setActive(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[active]) commit(options[active]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const spaceBelow = rect ? window.innerHeight - rect.bottom : 0;
  const openUp = rect ? spaceBelow < 220 && rect.top > spaceBelow : false;

  return (
    <>
      <select
        {...rest}
        ref={setRefs}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      >
        {children}
      </select>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={rest["aria-label"]}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`${className ?? ""} text-left`}
      >
        <span className="block truncate">{selected?.label ?? ""}</span>
      </button>
      {mounted &&
        open &&
        rect &&
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            style={{
              position: "fixed",
              left: rect.left,
              minWidth: Math.max(rect.width, 120),
              ...(openUp
                ? { bottom: window.innerHeight - rect.top + 6 }
                : { top: rect.bottom + 6 }),
              maxHeight: 260,
              zIndex: 100,
            }}
            className="animate-in fade-in-0 zoom-in-95 overflow-y-auto rounded-xl border border-white/30 bg-white/60 p-1.5 text-foreground shadow-[0_8px_32px_rgba(31,38,135,0.25)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 duration-150 dark:border-white/10 dark:bg-neutral-900/60 dark:ring-white/5"
          >
            {options.map((o, i) => {
              const isSel = o.value === current;
              return (
                <div
                  key={`${o.value}-${i}`}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(o)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    i === active ? "bg-white/50 dark:bg-white/10" : ""
                  } ${isSel ? "font-semibold text-temple-gold" : ""} ${
                    o.disabled ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSel && <Check className="h-4 w-4 shrink-0" />}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
});
