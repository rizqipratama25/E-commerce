import { ChevronDown } from "lucide-react";
import { useState } from "react";

type FilterSectionProps = {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

export const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-300 py-4">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between"
            >
                <div className="text-sm font-semibold text-gray-900">{title}</div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && <div className="mt-3">{children}</div>}
        </div>
    );
}