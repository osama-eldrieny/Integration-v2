import { useState } from "react";
import type { ColumnDef } from "@exp-textura/react";
import {
  PageLayout,
  MainNav,
  Header,
  TabBar,
  Tab,
  AssetIcon,
  ChipBar,
  Chip,
  Button,
  IconButton,
  Alert,
  List,
  Cell,
  InfoBlock,
  Avatar,
  NotificationBadge,
  Menu,
  Card,
  TextLink,
  Search,
  EmptyState,
} from "@exp-textura/react";
import {
  Home,
  Solutions,
  Process,
  Connection,
  Deployment,
  Apps,
  Workflow,
  Documents,
  Data,
  Gallery,
  Help,
  Settings,
  Info,
  OverflowVertical,
  NewWindow,
  Edit,
  Lock,
  Export,
  Delete,
  Import,
} from "@exp-textura/icons";
import {
  HomeSolid,
  SolutionsSolid,
  ProcessSolid,
  ConnectionSolid,
  DeploymentSolid,
  AppsSolid,
  WorkflowSolid,
  DocumentsSolid,
  DataSolid,
  GallerySolid,
  HelpSolid,
  SettingsSolid,
} from "@exp-textura/icons/streamline-ss";
import { BrandLogo, BrandLogoSquare } from "../../BrandLogo";
import { ConnectorCatalogIcon } from "./ConnectorCatalogIcon";
import { DesignGradientIcon } from "./DesignGradientIcon";
import { connections, type Connection as ConnectionRow } from "./data/connections";
import { CreateConnectionDrawer } from "./CreateConnectionDrawer";
import {
  connectorCatalog,
  SURFACE_BADGE_LABEL,
  SURFACE_BADGE_VARIANT,
  type ConnectorSurface,
} from "./data/connectorCatalog";

// The chip filter adds an "All" option on top of the catalog's own surfaces (unified/workflow/
// apps) — it's a view-level concept, not a real connector surface, so it lives here rather than
// in connectorCatalog.ts.
type ConnectionFilter = "all" | ConnectorSurface;

// Every ConnectorType in data/connections.ts is a real name from the catalog, so this should
// always resolve — the empty-surfaces fallback only guards against the two staying out of sync.
function getCatalogEntry(connectorName: string) {
  return connectorCatalog.find((c) => c.name === connectorName) ?? { id: connectorName, name: connectorName, surfaces: [] };
}

// Row-level interaction (clickable connection name) is the primary task here, and there's no
// column-to-column comparison need — per List vs Table governance, that means List, not Table.
const ConnectionsList = List.ofType<ConnectionRow>();

// Connector column takes the active filter so it can show a surface chip only in the "All" view —
// once a single surface is already selected via the chip filter, repeating that same surface next
// to every row's connector name would be redundant.
function buildColumns(
  activeFilter: ConnectionFilter,
  onDeleteConnection: (id: string) => void,
): ColumnDef<ConnectionRow, unknown>[] {
  return [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: false,
    size: 340,
    cell: (info) => {
      const row = info.row.original;
      return (
        <Cell.InfoBlock>
          <InfoBlock.Visual>
            <ConnectorCatalogIcon connector={getCatalogEntry(row.connector)} />
          </InfoBlock.Visual>
          <InfoBlock.Content>
            <InfoBlock.Title asChild>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ textDecoration: "none" }}>
                {row.name}
              </a>
            </InfoBlock.Title>
          </InfoBlock.Content>
        </Cell.InfoBlock>
      );
    },
  },
  {
    accessorKey: "connector",
    header: "Connector",
    enableSorting: false,
    size: 160,
    cell: (info) => {
      const connectorName = info.getValue() as string;
      if (activeFilter !== "all") return <Cell>{connectorName}</Cell>;
      // In the combined "All" view, the chip filter no longer pins every row to one surface, so
      // each row shows the surface it was actually created on here instead. Connections never
      // overlap between surfaces — even when the connector itself is available on more than one
      // (e.g. Google Drive, on both Workflow and Apps) — so this is always exactly one chip.
      const surface = info.row.original.surface;
      return (
        <Cell>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>{connectorName}</span>
            <Chip variant={SURFACE_BADGE_VARIANT[surface]} type="subtle" size="sm">
              {SURFACE_BADGE_LABEL[surface]}
            </Chip>
          </span>
        </Cell>
      );
    },
  },
  {
    accessorKey: "dateCreated",
    header: "Date created",
    enableSorting: false,
    size: 190,
    // Plain text cell — Cell's body content always renders at the standard body-md style
    // (Inter, 14px). There's no governed exception for dates/timestamps; Roboto Mono is a
    // real Textura font, but nothing in Cell or List governance calls for it here.
    cell: (info) => <Cell>{info.getValue() as string}</Cell>,
  },
  {
    accessorKey: "createdBy",
    header: "Created by",
    enableSorting: true,
    size: 170,
    cell: (info) => <Cell>{info.getValue() as string}</Cell>,
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    size: 56,
    minSize: 56,
    maxSize: 56,
    cell: (info) => (
      // Trailing-most column is row-level actions — right-aligned per the overflow-trigger
      // placement convention (outermost/rightmost element in the trailing column).
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {/* Menu.Content's own default forces a 260px minWidth even for this short a label set —
            match the "icons-only" variant's own fit-content minWidth instead. */}
        <Menu styleSlots={{ content: { minWidth: "max-content" } }}>
          <Menu.Trigger>
            <Cell.IconButton
              aria-label={`More actions for ${info.row.original.name}`}
              buttonType="secondary"
              size="sm"
            >
              <OverflowVertical />
            </Cell.IconButton>
          </Menu.Trigger>
          <Menu.Content align="end">
            {/* Only Delete is wired up — Edit/Permissions/Export are placeholders for now. */}
            <Menu.Item>
              <Menu.ItemLeadingIcon>
                <Edit />
              </Menu.ItemLeadingIcon>
              <Menu.ItemLabel>Edit</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Item>
              <Menu.ItemLeadingIcon>
                <Lock />
              </Menu.ItemLeadingIcon>
              <Menu.ItemLabel>Permissions</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Item>
              <Menu.ItemLeadingIcon>
                <Export />
              </Menu.ItemLeadingIcon>
              <Menu.ItemLabel>Export</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item variant="destructive" onSelect={() => onDeleteConnection(info.row.original.id)}>
              <Menu.ItemLeadingIcon>
                <Delete />
              </Menu.ItemLeadingIcon>
              <Menu.ItemLabel>Delete</Menu.ItemLabel>
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </div>
    ),
  },
  ];
}

export default function App() {
  const [showNotice, setShowNotice] = useState(true);
  const titleId = "integrations-title";

  const [createConnectionDrawerOpen, setCreateConnectionDrawerOpen] = useState(false);

  // Local, mutable copy of the seed data so rows can actually be deleted from the action menu —
  // the imported `connections` array stays the untouched seed.
  const [connectionRows, setConnectionRows] = useState<ConnectionRow[]>(connections);
  const handleDeleteConnection = (id: string) => {
    setConnectionRows((rows) => rows.filter((row) => row.id !== id));
  };

  // Filters the Connections table to rows actually created on the selected surface. Connections
  // never overlap between Unified, Workflow, and Apps — each row has exactly one surface, even
  // when its connector is available on more than one (see data/connections.ts) — so this chip
  // filter and the "All" total always partition cleanly. "All" is the default landing view.
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredConnections = connectionRows
    .filter((connection) => connectionFilter === "all" || connection.surface === connectionFilter)
    .filter(
      (connection) =>
        normalizedSearch === "" ||
        connection.name.toLowerCase().includes(normalizedSearch) ||
        connection.connector.toLowerCase().includes(normalizedSearch),
    );
  const columns = buildColumns(connectionFilter, handleDeleteConnection);

  // Only the Unified filter gets the "No connections yet" empty state — Workflow and Apps keep
  // the plain list-empty behavior for now. Checked against the unfiltered rows (not
  // filteredConnections) so a no-results search doesn't get mistaken for a real empty state.
  const showUnifiedEmptyState =
    connectionFilter === "unified" && !connectionRows.some((connection) => connection.surface === "unified");

  return (
    // The installed Textura build (1.0.0) emits its md/lg breakpoint padding as
    // `@media (min-width: var(--ntx-breakpoints-lg-min-width))` — a CSS custom property inside
    // a media *feature* query, which the spec doesn't allow resolving, so those rules never
    // match and the layout is permanently stuck at the sm (16px) padding. Overriding the
    // `layout` styleSlot to the governed lg value (48px) works around the upstream bug.
    <PageLayout styleSlots={{ layout: { paddingInline: "48px" } }}>
      <PageLayout.SkipToContent targetId={titleId} />

      <PageLayout.MainNav>
        <MainNav aria-label="Main Navigation">
          <MainNav.Header>
            <MainNav.Brand
              aria-label="Home"
              brandImg={<BrandLogo />}
              squareBrandImg={<BrandLogoSquare />}
              href="#"
              onClick={(e) => e.preventDefault()}
            />
            <MainNav.CollapseTrigger />
          </MainNav.Header>

          <MainNav.Content>
            <MainNav.Item href="#" icon={<Home />} hoverIcon={<HomeSolid />}>
              Home
            </MainNav.Item>
            <MainNav.Item icon={<Solutions />} hoverIcon={<SolutionsSolid />}>
              Solutions
            </MainNav.Item>
            <MainNav.Item isCurrent icon={<Connection />} hoverIcon={<ConnectionSolid />}>
              Integrations
            </MainNav.Item>
            <MainNav.Item icon={<Deployment />} hoverIcon={<DeploymentSolid />}>
              Deployment
            </MainNav.Item>

            <MainNav.Divider />

            <MainNav.Item icon={<Apps />} hoverIcon={<AppsSolid />}>
              Apps
            </MainNav.Item>
            <MainNav.Item icon={<Workflow />} hoverIcon={<WorkflowSolid />}>
              Workflows
            </MainNav.Item>
            <MainNav.Item icon={<Documents />} hoverIcon={<DocumentsSolid />}>
              Documents
            </MainNav.Item>
            <MainNav.Item icon={<Data />} hoverIcon={<DataSolid />}>
              Data
            </MainNav.Item>
            <MainNav.Item icon={<Process />} hoverIcon={<ProcessSolid />}>
              Processes
            </MainNav.Item>
          </MainNav.Content>

          <MainNav.Footer>
            <MainNav.Item icon={<Gallery />} hoverIcon={<GallerySolid />}>
              Gallery
            </MainNav.Item>
            <MainNav.Item href="#" icon={<Help />} hoverIcon={<HelpSolid />}>
              Help
            </MainNav.Item>
            <MainNav.Item icon={<Settings />} hoverIcon={<SettingsSolid />}>
              Admin
            </MainNav.Item>

            <MainNav.Menu align="end">
              <MainNav.MenuTrigger>
                <MainNav.User>
                  <MainNav.UserAvatar>
                    <Avatar name="Osama Eldrieny">
                      <Avatar.Fallback />
                    </Avatar>
                  </MainNav.UserAvatar>
                  <MainNav.UserNotifications>
                    <NotificationBadge variant="critical">3</NotificationBadge>
                  </MainNav.UserNotifications>
                  <MainNav.UserName>
                    <MainNav.UserNameLine>Osama Eldrieny</MainNav.UserNameLine>
                  </MainNav.UserName>
                  <MainNav.Indicator />
                </MainNav.User>
              </MainNav.MenuTrigger>
              <MainNav.MenuContent>
                <MainNav.Item href="#">My settings</MainNav.Item>
                <MainNav.Item href="#">Sign out</MainNav.Item>
              </MainNav.MenuContent>
            </MainNav.Menu>
          </MainNav.Footer>
        </MainNav>
      </PageLayout.MainNav>

      <PageLayout.Main pageWidth="fullWidth">
        <PageLayout.Header>
          <Header>
            <Header.Icon>
              <AssetIcon aria-hidden size="lg" variant="integrations" />
            </Header.Icon>
            <Header.Content>
              <Header.Title id={titleId}>Integrations</Header.Title>
            </Header.Content>
          </Header>
        </PageLayout.Header>

        <PageLayout.Body>
          <PageLayout.TabBar>
            <TabBar defaultValue="connections">
              <TabBar.List>
                <Tab value="connections">Connections</Tab>
              </TabBar.List>
              <TabBar.Panel value="connections">
                <PageLayout.BodyContent>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <Search onQueryChange={setSearchQuery} aria-label="Search connections">
                        <Search.Input aria-label="Search connections" style={{ width: 220 }}>
                          <Search.InputPrefix />
                          <Search.InputSuffix>
                            <Search.ClearIconButton />
                          </Search.InputSuffix>
                        </Search.Input>
                      </Search>
                      {/* Only 4 short chips — they must always be fully visible, never collapsed into "+N" */}
                      <ChipBar
                        selectionMode="single"
                        value={connectionFilter}
                        onValueChange={(value) => value && setConnectionFilter(value as ConnectionFilter)}
                        aria-label="Filter connections"
                        enableOverflow={false}
                      >
                        <Chip value="all">All</Chip>
                        <Chip value="unified">Unified</Chip>
                        <Chip value="workflow">Workflow</Chip>
                        <Chip value="apps">Apps</Chip>
                      </ChipBar>
                      <IconButton aria-label="About connection filters" buttonType="secondary" size="sm">
                        <Info />
                      </IconButton>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <Button buttonType="secondary">Import connection</Button>
                      {/* One connector picker covers every surface now, so "Create connection" opens
                          straight into the modal instead of a menu asking which surface first. */}
                      <Button onClick={() => setCreateConnectionDrawerOpen(true)}>Create connection</Button>
                    </div>
                  </div>

                  <CreateConnectionDrawer
                    open={createConnectionDrawerOpen}
                    onOpenChange={setCreateConnectionDrawerOpen}
                  />

                  <PageLayout.Notification>
                    {showNotice && (
                      // Figma spec: Utility=Announcement (variant="default"), Type=Inline,
                      // Treatment=Subtle. Button: buttonType=Primary, Utility=Inverse — an explicit
                      // override of Subtle's default desaturated pairing, per the design.
                      <Alert
                        onClose={() => setShowNotice(false)}
                        type="inline"
                        treatment="subtle"
                        style={{ marginBottom: 16 }}
                      >
                        <Alert.Icon />
                        <Alert.Content>
                          <Alert.Title>
                            Connections are now grouped into three tabs — Unified, Workflows, and Apps
                          </Alert.Title>
                          <Alert.Description>
                            &ldquo;Unified&rdquo; connections work for both Workflows and Apps. Your existing
                            connections are still fully active and will continue to work as before.
                          </Alert.Description>
                          <Alert.Actions>
                            <Button
                              buttonType="primary"
                              variant="inverse"
                              onClick={() => setShowNotice(false)}
                            >
                              Got it
                            </Button>
                          </Alert.Actions>
                        </Alert.Content>
                        <Alert.CloseIconButton />
                      </Alert>
                    )}
                  </PageLayout.Notification>

                  {showUnifiedEmptyState ? (
                    <EmptyState
                      style={{ marginTop: 40 }}
                      styleSlots={{ image: { backgroundColor: "transparent" } }}
                    >
                      <EmptyState.Icon>
                        <AssetIcon aria-hidden size="xlg" variant="integrations" />
                      </EmptyState.Icon>
                      <EmptyState.Content>
                        <EmptyState.Title>No connections yet</EmptyState.Title>
                        <EmptyState.Description>
                          Secure, reusable bridges between your environment and your
                          third-party tools.
                        </EmptyState.Description>
                      </EmptyState.Content>
                      <EmptyState.Actions>
                        <div style={{ display: "flex", gap: 12 }}>
                          <Card
                            asChild
                            interactive
                            style={{ width: 240, textAlign: "left" }}
                            onClick={() => setCreateConnectionDrawerOpen(true)}
                          >
                            <button type="button">
                              <Card.Content>
                                <DesignGradientIcon width={20} height={20} />
                                <p style={{ fontWeight: 600, margin: "10px 0 4px" }}>
                                  Create a connection
                                </p>
                                <p style={{ margin: 0, color: "var(--ntx-color-content-weak)" }}>
                                  Start with a blank connection and connect to your services.
                                </p>
                              </Card.Content>
                            </button>
                          </Card>

                          {/* Not wired up yet — mirrors the toolbar's own unwired "Import
                              connection" button above. */}
                          <Card asChild interactive style={{ width: 240, textAlign: "left" }}>
                            <button type="button">
                              <Card.Content>
                                <Import
                                  aria-hidden
                                  width={20}
                                  height={20}
                                  style={{ color: "var(--ntx-color-content-default)" }}
                                />
                                <p style={{ fontWeight: 600, margin: "10px 0 4px" }}>
                                  Import an existing file
                                </p>
                                <p style={{ margin: 0, color: "var(--ntx-color-content-weak)" }}>
                                  Upload a connection you&rsquo;ve built previously.
                                </p>
                              </Card.Content>
                            </button>
                          </Card>
                        </div>
                      </EmptyState.Actions>
                    </EmptyState>
                  ) : (
                    <>
                      {/* bodyRowHover is an opt-in hook — List doesn't tint rows by default, but
                          this row genuinely is actionable (the name is a real link), so it earns
                          it. */}
                      <ConnectionsList
                        data={filteredConnections}
                        columns={columns}
                        enableSorting
                        styleSlots={{
                          bodyRowHover: {
                            backgroundColor: "var(--ntx-color-background-default-hover)",
                            cursor: "pointer",
                          },
                        }}
                      >
                        <List.Header />
                        <List.Body />
                        {/* Pagination/page-size only earn their place once there's more than one
                            page to move between — with 10 or fewer rows they'd control nothing. */}
                        {filteredConnections.length > 10 && (
                          <List.Footer>
                            <List.PageSizeSelect options={[10, 20, 50]} />
                            <List.Pagination />
                          </List.Footer>
                        )}
                      </ConnectionsList>

                      <Card style={{ marginTop: 16 }}>
                        <Card.Content>
                          Help us prioritize what we build next.{" "}
                          <TextLink
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            Suggest a connector
                            <NewWindow width={12} height={12} aria-hidden />
                          </TextLink>
                        </Card.Content>
                      </Card>

                      {/* A real flex item, not container padding-bottom: this whole ancestor
                          chain up to the scrolling `.exp-textura_page-layout_main` is
                          `overflow: visible`/fixed-height flex columns, and a fixed-height flex
                          item's own trailing padding gets rendered at the box's nominal edge —
                          not after its own overflowing content — so it never shows once the page
                          actually needs to scroll (verified in devtools: padding-bottom produced
                          zero visible gap). `flexShrink: 0` keeps this spacer from being squeezed
                          away like an ordinary flex item would be under that same overflow. */}
                      <div style={{ flexShrink: 0, height: 24 }} aria-hidden="true" />
                    </>
                  )}
                </PageLayout.BodyContent>
              </TabBar.Panel>

            </TabBar>
          </PageLayout.TabBar>
        </PageLayout.Body>
      </PageLayout.Main>
    </PageLayout>
  );
}
