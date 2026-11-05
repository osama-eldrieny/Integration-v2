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
import { connectorCatalog, type ConnectorSurface } from "./data/connectorCatalog";

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
  const [showNotice, setShowNotice] = useState(true);
  const titleId = "integrations-title";

  const [unifiedDrawerOpen, setUnifiedDrawerOpen] = useState(false);
  const [workflowDrawerOpen, setWorkflowDrawerOpen] = useState(false);
  const [appsDrawerOpen, setAppsDrawerOpen] = useState(false);

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
                      <IconButton aria-label="About connection filters" buttonType="secondary" size="sm">
                        <Info />
                      </IconButton>
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
                          <Menu.Item onSelect={() => setAppsDrawerOpen(true)}>
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
                  <CreateConnectionDrawer
                    surface="apps"
                    title="Create apps connections"
                    open={appsDrawerOpen}
                    onOpenChange={setAppsDrawerOpen}
                    onSwitchToUnified={() => {
                      setAppsDrawerOpen(false);
                      setUnifiedDrawerOpen(true);
                    }}
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
                  </ConnectionsList>

                  <Card style={{ marginTop: 16 }}>
                    <Card.Content>
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
                    </Card.Content>
                  </Card>
                </PageLayout.BodyContent>
              </TabBar.Panel>
            </TabBar>
          </PageLayout.TabBar>
        </PageLayout.Body>
      </PageLayout.Main>
    </PageLayout>
  );
}
