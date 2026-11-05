import { useState, type ReactNode } from "react";
import { Alert, Button, ButtonGroup, Chip, Combobox, Drawer, Field, TextLink } from "@exp-textura/react";
import { NewWindow } from "@exp-textura/icons";
import { ConnectorCatalogIcon } from "./ConnectorCatalogIcon";
import {
  APPS_BUILDER_URL,
  connectorsForSurface,
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

  // Singular labels ("Workflow"/"Unified"/"Apps"), matching the per-connector badge text — reads
  // more naturally than the plural prose form above in "try a Workflow connection instead".
  const renderFallbackSurfaceLink = (target: "unified" | "workflow" | "apps") =>
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
    ) : target === "workflow" ? (
      <TextLink
        key="workflow"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onSwitchToWorkflow?.();
        }}
      >
        Workflow
      </TextLink>
    ) : (
      <TextLink
        key="unified"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onSwitchToUnified?.();
        }}
      >
        Unified
      </TextLink>
    );

  // Unified can't cover a connector that's Workflow/Apps-only, so it points at both of those;
  // Workflow/Apps should steer toward Unified first since it's the cross-product option. Apps has
  // no drawer of its own yet (redirects to APPS_BUILDER_URL in App.tsx instead), so this alert is
  // never actually rendered for it in practice — surface is typed to require an entry regardless.
  const notSeeingYourConnectorContent: Record<ConnectorSurface, ReactNode> = {
    unified: (
      <>
        It might not be Unified yet. Try a {renderFallbackSurfaceLink("workflow")} or{" "}
        {renderFallbackSurfaceLink("apps")} connection instead.
      </>
    ),
    workflow: <>It might be available as a {renderFallbackSurfaceLink("unified")} connection instead.</>,
    apps: <>Try a {renderFallbackSurfaceLink("unified")} connection instead.</>,
  };

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
        <Alert variant="info" type="inline" style={{ flex: "0 0 auto" }}>
          <Alert.Icon />
          <Alert.Content>
            <Alert.Description>
              <strong>Not seeing your connector here?</strong> {notSeeingYourConnectorContent[surface]} Let us
              know.
            </Alert.Description>
            <Alert.Actions>
              <Button onClick={() => window.open("#", "_blank", "noopener,noreferrer")}>
                Suggest a connector
                <NewWindow width={14} height={14} aria-hidden />
              </Button>
            </Alert.Actions>
          </Alert.Content>
        </Alert>

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
                }}
                // The detailed "available elsewhere" guidance now lives in the alert above the
                // field instead, so the dropdown's own empty state stays a plain, generic message.
                noResults={<span>No connectors found</span>}
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
