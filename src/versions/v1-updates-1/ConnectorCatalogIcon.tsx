import type { ConnectorCatalogEntry } from "./data/connectorCatalog";

// Used across all three "create connection" drawers (Unified/Workflow/Apps), not just Unified —
// named for the shared catalog rather than any one surface.
export function ConnectorCatalogIcon({ connector }: { connector: ConnectorCatalogEntry }) {
  if (connector.iconSrc) {
    return (
      <img
        src={connector.iconSrc}
        alt=""
        aria-hidden
        width={24}
        height={24}
        style={{ display: "block", flexShrink: 0 }}
      />
    );
  }

  // No verified real logo for this connector yet — a neutral monogram is honest about
  // that, rather than shipping a guessed-at logo shape.
  return (
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        background: connector.monogramColor ?? "#8991a0",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden
    >
      {connector.name.charAt(0)}
    </span>
  );
}
