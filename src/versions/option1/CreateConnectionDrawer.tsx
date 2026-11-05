import { useState } from "react";
import { Button, ButtonGroup, Chip, Combobox, Drawer, Field, TextLink } from "@exp-textura/react";
import { NewWindow } from "@exp-textura/icons";
import { ConnectorCatalogIcon } from "./ConnectorCatalogIcon";
import {
  APPS_BUILDER_URL,
  connectorsForSurface,
  describeSurfaces,
  findConnectorAvailability,
  SURFACE_BADGE_LABEL,
  SURFACE_BADGE_VARIANT,
  type ConnectorCatalogEntry,
  type ConnectorSurface,
} from "./data/connectorCatalog";

type CreateConnectionDrawerProps = {
  surface: ConnectorSurface;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Only meaningful for the Workflow/Apps drawers — Unified is cross-product by definition, so a
  // search there can never turn up a "this is already Unified" result to redirect from. Omitted
  // entirely on the Unified drawer instance.
  onSwitchToUnified?: () => void;
  // Only meaningful for the Unified drawer — a search from Workflow can never turn up "workflow"
  // as one of its *other* surfaces (findConnectorAvailability excludes the current surface).
  // Omitted on the Workflow/Apps drawer instances.
  onSwitchToWorkflow?: () => void;
};

// Shared by all three "Create connection" drawers (Unified/Workflow/Apps) — they differ only in
// which surface's connector list they search and what the drawer/badge call themselves.
export function CreateConnectionDrawer({
  surface,
  title,
  open,
  onOpenChange,
  onSwitchToUnified,
  onSwitchToWorkflow,
}: CreateConnectionDrawerProps) {
  const [query, setQuery] = useState("");
  const [selectedConnector, setSelectedConnector] = useState<ConnectorCatalogEntry | null>(null);

  const surfaceConnectors = connectorsForSurface(surface);
  const filteredConnectors =
    query === "" ? surfaceConnectors : surfaceConnectors.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const connectorAvailability = findConnectorAvailability(query, surface);
  const badgeLabel = SURFACE_BADGE_LABEL[surface];
  const badgeVariant = SURFACE_BADGE_VARIANT[surface];

  // Drawer content should start fresh next time it opens, not show the previous search/pick.
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setSelectedConnector(null);
    }
  };

  // One inline link per surface a connector is actually available on, so the "other-surfaces"
  // empty state can offer every real path forward at once (not just a single one), per surface:
  // - "apps": always an external redirect — Apps has no in-app drawer of its own.
  // - "workflow": only ever reachable from the Unified drawer (findConnectorAvailability excludes
  //   the current surface, so a Workflow-drawer search can never list "workflow" as an "other"
  //   surface) — a real in-app action via onSwitchToWorkflow, not a placeholder.
  const renderSurfaceLink = (target: "workflow" | "apps") =>
    target === "apps" ? (
      <TextLink
        key="apps"
        href={APPS_BUILDER_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
      >
        Apps
        <NewWindow width={12} height={12} aria-hidden />
      </TextLink>
    ) : (
      <TextLink
        key="workflow"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onSwitchToWorkflow?.();
        }}
      >
        Workflows
      </TextLink>
    );

  return (
    // Modal drawer — the task ("pick a connector, create") is a one-off decision rather than a
    // persistent panel the user revisits, which is Drawer's anti-pattern territory ("Drawer for
    // decisions"). It's built this way because the design explicitly calls for an edge-anchored
    // sliding panel rather than a centered Modal; `modal` supplies the blocking scrim so it
    // doesn't strand the rest of the page half-interactive.
    <Drawer open={open} onOpenChange={handleOpenChange} position="end" modal style={{ width: 480 }}>
      <Drawer.Title>{title}</Drawer.Title>
      <Drawer.CloseIconButton aria-label="Close drawer" />
      <Drawer.Content style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Field name="connector" required>
          <Field.Label>Connector</Field.Label>
          <Field.Control>
            {() => (
              <Combobox
                id={`${surface}-connector-combobox`}
                value={selectedConnector}
                onChange={(value) => setSelectedConnector(value as ConnectorCatalogEntry)}
                onQueryChange={setQuery}
                itemToString={(item) => (item as ConnectorCatalogEntry | null)?.name ?? ""}
                placeholder="Select connector"
                styleSlots={{
                  // Combobox's built-in default caps the popover at 100vh — effectively
                  // unbounded, so with Workflow's 84 connectors it grows to the full viewport
                  // height instead of staying short. `styleSlots.content` is the component's own
                  // documented extension point for exactly this (see Popover governance: "don't
                  // let content grow unbounded"); the built-in overflowY:auto still does the
                  // scrolling, this just caps how tall it gets before that kicks in. ~8 rows
                  // before scrolling.
                  content: { maxHeight: 288 },
                  // Default noResults padding is 40px vertical / 16px horizontal — sized for a
                  // short one-line "No results found" message. Our noResults content here is a
                  // multi-line sentence plus a link, so that much vertical padding reads as an
                  // oversized empty box. Match the horizontal value instead.
                  noResults: { padding: "16px" },
                }}
                // Combobox's own extension point for "nothing matched" — this is what actually
                // puts the request-a-connector option inside the dropdown, right when a search
                // comes up empty (rather than only below the field). Three distinct cases, since
                // each calls for a different action:
                // - Already Unified: Unified is cross-product by definition, so this already
                //   covers the current surface too — there's nothing to request, just point the
                //   user at Unified instead (a real in-app action, not a placeholder link).
                // - Exists on another surface but isn't Unified yet: a genuine gap worth flagging
                //   upstream ("request support" — placeholder link until a real form URL exists).
                // - Doesn't exist anywhere: "request a new connector" (same placeholder link).
                noResults={
                  connectorAvailability.kind === "available-unified" ? (
                    <span>
                      {connectorAvailability.connector.name} is available as a Unified connection, which also
                      works for {describeSurfaces(["workflow", "apps"])}.{" "}
                      <TextLink
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          onSwitchToUnified?.();
                        }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        Create a Unified connection instead
                      </TextLink>
                    </span>
                  ) : connectorAvailability.kind === "other-surfaces" ? (
                    <span>
                      {connectorAvailability.connector.name} is available for{" "}
                      {connectorAvailability.surfaces.includes("apps") && renderSurfaceLink("apps")}
                      {connectorAvailability.surfaces.includes("apps") &&
                        connectorAvailability.surfaces.includes("workflow") &&
                        " and "}
                      {connectorAvailability.surfaces.includes("workflow") && renderSurfaceLink("workflow")}
                      {" "}but not for {badgeLabel} connections yet.{" "}
                      <TextLink
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        Request {badgeLabel} connector support
                        <NewWindow width={14} height={14} aria-hidden />
                      </TextLink>
                    </span>
                  ) : (
                    <span>
                      &ldquo;{query}&rdquo; isn&rsquo;t a connector we support yet.{" "}
                      <TextLink
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        Request a new connector
                        <NewWindow width={14} height={14} aria-hidden />
                      </TextLink>
                    </span>
                  )
                }
              >
                <Combobox.Input
                  // The base Input component's own class (`.exp-textura_input_input { flex: 1;
                  // min-width: 0; ... }`) always coexists on this same <input> element alongside
                  // Combobox's `.exp-textura_combobox_input`. Both are single-class selectors of
                  // equal specificity, so overriding via styleSlots.input is a coin flip on
                  // Emotion's stylesheet insertion order — it can lose the cascade on some
                  // renders (confirmed: worked in one test, silently reverted in another). An
                  // inline `style` attribute always wins regardless of injection order, so once a
                  // connector is picked, shrink the input to fit its own text here directly
                  // (Combobox.Input forwards `style` straight to the native <input>) instead of
                  // fighting the cascade. Left alone (undefined) while searching, so the field
                  // stays full-width for typing.
                  //
                  // `width: "auto"` alone doesn't shrink a text <input> to its actual value — for
                  // a native form control, "auto" resolves to the browser's default intrinsic
                  // width (~20 characters), not the rendered text width, leaving a large blank gap
                  // inside the box after short values. The native `size` attribute is what
                  // actually controls a text input's character-based width, so drive it from the
                  // selected connector's name length instead.
                  size={selectedConnector ? selectedConnector.name.length + 1 : undefined}
                  style={selectedConnector ? { flex: "0 1 auto", minWidth: 0 } : undefined}
                >
                  <Combobox.InputPrefix>
                    {selectedConnector && <ConnectorCatalogIcon connector={selectedConnector} />}
                  </Combobox.InputPrefix>
                  <Combobox.InputSuffix style={selectedConnector ? { flex: 1 } : undefined}>
                    {selectedConnector && (
                      <Chip variant={badgeVariant} type="subtle" size="sm" style={{ marginRight: "auto" }}>
                        {badgeLabel}
                      </Chip>
                    )}
                    <Combobox.ClearIconButton />
                    <Combobox.Button />
                  </Combobox.InputSuffix>
                </Combobox.Input>
                <Combobox.Content
                  // The Drawer is a modal Dialog, which locks page scroll via react-remove-scroll —
                  // that lock only exempts the Dialog's own content (Radix's `shards`), not this
                  // popover, since Combobox portals its list straight to <body>, outside the
                  // Drawer's DOM subtree. Without this, every wheel event over the list bubbles up
                  // to the lock's document-level listener and gets preventDefault()'d before the
                  // list ever scrolls — a known Radix Dialog + nested Popper-based component
                  // limitation. Stopping propagation here keeps the event from reaching that
                  // listener, so the browser's native scroll on this already-overflow:auto list
                  // proceeds normally.
                  onWheel={(event) => event.stopPropagation()}
                >
                  {filteredConnectors.map((connector) => (
                    <Combobox.Item key={connector.id} value={connector}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ConnectorCatalogIcon connector={connector} />
                        <span style={{ flex: 1 }}>{connector.name}</span>
                        <Chip variant={badgeVariant} type="subtle" size="sm">
                          {badgeLabel}
                        </Chip>
                      </span>
                    </Combobox.Item>
                  ))}
                </Combobox.Content>
              </Combobox>
            )}
          </Field.Control>
        </Field>
      </Drawer.Content>
      <Drawer.Footer>
        <ButtonGroup style={{ display: "flex", justifyContent: "flex-end" }}>
          <Drawer.Close>
            <Button buttonType="tertiary">Cancel</Button>
          </Drawer.Close>
          <Button buttonType="primary" disabled={!selectedConnector}>
            Create
          </Button>
        </ButtonGroup>
      </Drawer.Footer>
    </Drawer>
  );
}
