"use client";

import { useState } from "react";
import type { FlowStage } from "@/contracts/content-model";
import { Arrow } from "./icons";

const defaultStages = [
  {
    id: "1",
    label: "Instruction",
    explanation: "Receive and validate the local payment details.",
    nextQuestion: "Which details and reference does the instruction need?",
  },
  {
    id: "2",
    label: "Processing",
    explanation: "Track checks, progress and the exception paths.",
    nextQuestion: "What happens while the outcome is pending?",
  },
  {
    id: "3",
    label: "Confirmation",
    explanation: "Recognise the outcome and reconcile the record.",
    nextQuestion: "Which event and record is authoritative?",
  },
];
export function FlowAnatomy({
  stages = defaultStages,
  compact = false,
}: {
  stages?: FlowStage[];
  compact?: boolean;
}) {
  const [active, setActive] = useState(1);
  return (
    <div className={`flow-anatomy ${compact ? "compact" : ""}`}>
      <div className="flow-caption">
        <span className="eyebrow">
          {compact ? "CONCEPTUAL LIFECYCLE" : "THE OPERATING PATH"}
        </span>
        <span className="small muted">Illustrative flow</span>
      </div>
      <div className="flow-stages">
        {stages.map((s, i) => (
          <button
            key={s.id}
            className={`flow-stage ${active === i ? "selected" : ""}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            <span className="flow-node">
              {active === i ? <span /> : `0${i + 1}`}
            </span>
            <strong>{s.label}</strong>
            <span className="muted">{s.explanation}</span>
          </button>
        ))}
      </div>
      <div className="flow-question" role="status">
        <span className="small muted">NEXT QUESTION</span>
        <p>{stages[active].nextQuestion}</p>
        <Arrow />
      </div>
    </div>
  );
}
export function FlowSpecimen({
  payout = false,
  settlement = false,
}: {
  payout?: boolean;
  settlement?: boolean;
}) {
  const labels = settlement
    ? [
        "Balance and scope",
        "Currency and destination",
        "Timing and conditions",
        "Records and exceptions",
      ]
    : payout
      ? ["Recipient", "Merchant reference", "Processing status", "Confirmation"]
      : [
          "Customer instruction",
          "Local method",
          "Processing status",
          "Confirmation",
        ];
  const descriptions = settlement
    ? [
        "Define the balance and operating agreement.",
        "Agree the desired asset and destination.",
        "Assess scheduling and dependencies.",
        "Keep reporting and reconciliation connected.",
      ]
    : [
        "Define the required details for this market.",
        "Keep a reference shared across systems.",
        "Track progress and handle exceptions.",
        "Agree the authoritative outcome record.",
      ];
  const [active, setActive] = useState(0);
  return (
    <div className="flow-specimen">
      <span className="eyebrow">ILLUSTRATIVE FLOW</span>
      <ol>
        {labels.map((label, i) => (
          <li key={label} className={active === i ? "selected" : ""}>
            <button aria-pressed={active === i} onClick={() => setActive(i)}>
              <span className="specimen-index">0{i + 1}</span>
              <span className="specimen-dot" />
              <span>
                <strong>{label}</strong>
                <span className="muted">{descriptions[i]}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="small muted">
        A planning example. No payment is being processed.
      </p>
    </div>
  );
}
export function CopyCode({ code }: { code: string }) {
  const [status, setStatus] = useState("Copy");
  return (
    <div className="code-specimen">
      <div className="code-head">
        <span className="eyebrow">CONCEPTUAL EXAMPLE</span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setStatus("Copied");
            } catch {
              setStatus("Select text to copy");
            }
          }}
        >
          <span role="status">{status}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      <p className="small muted">
        Planning guidance. The actual integration contract defines fields and
        events.
      </p>
    </div>
  );
}
