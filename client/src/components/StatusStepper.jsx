import React from "react";
import { Check, AlertTriangle, CheckCircle2 } from "lucide-react";

const STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" }
];

const STATUS_ORDER = {
  submitted: 1,
  assigned: 2,
  in_progress: 3,
  resolved: 4,
  closed: 5,
  reopened: 3
};

export default function StatusStepper({ status, closedReason }) {
  const currentStepNum = STATUS_ORDER[status] || 1;
  const isReopened = status === "reopened";

  return (
    <div className="my-4">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute top-3.5 left-5 right-5 h-0.5 bg-slate-200 z-0" />

        {/* Dynamic active progress fill */}
        <div
          className={"absolute top-3.5 left-5 h-0.5 z-0 transition-all duration-300 " +
            (isReopened ? "bg-amber-500" : "bg-pin-dark")}
          style={{
            width: Math.min(100, Math.max(0, ((currentStepNum - 1) / (STEPS.length - 1)) * 100)) + "%"
          }}
        />

        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStepNum > stepNumber || (status === "closed" && stepNumber === 5);
          const isCurrent = currentStepNum === stepNumber;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
              <div
                className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all " +
                  (isCompleted
                    ? "bg-pin-dark text-white border-2 border-pin-dark shadow-xs"
                    : isCurrent
                    ? (isReopened
                      ? "bg-amber-50 text-amber-800 border-2 border-amber-500 ring-2 ring-amber-100"
                      : status === "resolved"
                      ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-600 ring-2 ring-emerald-100"
                      : "bg-pin-pill text-pin-dark border-2 border-pin-dark ring-2 ring-pin-border")
                    : "bg-white text-pin-gray border-2 border-pin-border")}
              >
                {isCompleted ? (
                  <Check size={13} strokeWidth={3} />
                ) : isCurrent && isReopened ? (
                  <AlertTriangle size={13} />
                ) : isCurrent && status === "resolved" ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              <div
                className={"mt-1.5 text-[11px] text-center whitespace-nowrap " +
                  (isCurrent ? "font-bold text-slate-900" : isCompleted ? "font-semibold text-slate-600" : "text-slate-400")}
              >
                {isReopened && isCurrent ? "Reopened" : step.label}
              </div>
            </div>
          );
        })}
      </div>

      {closedReason && (
        <div className="text-center text-[11px] text-emerald-600 font-semibold mt-2">
          ✓ Verified resolution ({closedReason === "citizen_confirmed" ? "Citizen Confirmed" : "72h Auto-close"})
        </div>
      )}
    </div>
  );
}
