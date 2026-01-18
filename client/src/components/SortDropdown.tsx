import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type SortValue = "relevance" | "newest" | "price_asc" | "price_desc";

type SortOption = {
    label: string;
    value: SortValue;
};

type Props = {
    value: SortValue;
    onChange: (value: SortValue) => void;
    className?: string;
};

const OPTIONS: SortOption[] = [
    { label: "Paling Sesuai", value: "relevance" },
    { label: "Produk Terbaru", value: "newest" },
    { label: "Harga Terendah", value: "price_asc" },
    { label: "Harga Tertinggi", value: "price_desc" },
];

export default function SortDropdown({ value, onChange, className }: Props) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    const activeLabel = useMemo(() => {
        return OPTIONS.find((o) => o.value === value)?.label ?? "Paling Sesuai";
    }, [value]);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    return (
        <div ref={wrapRef} className={["relative", className ?? ""].join(" ")}>
            {/* Button like ruparupa */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={[
                    "inline-flex items-center justify-between gap-2",
                    "min-w-45",
                    "px-4 py-2 rounded-md",
                    "border border-gray-300 bg-white",
                    "text-sm font-semibold text-gray-700",
                    "hover:border-gray-400",
                ].join(" ")}
            >
                <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                    {activeLabel}
                </span>
                <ChevronDown className={["w-4 h-4 transition-transform", open ? "rotate-180" : ""].join(" ")} />
            </button>

            {/* Menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                    {OPTIONS.map((opt) => {
                        const active = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={[
                                    "w-full text-left px-4 py-3 text-sm",
                                    "hover:bg-gray-50",
                                    active ? "bg-orange-50 text-[#F26A24] font-semibold" : "text-gray-700",
                                ].join(" ")}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}