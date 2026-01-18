type Preset = "last_30_days" | "last_90_days" | "choose_date";

export const CustomRadio = ({
  value,
  label,
  checked,
  onChange,
  name = "date_preset",
}: {
  value: Preset;
  label: string;
  checked: boolean;
  onChange: (v: Preset) => void;
  name?: string;
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      {/* native radio (hidden) */}
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />

      {/* custom radio */}
      <span
        className={[
          "relative inline-flex h-5 w-5 items-center justify-center rounded-full border-2",
          checked ? "border-[#ff6a00]" : "border-gray-500",
        ].join(" ")}
      >
        <span
          className={[
            "h-2.5 w-2.5 rounded-full",
            checked ? "bg-[#ff6a00]" : "bg-transparent",
          ].join(" ")}
        />
      </span>

      {/* label text */}
      <span className={checked ? "text-[#ff6a00] font-semibold" : "text-gray-900 font-semibold"}>
        {label}
      </span>
    </label>
  );
}
