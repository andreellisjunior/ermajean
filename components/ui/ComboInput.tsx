"use client";
import { Input } from "./input";
export default function ComboInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  return (
    <Input
      name={name}
      defaultValue={defaultValue}
      placeholder="20 minutes"
      required
    />
  );
}
