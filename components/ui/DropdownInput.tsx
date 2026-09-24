"use client";
export default function DropdownInput({
  name,
  items,
  defaultValue,
}: {
  name: string;
  items: { id: number; name: string }[];
  defaultValue?: string;
}) {
  return (
    <select
      id={name}
      name={name}
      defaultValue={defaultValue || items[0]?.name}
      className="w-full rounded-xl border border-input bg-offwhite p-3"
    >
      {items.map((item) => (
        <option key={item.id} value={item.name}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
