import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PageTitle } from "./PageTitle";

const cardStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #DBE1E9",
  borderRadius: 12,
  padding: "24px 28px",
  width: 380,
  background: "#FFFFFF",
  boxShadow: "0 1px 2px rgba(18,22,31,0.04), 0 8px 24px rgba(18,22,31,0.05)",
};

const linkPillStyle: CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  color: "#0C8F8A",
  fontSize: "0.85rem",
  fontWeight: 600,
  border: "1px solid #0C8F8A",
  borderRadius: 8,
  padding: "4px 16px",
  background: "#FFFFFF",
};

const statusPillStyle: CSSProperties = {
  display: "inline-block",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  borderRadius: 999,
  padding: "3px 10px",
  marginLeft: 10,
  verticalAlign: "middle",
};

const underReviewStatusStyle: CSSProperties = {
  ...statusPillStyle,
  color: "#0C6E9C",
  background: "#E3F1FA",
};

const rejectedStatusStyle: CSSProperties = {
  ...statusPillStyle,
  color: "#B3261E",
  background: "#FBE9E7",
};

const approvedStatusStyle: CSSProperties = {
  ...statusPillStyle,
  color: "#148A5C",
  background: "#E2F5EC",
};

const inProgressStatusStyle: CSSProperties = {
  ...statusPillStyle,
  color: "#6B3FA0",
  background: "#F0E7FA",
};

const recommendedBadgeStyle: CSSProperties = {
  display: "inline-block",
  fontSize: "0.6rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  lineHeight: "123%",
  borderRadius: 4,
  padding: "4px 6px",
  color: "#7A4E00",
  background: "#FCEDC2",
};

const caseStudyBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.6rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  lineHeight: "123%",
  borderRadius: 4,
  padding: "4px 6px",
  color: "#4B2E83",
  background: "#EBDDFB",
};

const CaseStudyBadge = () => <span style={caseStudyBadgeStyle}>★ In case study</span>;

const groupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  alignItems: "flex-start",
};

const groupLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 800,
  color: "#12161F",
};

const groupSubheadingStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.95rem",
  color: "#5B6472",
  whiteSpace: "nowrap",
};

const cardTitleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  fontSize: "1.1rem",
  fontWeight: 700,
};

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 56,
        fontFamily: "system-ui, sans-serif",
        background: "#F3F5F8",
        color: "#12161F",
        padding: 24,
      }}
    >
      <PageTitle title="Integrations Prototypes" />

      <h1 style={{ margin: "48px 0 24px", fontSize: "2rem", fontWeight: 800 }}>Integrations Prototypes</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
        <div style={groupStyle}>
          <div style={groupLabelStyle}>V1 In-App Feedback</div>
          <p style={groupSubheadingStyle}>
            Simple, fast-to-implement changes focused on collecting in-app feedback — no major
            technical rework. Can be implemented ASAP.
          </p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.85rem", color: "#0C8F8A", fontWeight: 600 }}
          >
            View design feedback thread on Slack →
          </a>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", maxWidth: 1200 }}>
            {[
              {
                n: 1,
                rejected: true,
                reason: "Uses an alert, which isn't suitable for a feedback entry point — and sits at page level, not content level.",
                description:
                  "Feedback ask sits below the page header, plus a short one-line hint inside each Create connection drawer.",
              },
              {
                n: 2,
                rejected: true,
                reason:
                  "Page-level alert risks clashing with the new breadcrumb/Action Header rail, and shows on every page or tab instead of scoping to the connectors content.",
                description:
                  "Feedback ask sits in a banner at the very top of the page, plus the full ask again inside each Create connection drawer.",
              },
              {
                n: 3,
                approved: true,
                recommended: true,
                reason:
                  "Contextual card at the end of the connections list — matches Textura patterns, stays subtle until needed, and sits at the right content level rather than page or system level.",
                description:
                  "Feedback ask sits in a card below the connections list, plus a matching card inside each Create connection drawer.",
              },
              {
                n: 4,
                rejected: true,
                reason:
                  "Page header is for page identity, not contextual asks — per feedback, connector-specific requests should sit near the content (like Option 3), while general feedback belongs in the new top rail.",
                description: "Feedback ask sits in the page header, as descriptive text under the title.",
              },
              {
                n: 5,
                rejected: true,
                reason:
                  "Same header-level issue as Option 4 — plus it repurposes Header.Actions (meant for a button group) to hold prose instead of an action.",
                description: "Feedback ask sits in the page header's action area, as plain text next to the title.",
              },
              {
                n: 6,
                rejected: true,
                reason:
                  "Same header-level issue as Options 4/5 — and per feedback, if a header entry point is wanted for general feedback, it should be a subtle icon (e.g. megaphone), not a text button competing with page actions.",
                description:
                  "Feedback ask is a compact button in the page header; the full message appears in a tooltip on hover.",
              },
            ].map(({ n, description, recommended, rejected, approved, reason }) => (
              <div key={n} style={cardStyle}>
                <div style={cardTitleRowStyle}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    V1 - Option {n}
                    {recommended && <span style={recommendedBadgeStyle}>Recommended</span>}
                  </span>
                  <span
                    style={{
                      ...(rejected ? rejectedStatusStyle : approved ? approvedStatusStyle : underReviewStatusStyle),
                      marginLeft: 0,
                    }}
                  >
                    {rejected ? "Rejected" : approved ? "Approved" : "Under review"}
                  </span>
                </div>
                {rejected && reason && (
                  <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#5B6472" }}>
                    <strong>Rejected reason:</strong> {reason}
                  </div>
                )}
                {approved && reason && (
                  <div style={{ marginTop: 6, fontSize: "0.85rem", color: "#5B6472" }}>
                    <strong>Why recommended:</strong> {reason}
                  </div>
                )}
                <img
                  src={`/landing/v1-updates-${n}.png`}
                  alt={description}
                  style={{
                    marginTop: 12,
                    marginBottom: 16,
                    width: "100%",
                    display: "block",
                    borderRadius: 8,
                    border: "1px solid #DBE1E9",
                  }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                  <Link to={`/v1-updates-${n}`} target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
                    Prototype
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={groupStyle}>
          <div style={groupLabelStyle}>Integrations V2</div>
          <p style={groupSubheadingStyle}>
            An enhanced version of the Integrations page that requires major technical work and
            engineering effort — planned for implementation in November 2026.
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={cardStyle}>
              <div style={cardTitleRowStyle}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  V2 - Option 1: Guide inside the drawer
                  <CaseStudyBadge />
                </span>
                <span style={{ ...rejectedStatusStyle, marginLeft: 0 }}>Rejected</span>
              </div>
              <div style={{ marginTop: 6, marginBottom: 16, fontSize: "0.9rem", color: "#5B6472" }}>
                Adds an alert inside the Create connection drawer, plus a notice above the list<br />
                — guides people when they can't find a connector
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                <Link to="/guide-in-drawer" target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
                  Prototype
                </Link>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardTitleRowStyle}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  V2 - Option 2: Pick a list first
                  <CaseStudyBadge />
                </span>
                <span style={{ ...rejectedStatusStyle, marginLeft: 0 }}>Rejected</span>
              </div>
              <div style={{ marginTop: 6, marginBottom: 16, fontSize: "0.9rem", color: "#5B6472" }}>
                A pick-a-list step before searching, so people choose Unified, Workflow or Apps first<br />
                — each dead end explains where the connector lives
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                <Link to="/option-1" target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
                  Prototype
                </Link>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardTitleRowStyle}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  V2 - Final solution
                  <CaseStudyBadge />
                </span>
                <span style={{ ...approvedStatusStyle, marginLeft: 0 }}>Approved</span>
              </div>
              <div style={{ marginTop: 6, marginBottom: 16, fontSize: "0.9rem", color: "#5B6472" }}>
                One search across every connector<br />
                — the list becomes a label, and there is always a way forward
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                <Link to="/final-solution" target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
                  Prototype
                </Link>
                <a
                  href="/integrations-v2-alignment-deck.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkPillStyle}
                >
                  Alignment deck
                </a>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={cardTitleRowStyle}>
                V2 - Option 3
                <span style={{ ...inProgressStatusStyle, marginLeft: 0 }}>In progress</span>
              </div>
              <div style={{ marginTop: 6, marginBottom: 16, fontSize: "0.9rem", color: "#5B6472" }}>
                Starts as a copy of Option 2
                <br />
                — a base for further iteration
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                <Link to="/option-3" target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
                  Prototype
                </Link>
                <a
                  href="/connection-invalid-deck.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkPillStyle}
                >
                  Invalid connection deck
                </a>
              </div>
            </div>
          </div>
          <a href="/accelerate-connectors-deck.html" target="_blank" rel="noopener noreferrer" style={linkPillStyle}>
            Deck (Option 1 &amp; 2)
          </a>
        </div>
      </div>
    </div>
  );
}
