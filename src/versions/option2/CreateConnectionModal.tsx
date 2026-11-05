import { useState } from "react";
import { Button, ButtonGroup, Chip, Combobox, Modal, Field, TextLink } from "@exp-textura/react";
import { NewWindow, Add } from "@exp-textura/icons";
import { ConnectorCatalogIcon } from "./ConnectorCatalogIcon";
import {
  connectorsForSurface,
  SURFACE_BADGE_LABEL,
  SURFACE_BADGE_VARIANT,
  type ConnectorCatalogEntry,
  type ConnectorSurface,
} from "./data/connectorCatalog";

type CreateConnectionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Lets the no-results state hand off to the Xtensions tab (build a custom connector) instead of
  // just leaving the user stuck on "not supported yet" — closes this drawer and switches tabs,
  // both of which are page-level state this component doesn't own.
  onNavigateToXtensions: () => void;
};

// Every connector, on every surface, lives in one picker now — no more separate Unified/
// Workflow/Apps entry points or drawers, so there's nothing left to redirect between.
const SURFACE_ORDER: ConnectorSurface[] = ["unified", "workflow", "apps"];

// Apps connectors aren't created in-app — this drawer can only hand off to the Apps builder,
// which owns the actual connection creation flow for that surface.
const APPS_DASHBOARD_URL = "https://example.com/apps/connections";

// `id` is what Combobox's item-equality check actually compares (see isItemEqual) — without it,
// a freshly created `{ connector, surface }` object on every render would never equal the
// previously selected one, so the list's selected-checkmark state would silently never match.
type ConnectorSelection = { id: string; connector: ConnectorCatalogEntry; surface: ConnectorSurface };

// A single "Create connection" drawer covering every surface — the connector list is grouped by
// surface (Unified / Workflow / Apps) so the picker still communicates where a connector lives,
// without forcing the user to pick a surface before they can even search.
export function CreateConnectionModal({
  open,
  onOpenChange,
  onNavigateToXtensions,
}: CreateConnectionModalProps) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<ConnectorSelection | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const groups = SURFACE_ORDER.map((surface) => ({
    surface,
    connectors: connectorsForSurface(surface).filter((c) =>
      normalizedQuery === "" ? true : c.name.toLowerCase().includes(normalizedQuery),
    ),
  })).filter((group) => group.connectors.length > 0);
  const hasNoResults = normalizedQuery !== "" && groups.length === 0;

  // Drawer content should start fresh next time it opens, not show the previous search/pick.
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setSelection(null);
    }
  };

  return (
    // Modal, not Drawer — per the platform constitution's Overlay Surface Hierarchy, this is a
    // one-shot "pick a connector, create, done" task, not a panel the user revisits repeatedly
    // in a session (that's what Drawer is for). sm is Modal's default width and is enough for a
    // single field.
    <Modal open={open} onOpenChange={handleOpenChange} size="sm">
      <Modal.Title>Create connection</Modal.Title>
      <Modal.CloseIconButton aria-label="Close modal" />
      <Modal.Divider />
      <Modal.Content style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Field name="connector" required>
          <Field.Label>Connector</Field.Label>
          <Field.Control>
            {() => (
              <Combobox
                id="connector-combobox"
                value={selection}
                onChange={(value) => setSelection(value as ConnectorSelection)}
                onQueryChange={setQuery}
                itemToString={(item) => (item as ConnectorSelection | null)?.connector.name ?? ""}
                placeholder="Select connector"
                styleSlots={{
                  // Combobox's built-in default caps the popover at 100vh — effectively
                  // unbounded, so with every surface's connectors combined (100+ entries) it
                  // grows to the full viewport height instead of staying short.
                  // `styleSlots.content` is the component's own documented extension point for
                  // exactly this (see Popover governance: "don't let content grow unbounded");
                  // the built-in overflowY:auto still does the scrolling, this just caps how
                  // tall it gets before that kicks in. ~8 rows before scrolling.
                  content: { maxHeight: 288 },
                  // The library's own `.group` (8px all-round padding) and `.groupLabel` (its own
                  // extra 8px padding-top) stack, so every group's label sits a full 16px below
                  // the divider/edge above it instead of the intended 8px — most visible above the
                  // very first group, where there's no divider to help absorb the doubled gap.
                  // Zeroing the label's own top padding leaves the group's 8px as the only space
                  // above it, matching the 8px used everywhere else in this list.
                  groupLabel: { paddingTop: 0 },
                  // Default noResults padding is 40px vertical / 16px horizontal — sized for a
                  // short one-line "No results found" message. Our noResults content here is a
                  // multi-line sentence plus a link, so that much vertical padding reads as an
                  // oversized empty box. Match the horizontal value instead.
                  noResults: { padding: "16px" },
                }}
                // Only one way left for a search to come up empty now that every surface lives
                // in the same list — nothing in the whole catalog matches at all.
                // Two short, icon-led rows instead of two full sentences. Both links share the
                // same weight/underline treatment — deliberately not styling one as more
                // "primary" than the other; only the icon and word order signal which path we'd
                // suggest first. The custom-connector link no longer names "AI" specifically —
                // it hands off to the Xtension picker, which now offers AI, file import, or a
                // spec URL, so singling out one method here would be inaccurate.
                noResults={
                  hasNoResults ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <span style={{ color: "var(--ntx-color-content-weak)" }}>
                        &ldquo;{query}&rdquo; isn&rsquo;t available yet — here&rsquo;s what you can
                        do:
                      </span>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <TextLink
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            onNavigateToXtensions();
                          }}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          <Add width={16} height={16} aria-hidden />
                          Build a custom connector with AI
                        </TextLink>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <TextLink
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          <NewWindow width={14} height={14} aria-hidden />
                          Request this connector
                        </TextLink>
                        <span style={{ color: "var(--ntx-color-content-weak)" }}>
                          , we&rsquo;ll let you know
                        </span>
                      </div>
                    </div>
                  ) : undefined
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
                  size={selection ? selection.connector.name.length + 1 : undefined}
                  style={selection ? { flex: "0 1 auto", minWidth: 0 } : undefined}
                >
                  <Combobox.InputPrefix>
                    {selection && <ConnectorCatalogIcon connector={selection.connector} />}
                  </Combobox.InputPrefix>
                  <Combobox.InputSuffix style={selection ? { flex: 1 } : undefined}>
                    {selection && (
                      <Chip
                        variant={SURFACE_BADGE_VARIANT[selection.surface]}
                        type="subtle"
                        size="sm"
                        style={{ marginRight: "auto" }}
                      >
                        {SURFACE_BADGE_LABEL[selection.surface]}
                      </Chip>
                    )}
                    <Combobox.ClearIconButton />
                    <Combobox.Button />
                  </Combobox.InputSuffix>
                </Combobox.Input>
                <Combobox.Content
                  // Modal locks page scroll via react-remove-scroll — that lock only exempts the
                  // Modal's own content (Radix's `shards`), not this popover, since Combobox
                  // portals its list straight to <body>, outside the Modal's DOM subtree. Without
                  // this, every wheel event over the list bubbles up to the lock's document-level
                  // listener and gets preventDefault()'d before the list ever scrolls — a known
                  // Radix Dialog + nested Popper-based component limitation. Stopping propagation
                  // here keeps the event from reaching that listener, so the browser's native
                  // scroll on this already-overflow:auto list proceeds normally.
                  onWheel={(event) => event.stopPropagation()}
                >
                  {groups.map((group, index) => (
                    // Divider lives *inside* the group, as its trailing child (matching Textura's own
                    // "Option groups and dividers" story) — never as a conditional sibling before the
                    // group. `Combobox.Content` re-groups its children internally, and its grouping
                    // algorithm can't distinguish a `false` (from `index > 0 && <Divider />`) from a
                    // real loose child: `flattenChildren` normalizes it to `null` but still emits it,
                    // so a leading `false` for index 0 was getting wrapped in its own spurious *empty*
                    // group — 16px of dead padding rendered above the very first group, which is what
                    // actually produced the extra space above "Unified connectors" (not the label's own
                    // padding, already handled by `groupLabel` below). A divider nested inside a group
                    // is just plain JSX under a `<div>`, never fed through that re-grouping, so `false`
                    // there is inert as normal.
                    <Combobox.Group key={group.surface}>
                      <Combobox.Label>{SURFACE_BADGE_LABEL[group.surface]} connectors</Combobox.Label>
                      {group.connectors.map((connector) => (
                        <Combobox.Item
                          key={`${group.surface}-${connector.id}`}
                          value={{ id: `${group.surface}-${connector.id}`, connector, surface: group.surface }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <ConnectorCatalogIcon connector={connector} />
                            <span style={{ flex: 1 }}>{connector.name}</span>
                            <Chip variant={SURFACE_BADGE_VARIANT[group.surface]} type="subtle" size="sm">
                              {SURFACE_BADGE_LABEL[group.surface]}
                            </Chip>
                          </span>
                        </Combobox.Item>
                      ))}
                      {index < groups.length - 1 && <Combobox.Divider />}
                    </Combobox.Group>
                  ))}
                </Combobox.Content>
              </Combobox>
            )}
          </Field.Control>
        </Field>
      </Modal.Content>
      <Modal.Divider />
      <Modal.Footer>
        <ButtonGroup style={{ display: "flex", justifyContent: "flex-end" }}>
          <Modal.Close>
            <Button buttonType="tertiary">Cancel</Button>
          </Modal.Close>
          {selection?.surface === "apps" ? (
            // Apps connectors are created in the Apps builder, not this modal — the CTA hands off
            // there instead of submitting a form the modal has no way to fulfill.
            <Button
              buttonType="primary"
              onClick={() => window.open(APPS_DASHBOARD_URL, "_blank", "noopener,noreferrer")}
            >
              Continue on Apps
              <NewWindow width={14} height={14} aria-hidden />
            </Button>
          ) : (
            <Button buttonType="primary" disabled={!selection}>
              Create
            </Button>
          )}
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
}
