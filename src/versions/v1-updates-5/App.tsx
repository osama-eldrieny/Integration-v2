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
  List,
  Cell,
  InfoBlock,
  Avatar,
  NotificationBadge,
  Menu,
  Tooltip,
  TextLink,
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
  ChevronDown,
  NewWindow,
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
import { CreateConnectionDrawer } from "./CreateConnectionDrawer";
import { APPS_BUILDER_URL, connectorCatalog, type ConnectorSurface } from "./data/connectorCatalog";

// Every ConnectorType in data/connections.ts is a real name from the catalog, so this should
// always resolve — the empty-surfaces fallback only guards against the two staying out of sync.
function getCatalogEntry(connectorName: string) {
  return connectorCatalog.find((c) => c.name === connectorName) ?? { id: connectorName, name: connectorName, surfaces: [] };
}

// Row-level interaction (clickable connection name) is the primary task here, and there's no
// column-to-column comparison need — per List vs Table governance, that means List, not Table.
const ConnectionsList = List.ofType<ConnectionRow>();

const columns: ColumnDef<ConnectionRow, unknown>[] = [
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
    cell: (info) => <Cell>{info.getValue() as string}</Cell>,
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

export default function App() {
  const titleId = "integrations-title";

  const [unifiedDrawerOpen, setUnifiedDrawerOpen] = useState(false);
  const [workflowDrawerOpen, setWorkflowDrawerOpen] = useState(false);

  // Filters the Connections table to rows whose connector is actually available on the selected
  // surface — e.g. "Unified" shows only Accuweather/Slack connections, not every connection ever
  // created, since a unified filter that still showed non-unified connectors would be misleading.
  const [connectionFilter, setConnectionFilter] = useState<ConnectorSurface>("unified");
  const filteredConnections = connections.filter((connection) =>
    connectorCatalog.find((c) => c.name === connection.connector)?.surfaces.includes(connectionFilter),
  );

  return (
    // The installed Textura build (1.0.0) emits its md/lg breakpoint padding as
    // `@media (min-width: var(--ntx-breakpoints-lg-min-width))` — a CSS custom property inside
    // a media *feature* query, which the spec doesn't allow resolving, so those rules never
    // match and the layout is permanently stuck at the sm (16px) padding. Overriding the
    // `layout` styleSlot to the governed lg value (48px) works around the upstream bug.
    <PageLayout
      styleSlots={{
        layout: { paddingInline: "48px" },
        // The page-level notification's own edge-to-edge cancellation
        // (`marginInline: -pageMargin`) is hardcoded to the theme's default responsive margins
        // (24/24/16px) — it doesn't know about this page's custom 48px override above, so it
        // only cancelled half of it, leaving a visible gap on both sides. Match it here instead.
        notificationPageLevel: { marginInline: "-48px" },
      }}
    >
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
        {/* Idea B2: Header.Actions holding plain text + an inline link instead of a Button — keeps
            the trailing position, but stretches what Actions is documented to hold ("trailing
            button group for page-level actions"), not prose. */}
        <PageLayout.Header>
          <Header>
            <Header.Icon>
              <AssetIcon aria-hidden size="lg" variant="integrations" />
            </Header.Icon>
            <Header.Content>
              <Header.Title id={titleId}>Integrations</Header.Title>
            </Header.Content>
            <Header.Actions>
              <span style={{ fontSize: "0.875rem", color: "var(--ntx-color-content-weak)" }}>
                Don't see the connector you need? Let us know.{" "}
                <TextLink
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  Suggest a connector
                  <NewWindow width={12} height={12} aria-hidden />
                </TextLink>
              </span>
            </Header.Actions>
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
                      {/* Only 3 short chips — they must always be fully visible, never collapsed into "+N" */}
                      <ChipBar
                        selectionMode="single"
                        value={connectionFilter}
                        onValueChange={(value) => value && setConnectionFilter(value as ConnectorSurface)}
                        aria-label="Filter connections"
                        enableOverflow={false}
                      >
                        <Chip value="unified">Unified</Chip>
                        <Chip value="workflow">Workflow</Chip>
                        <Chip value="apps">Apps</Chip>
                      </ChipBar>
                      <Tooltip
                        position="right"
                        // Tooltip's root element (not .content) is what carries the default
                        // maxWidth constraint that was wrapping each line — override it there,
                        // plus nowrap on content, so all three lines render on their own line.
                        styleSlots={{ root: { maxWidth: "none" }, content: { whiteSpace: "nowrap" } }}
                      >
                        <Tooltip.Trigger>
                          <IconButton aria-label="About connection filters" buttonType="secondary" size="sm">
                            <Info />
                          </IconButton>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          Unified: New connections which work for both Workflows and Apps
                          <br />
                          Workflow: Existing connections used exclusively in Workflows
                          <br />
                          Apps: Existing connections used exclusively in Apps
                        </Tooltip.Content>
                      </Tooltip>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <Button buttonType="secondary">Import connection</Button>
                      {/* Single trigger that opens a menu — not a SplitButton, per governance's own
                          "prefer a dropdown over Split when there's no dominant one-click variant" ladder. */}
                      <Menu>
                        <Menu.Trigger>
                          <Button>
                            Create connection
                            <ChevronDown />
                          </Button>
                        </Menu.Trigger>
                        {/* Radix exposes the trigger's measured width as this CSS var on the content
                            element — matching it keeps the menu from ballooning wider than the button.
                            The component's own min-width (260px) otherwise wins over `width`, so it
                            has to be overridden too. */}
                        <Menu.Content
                          align="end"
                          style={{
                            width: "var(--radix-dropdown-menu-trigger-width)",
                            minWidth: "var(--radix-dropdown-menu-trigger-width)",
                          }}
                        >
                          {/* Apps doesn't have its own drawer built yet — redirects to the real
                              Apps builder (a separate product) instead. */}
                          <Menu.Item
                            onSelect={() => window.open(APPS_BUILDER_URL, "_blank", "noopener,noreferrer")}
                          >
                            <Menu.ItemLabel>Apps</Menu.ItemLabel>
                          </Menu.Item>
                          <Menu.Item onSelect={() => setWorkflowDrawerOpen(true)}>
                            <Menu.ItemLabel>Workflow</Menu.ItemLabel>
                          </Menu.Item>
                          <Menu.Item onSelect={() => setUnifiedDrawerOpen(true)}>
                            <Menu.ItemLabel>Unified</Menu.ItemLabel>
                          </Menu.Item>
                        </Menu.Content>
                      </Menu>
                    </div>
                  </div>

                  <CreateConnectionDrawer
                    surface="unified"
                    title="Create unified connections"
                    open={unifiedDrawerOpen}
                    onOpenChange={setUnifiedDrawerOpen}
                    onSwitchToWorkflow={() => {
                      setUnifiedDrawerOpen(false);
                      setWorkflowDrawerOpen(true);
                    }}
                  />
                  <CreateConnectionDrawer
                    surface="workflow"
                    title="Create workflow connections"
                    open={workflowDrawerOpen}
                    onOpenChange={setWorkflowDrawerOpen}
                    onSwitchToUnified={() => {
                      setWorkflowDrawerOpen(false);
                      setUnifiedDrawerOpen(true);
                    }}
                  />
                  {/* Apps doesn't get its own drawer yet — special-cased to redirect to the real
                      Apps builder (a separate product/origin) instead of a placeholder in-app
                      flow, until an Apps drawer is actually built here. */}

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
                  </ConnectionsList>
                </PageLayout.BodyContent>
              </TabBar.Panel>
            </TabBar>
          </PageLayout.TabBar>
        </PageLayout.Body>
      </PageLayout.Main>
    </PageLayout>
  );
}
