import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

export type DatePreset = "last_30_days" | "last_90_days" | "choose_date" | "";

type DraftRange = { from?: Date; to?: Date };

function toYMD(d?: Date) {
  return d ? dayjs(d).format("YYYY-MM-DD") : "";
}

export function useOrderDateFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ===== APPLIED (source of truth from URL) =====
  const applied = useMemo(() => {
    const preset = (searchParams.get("date") ?? "") as DatePreset;
    const start_date = searchParams.get("start_date") ?? "";
    const end_date = searchParams.get("end_date") ?? "";
    return { preset, start_date, end_date };
  }, [searchParams]);

  // ===== DRAFT (state inside dropdown before Apply) =====
  const [draftPreset, setDraftPreset] = useState<DatePreset>(applied.preset || "");
  const [draftRange, setDraftRange] = useState<DraftRange>(() => {
    return {
      from: applied.start_date ? dayjs(applied.start_date).toDate() : undefined,
      to: applied.end_date ? dayjs(applied.end_date).toDate() : undefined,
    };
  });

  const openDraftFromApplied = () => {
    setDraftPreset(applied.preset || "");
    setDraftRange({
      from: applied.start_date ? dayjs(applied.start_date).toDate() : undefined,
      to: applied.end_date ? dayjs(applied.end_date).toDate() : undefined,
    });
  };

  const apply = () => {
    const next = new URLSearchParams(searchParams);

    // bersihin dulu
    next.delete("date");
    next.delete("start_date");
    next.delete("end_date");

    const today = dayjs().startOf("day");

    if (draftPreset === "last_30_days") {
      const end = today;
      const start = today.subtract(30, "day");
      next.set("date", "last_30_days");
      next.set("start_date", start.format("YYYY-MM-DD"));
      next.set("end_date", end.format("YYYY-MM-DD"));
    }

    if (draftPreset === "last_90_days") {
      const end = today;
      const start = today.subtract(90, "day");
      next.set("date", "last_90_days");
      next.set("start_date", start.format("YYYY-MM-DD"));
      next.set("end_date", end.format("YYYY-MM-DD"));
    }

    if (draftPreset === "choose_date") {
      if (!draftRange.from || !draftRange.to) return;
      const start = dayjs(draftRange.from).startOf("day");
      const end = dayjs(draftRange.to).startOf("day");
      next.set("date", "choose_date");
      next.set("start_date", start.format("YYYY-MM-DD"));
      next.set("end_date", end.format("YYYY-MM-DD"));
    }

    setSearchParams(next, { replace: true });
  };

  const clearDate = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("date");
    next.delete("start_date");
    next.delete("end_date");
    setSearchParams(next, { replace: true });

    setDraftPreset("");
    setDraftRange({ from: undefined, to: undefined });
  };

  return {
    applied,
    draftPreset,
    setDraftPreset,
    draftRange,
    setDraftRange,
    openDraftFromApplied,
    apply,
    clearDate,
    toYMD,
  };
}
