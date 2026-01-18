import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useOrderDateFilter } from "../hooks/order/useOrderDateFilter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomRadio } from "./CustomRadio";

type Preset = "last_30_days" | "last_90_days" | "choose_date";

function startOfMonth(d: Date) {
    const x = new Date(d);
    x.setDate(1);
    x.setHours(0, 0, 0, 0);
    return x;
}
function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function addDays(d: Date, days: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}
function addMonths(d: Date, months: number) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + months);
    return x;
}
function buildPresetRange(preset: Preset) {
    const today = startOfDay(new Date());
    if (preset === "last_30_days") return { from: addDays(today, -29), to: today } satisfies DateRange;
    if (preset === "last_90_days") return { from: addDays(today, -89), to: today } satisfies DateRange;
    return { from: undefined, to: undefined } satisfies DateRange;
}

export default function OrderDateFilterDropdown() {
    const { draftPreset, setDraftPreset, draftRange, setDraftRange, apply, clearDate } = useOrderDateFilter();

    const [hoverTo, setHoverTo] = useState<Date | undefined>(undefined);

    const today = useMemo(() => startOfDay(new Date()), []);
    const [displayMonth, setDisplayMonth] = useState<Date>(() => startOfMonth(today));

    const selectedRange: DateRange | undefined = useMemo(() => {
        if (draftPreset === "last_30_days" || draftPreset === "last_90_days") {
            return buildPresetRange(draftPreset);
        }
        if (draftRange.from && draftRange.to) return { from: draftRange.from, to: draftRange.to };
        if (draftRange.from) return { from: draftRange.from, to: undefined };
        return undefined;
    }, [draftPreset, draftRange.from, draftRange.to]);

    const previewRange: DateRange | undefined = useMemo(() => {
        if (draftPreset !== "choose_date") return undefined;
        if (draftRange.from && !draftRange.to && hoverTo) {
            const from = draftRange.from;
            const to = hoverTo;
            return from <= to ? { from, to } : { from: to, to: from };
        }
        return undefined;
    }, [draftPreset, draftRange.from, draftRange.to, hoverTo]);

    const disabled = useMemo(() => {
        if (draftPreset === "last_30_days" || draftPreset === "last_90_days") return { after: today };
        return undefined;
    }, [draftPreset, today]);

    const handleChangePreset = (preset: Preset) => {
        setDraftPreset(preset);
        setHoverTo(undefined);

        if (preset === "last_30_days" || preset === "last_90_days") {
            const r = buildPresetRange(preset);
            setDraftRange({ from: r.from, to: r.to });
            if (r.from) setDisplayMonth(startOfMonth(r.from));
            return;
        }
    };

    const switchToChooseDateAndSetFrom = (day: Date) => {
        setDraftPreset("choose_date");
        setHoverTo(undefined);

        const d = startOfDay(day);
        setDraftRange({ from: d, to: undefined });
        setDisplayMonth(startOfMonth(d));
    };

    return (
        <div className="w-[900px] max-w-full rounded-xl bg-white">
            <div className="flex gap-0">
                {/* LEFT PANEL */}
                <div className="w-[220px] rounded-xl bg-[#f6f6f6] p-4">
                    <div className="space-y-5 text-[15px]">
                        <CustomRadio
                            value="last_30_days"
                            label="30 hari terakhir"
                            checked={draftPreset === "last_30_days"}
                            onChange={handleChangePreset}
                        />

                        <CustomRadio
                            value="last_90_days"
                            label="90 hari terakhir"
                            checked={draftPreset === "last_90_days"}
                            onChange={handleChangePreset}
                        />

                        <CustomRadio
                            value="choose_date"
                            label="Pilih tanggal sendiri"
                            checked={draftPreset === "choose_date"}
                            onChange={handleChangePreset}
                        />

                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex-1 px-2">
                    <div className="relative py-6 order-date-picker">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="flex items-center justify-center mr-4"
                                onClick={() => setDisplayMonth((m) => startOfMonth(addMonths(m, -1)))}
                                aria-label="Prev month"
                            >
                                <ChevronLeft />
                            </button>

                            <DayPicker
                                month={displayMonth}
                                onMonthChange={setDisplayMonth}
                                mode="range"
                                numberOfMonths={2}
                                selected={selectedRange}
                                disabled={disabled}
                                onDayClick={(day) => {
                                    const d = startOfDay(day);

                                    if (draftPreset === "last_30_days" || draftPreset === "last_90_days") {
                                        switchToChooseDateAndSetFrom(d);
                                        return;
                                    }

                                    if (!draftRange.from || (draftRange.from && draftRange.to)) {
                                        setDraftRange({ from: d, to: undefined });
                                        setHoverTo(undefined);
                                    }
                                }}
                                onSelect={(range) => {
                                    if (draftPreset !== "choose_date") setDraftPreset("choose_date");

                                    const r = range as DateRange | undefined;
                                    setDraftRange({ from: r?.from, to: r?.to });
                                    if (r?.from && r?.to) setHoverTo(undefined);
                                }}
                                onDayMouseEnter={(day) => {
                                    if (draftPreset !== "choose_date") return;
                                    if (draftRange.from && !draftRange.to) setHoverTo(startOfDay(day));
                                }}
                                modifiers={{ preview: previewRange }}
                                modifiersClassNames={{
                                    range_start: "um-range-start",
                                    range_end: "um-range-end",
                                    range_middle: "um-range-middle",
                                    preview: "um-range-preview",
                                }}
                                classNames={{
                                    root: "relative",
                                    months: "flex gap-3 items-start justify-center",
                                    month: "rounded-xl border border-gray-200 p-3 text-center",
                                    month_caption: "text-center",
                                    caption: "flex items-center justify-center mb-2",
                                    caption_label: "text-[15px] font-semibold",

                                    table: "w-full border-collapse",
                                    head_cell: "text-[12px] text-gray-500 w-8 h-7 text-center font-medium",
                                    cell: "w-8 h-8 text-center p-0",
                                    day: "w-8 h-8 text-[12px] hover:bg-gray-100",
                                    selected: "text-[12px]",
                                    nav: "hidden",
                                }}
                            />

                            <button
                                type="button"
                                className="flex items-center justify-center ml-4"
                                onClick={() => setDisplayMonth((m) => startOfMonth(addMonths(m, 1)))}
                                aria-label="Next month"
                            >
                                <ChevronRight />
                            </button>
                        </div>

                        <style>{`
                            /* start & end: circle */
                            .um-range-start,
                            .um-range-end,
                            .um-range-preview {
                                background: #ff6a00 !important;
                                color: white !important;
                                border-radius: 9999px !important;
                            }

                            /* middle: pale rectangle */
                            .um-range-middle {
                                background: rgba(255, 106, 0, 0.18) !important;
                            }

                            /* pastiin button ngikut ukuran kecil */
                            .order-date-picker .rdp-day_button {
                                width: 32px !important;
                                height: 32px !important;
                                margin: 0 auto !important;
                            }

                            /* remove blue focus ring */
                            .order-date-picker .rdp-day,
                            .order-date-picker .rdp-day_button,
                            .order-date-picker .rdp-button {
                                outline: none !important;
                                box-shadow: none !important;
                                border: none !important;
                            }
                            .order-date-picker .rdp-day:focus,
                            .order-date-picker .rdp-day:focus-visible,
                            .order-date-picker .rdp-day_button:focus,
                            .order-date-picker .rdp-day_button:focus-visible,
                            .order-date-picker .rdp-button:focus,
                            .order-date-picker .rdp-button:focus-visible {
                                outline: none !important;
                                box-shadow: none !important;
                            }

                            .order-date-picker .rdp-day_outside {
                                pointer-events: none;
                            }
                        `}</style>
                    </div>

                    {/* FOOTER BAR */}
                    <div className="flex items-center justify-end gap-6 border-t border-gray-200 px-6 py-4">
                        <button className="text-sm text-gray-400 hover:text-gray-600" onClick={clearDate}>
                            Hapus
                        </button>

                        <button
                            className="h-10 px-5 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-500"
                            onClick={apply}
                            disabled={draftPreset === "choose_date" ? !draftRange.from || !draftRange.to : false}
                        >
                            Terapkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
