import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ShippingOption } from "../services/checkout.service";
import { formatRupiah } from "../utils/function";

type Props = {
  data: ShippingOption[];
  onSelect: (option: ShippingOption) => void;
  placeholder?: string;
  initialSelectedId?: number | null;
};

export const ChooseShippingDropdown = ({
  data,
  onSelect,
  placeholder = "Pilih Jenis Pengiriman",
  initialSelectedId = null,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // set initial selected (optional)
  useEffect(() => {
    if (!initialSelectedId) return;
    const found = data.find((d) => d.id === initialSelectedId) ?? null;
    setSelectedOption(found);
  }, [initialSelectedId, data]);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (option: ShippingOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option); // ✅ kirim option lengkap
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Button */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full border border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-white"
      >
        <div className="w-full">
          <div className={`w-full flex items-center justify-between p-3 ${selectedOption ? "border-b border-gray-300" : ""}`}>
            <span className="text-gray-700 text-sm font-medium">
              {selectedOption ? `${selectedOption.courier_name} (${selectedOption.service_code})` : placeholder}
            </span>

            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>

          {selectedOption && (
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-start">
                  <div className="text-sm font-semibold text-gray-800">
                    {selectedOption.service_name}
                  </div>
                  <div className="text-xs mt-1 text-gray-500 font-medium">
                    Estimasi: {selectedOption.estimation ?? "-"}
                  </div>
                </div>

                <span className="text-[#008CCF] text-sm font-semibold">
                  {formatRupiah(selectedOption.shipping_cost ?? 0)}
                </span>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-3 rounded">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Estimasi tiba dihitung setelah pesanan diterima oleh kurir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 m-3 rounded">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Estimasi tiba dihitung setelah pesanan diterima oleh kurir.
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="divide-y divide-gray-100 max-h-90 overflow-y-auto">
            {data.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => handleSelect(option)}
                className="w-full text-left p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {option.courier_name} ({option.service_code}) - {option.service_name}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>

                    <div className="text-sm text-gray-600">
                      Ongkir <span className="font-semibold">{formatRupiah(option.shipping_cost)}</span>
                      {option.estimation ? (
                        <span className="text-gray-400"> • Estimasi {option.estimation}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {data.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Tidak ada opsi pengiriman.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseShippingDropdown;