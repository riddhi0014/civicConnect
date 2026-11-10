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
    <div className="stepper-container">
      <div className="stepper-flex">
        {/* Background track */}
        <div className="stepper-track-bg" />

        {/* Dynamic active progress fill */}
        <div
          className="stepper-track-fill"
          style={{
            backgroundColor: isReopened ? "var(--color-warning)" : "var(--pin-dark)",
            width: Math.min(100, Math.max(0, ((currentStepNum - 1) / (STEPS.length - 1)) * 100)) + "%"
          }}
        />

        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStepNum > stepNumber || (status === "closed" && stepNumber === 5);
          const isCurrent = currentStepNum === stepNumber;

          let circleBg = "#ffffff";
          let circleColor = "var(--pin-gray)";
          let circleBorder = "2px solid var(--border-color)";

          if (isCompleted) {
            circleBg = "var(--pin-dark)";
            circleColor = "#ffffff";
            circleBorder = "2px solid var(--pin-dark)";
          } else if (isCurrent) {
            if (isReopened) {
              circleBg = "var(--color-warning-bg)";
              circleColor = "var(--color-warning-text)";
              circleBorder = "2px solid var(--color-warning)";
            } else if (status === "resolved") {
              circleBg = "var(--color-success-bg)";
              circleColor = "var(--color-success-text)";
              circleBorder = "2px solid var(--color-success)";
            } else {
              circleBg = "var(--pin-pill)";
              circleColor = "var(--pin-dark)";
              circleBorder = "2px solid var(--pin-dark)";
            }
          }

          let labelColor = "var(--text-light)";
          let labelWeight = 400;
          if (isCurrent) {
            labelColor = "var(--text-dark)";
            labelWeight = 700;
          } else if (isCompleted) {
            labelColor = "var(--text-secondary)";
            labelWeight = 600;
          }

          return (
            <div key={step.key} className="stepper-step-col">
              <div
                className="stepper-circle"
                style={{
                  background: circleBg,
                  color: circleColor,
                  border: circleBorder
                }}
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
                className="stepper-step-label"
                style={{ color: labelColor, fontWeight: labelWeight }}
              >
                {isReopened && isCurrent ? "Reopened" : step.label}
              </div>
            </div>
          );
        })}
      </div>

      {closedReason && (
        <div style={{ textAlign: "center", fontSize: "0.6875rem", color: "var(--color-success-text)", fontWeight: 600, marginTop: "0.5rem" }}>
          ✓ Verified resolution ({closedReason === "citizen_confirmed" ? "Citizen Confirmed" : "72h Auto-close"})
        </div>
      )}
    </div>
  );
}
