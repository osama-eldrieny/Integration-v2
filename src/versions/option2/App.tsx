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
  Add,
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
import { connections, type Connection as ConnectionRow } from "./data/connections";
import { CreateConnectionModal } from "./CreateConnectionModal";
import { CreateXtensionModal } from "./CreateXtensionModal";
import {
  connectorCatalog,
  SURFACE_BADGE_LABEL,
  SURFACE_BADGE_VARIANT,
  type ConnectorSurface,
} from "./data/connectorCatalog";
import { xtensions, type Xtension } from "./data/xtensions";

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

const XtensionsList = List.ofType<Xtension>();

const xtensionColumns: ColumnDef<Xtension, unknown>[] = [
  { accessorKey: "name", header: "Name", enableSorting: false, size: 220, cell: (info) => <Cell>{info.getValue() as string}</Cell> },
  { accessorKey: "description", header: "Description", enableSorting: false, cell: (info) => <Cell>{info.getValue() as string}</Cell> },
  { accessorKey: "dateAdded", header: "Date added", enableSorting: false, size: 150, cell: (info) => <Cell>{info.getValue() as string}</Cell> },
  { accessorKey: "author", header: "Author", enableSorting: true, size: 160, cell: (info) => <Cell>{info.getValue() as string}</Cell> },
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
        <Menu>
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
            <Menu.Item>
              <Menu.ItemLabel>Edit Xtension</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Item>
              <Menu.ItemLabel>Duplicate</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item variant="destructive">
              <Menu.ItemLabel>Delete</Menu.ItemLabel>
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </div>
    ),
  },
];

// Connector column takes the active filter so it can show a surface chip only in the "All" view —
// once a single surface is already selected via the chip filter, repeating that same surface next
// to every row's connector name would be redundant.
function buildColumns(activeFilter: ConnectionFilter): ColumnDef<ConnectionRow, unknown>[] {
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
        <Menu>
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
            <Menu.Item>
              <Menu.ItemLabel>Edit connection</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Item>
              <Menu.ItemLabel>Duplicate</Menu.ItemLabel>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item variant="destructive">
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

  // Controlled (not defaultValue) so the modal's no-results state can hand off to Xtensions —
  // closing itself and switching tabs — without the page having to be told which tab is active.
  const [activeTab, setActiveTab] = useState("connections");

  const [createConnectionModalOpen, setCreateConnectionModalOpen] = useState(false);
  const [createXtensionModalOpen, setCreateXtensionModalOpen] = useState(false);

  const handleNavigateToXtensions = () => {
    setCreateConnectionModalOpen(false);
    setActiveTab("xtensions");
    // Land the user straight in the picker rather than just the tab — they already expressed
    // intent to create one, so making them click "Create Xtension" again would be a wasted step.
    setCreateXtensionModalOpen(true);
  };

  // Filters the Connections table to rows actually created on the selected surface. Connections
  // never overlap between Unified, Workflow, and Apps — each row has exactly one surface, even
  // when its connector is available on more than one (see data/connections.ts) — so this chip
  // filter and the "All" total always partition cleanly. "All" is the default landing view.
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredConnections = connections
    .filter((connection) => connectionFilter === "all" || connection.surface === connectionFilter)
    .filter(
      (connection) =>
        normalizedSearch === "" ||
        connection.name.toLowerCase().includes(normalizedSearch) ||
        connection.connector.toLowerCase().includes(normalizedSearch),
    );
  const columns = buildColumns(connectionFilter);

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
            <TabBar value={activeTab} onValueChange={setActiveTab}>
              <TabBar.List>
                <Tab value="connections">Connections</Tab>
                <Tab value="xtensions">Xtensions</Tab>
              </TabBar.List>
              <TabBar.Panel value="connections">
                {/* Explicit paddingBottom rather than relying on PageLayout's own bottom padding
                    or a trailing margin on the last child — margin-bottom collapses straight
                    through this chain of unpadded ancestors, so once the page actually needs to
                    scroll, the "Suggest a connector" card ends up flush against the scroll
                    container's edge. Padding never collapses, so this guarantees the gap. */}
                <PageLayout.BodyContent style={{ paddingBottom: 24 }}>
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
                      <Button onClick={() => setCreateConnectionModalOpen(true)}>Create connection</Button>
                    </div>
                  </div>

                  <CreateConnectionModal
                    open={createConnectionModalOpen}
                    onOpenChange={setCreateConnectionModalOpen}
                    onNavigateToXtensions={handleNavigateToXtensions}
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

                  {/* bodyRowHover is an opt-in hook — List doesn't tint rows by default, but this
                      row genuinely is actionable (the name is a real link), so it earns it. */}
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
                    {/* Pagination/page-size only earn their place once there's more than one page
                        to move between — with 10 or fewer rows they'd control nothing. */}
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
                </PageLayout.BodyContent>
              </TabBar.Panel>

              <TabBar.Panel value="xtensions">
                <PageLayout.BodyContent style={{ paddingBottom: 24 }}>
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
                    <p
                      style={{
                        fontFamily: "var(--ntx-typography-heading-sm-font-family)",
                        fontSize: "var(--ntx-typography-heading-sm-font-size)",
                        fontWeight: "var(--ntx-typography-heading-sm-font-weight)",
                        lineHeight: "var(--ntx-typography-heading-sm-line-height)",
                        margin: 0,
                      }}
                    >
                      Build and manage your custom connectors
                    </p>
                    {/* Single labeled primary action, not the bare "+" icon-only button the
                        referenced production page uses — icon + label reads unambiguously as
                        the primary action and names "Xtension" as our own term for it. Opens a
                        modal where the three creation methods (AI / Import / URL) are chosen as
                        a genuine first step, rather than being split across page-level buttons. */}
                    <Button
                      buttonType="primary"
                      style={{ flexShrink: 0 }}
                      onClick={() => setCreateXtensionModalOpen(true)}
                    >
                      <Add aria-hidden />
                      Create Xtension
                    </Button>
                  </div>

                  <CreateXtensionModal
                    open={createXtensionModalOpen}
                    onOpenChange={setCreateXtensionModalOpen}
                  />

                  <p
                    style={{
                      fontFamily: "var(--ntx-typography-section-heading-sm-font-family)",
                      fontSize: "var(--ntx-typography-section-heading-sm-font-size)",
                      fontWeight: "var(--ntx-typography-section-heading-sm-font-weight)",
                      lineHeight: "var(--ntx-typography-section-heading-sm-line-height)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--ntx-color-content-weak)",
                      margin: "0 0 8px",
                    }}
                  >
                    Your Xtensions
                  </p>

                  <XtensionsList data={xtensions} columns={xtensionColumns} enableSorting>
                    <List.Header />
                    <List.Body />
                  </XtensionsList>
                </PageLayout.BodyContent>
              </TabBar.Panel>
            </TabBar>
          </PageLayout.TabBar>
        </PageLayout.Body>
      </PageLayout.Main>
    </PageLayout>
  );
}
