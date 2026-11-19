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
    <div style={{ margin: "0.5rem 0 0.25rem 0" }}>
      {/* Sleek Segmented Pipeline */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", alignItems: "center" }}>
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStepNum > stepNumber || (status === "closed" && stepNumber === 5);
          const isCurrent = currentStepNum === stepNumber;

          let barBg = "#e2e8f0";
          let labelColor = "#94a3b8";
          let labelWeight = 500;

          if (isCompleted) {
            barBg = "#1e293b";
            labelColor = "#334155";
            labelWeight = 600;
          } else if (isCurrent) {
            if (isReopened) {
              barBg = "#d97706";
              labelColor = "#b45309";
              labelWeight = 700;
            } else if (status === "resolved") {
              barBg = "#16a34a";
              labelColor = "#15803d";
              labelWeight = 700;
            } else {
              barBg = "#2563eb";
              labelColor = "#1d4ed8";
              labelWeight = 700;
            }
          }

          return (
            <div key={step.key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div
                style={{
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: barBg,
                  transition: "background-color 0.25s ease"
                }}
              />
              <div
                style={{
                  fontSize: "10.5px",
                  color: labelColor,
                  fontWeight: labelWeight,
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {isCompleted ? (
                  <Check size={10} strokeWidth={3} style={{ color: "#334155", flexShrink: 0 }} />
                ) : isCurrent && isReopened ? (
                  <AlertTriangle size={10} style={{ color: "#d97706", flexShrink: 0 }} />
                ) : isCurrent && status === "resolved" ? (
                  <CheckCircle2 size={10} style={{ color: "#16a34a", flexShrink: 0 }} />
                ) : null}
                <span>{isReopened && isCurrent ? "Reopened" : step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {closedReason && (
        <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600, marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
          <CheckCircle2 size={12} />
          <span>Resolution verified ({closedReason === "citizen_confirmed" ? "Citizen Confirmed" : "72h Auto-close"})</span>
        </div>
      )}
    </div>
  );
}
