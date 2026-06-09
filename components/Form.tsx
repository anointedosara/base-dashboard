"use client";

import { useRef, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { CameraIcon, ChevronDownIcon } from "@/components/Icons";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl bg-canvas px-4 py-3 text-sm text-ink outline-none ring-1 ring-transparent transition placeholder:text-muted focus:bg-card focus:ring-primary/40";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "min-h-28 resize-none", props.className)} />;
}

export function Select({
  children,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select
        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        className={cn(inputClass, "appearance-none pr-10", props.className)}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

export function PhotoUpload({
  size = 96,
  value,
  onChange,
  error,
}: {
  size?: number;
  value?: string | null;
  onChange?: (file: File | null, url: string | null) => void;
  error?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        "mx-auto flex items-center justify-center overflow-hidden rounded-full bg-canvas text-ink-soft transition hover:bg-line",
        error && "ring-2 ring-danger",
      )}
      style={{ width: size, height: size }}
      aria-label="Upload photo"
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Selected" className="h-full w-full object-cover" />
      ) : (
        <CameraIcon className="h-6 w-6" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onChange?.(file, file ? URL.createObjectURL(file) : null);
        }}
      />
    </button>
  );
}
