"use client";

import type { ChangeEvent, SelectHTMLAttributes } from "react";

type AutoSubmitSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function AutoSubmitSelect({
  onChange,
  children,
  ...props
}: AutoSubmitSelectProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event);
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <select {...props} onChange={handleChange}>
      {children}
    </select>
  );
}
