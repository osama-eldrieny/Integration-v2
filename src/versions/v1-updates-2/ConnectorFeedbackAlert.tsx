import { Alert, Button } from "@exp-textura/react";
import { NewWindow } from "@exp-textura/icons";

// Rendered once on the main Integrations page (not per-drawer) — generic on purpose, since it
// isn't about any one surface's connector gaps specifically. Placeholder href: the real
// feedback-form URL hasn't been provided yet.
export function ConnectorFeedbackAlert() {
  return (
    <Alert variant="info" type="inline" style={{ flex: "0 0 auto", marginBottom: 16 }}>
      <Alert.Icon />
      <Alert.Content>
        <Alert.Description>Don't see the connector you need? Let us know.</Alert.Description>
        {/* No variant override — this alert's treatment is "subtle" (light background), so
            Alert.Actions' own default pairing ("desaturated") is correct here. */}
        <Alert.Actions>
          <Button onClick={() => window.open("#", "_blank", "noopener,noreferrer")}>
            Suggest a connector
            <NewWindow width={14} height={14} aria-hidden />
          </Button>
        </Alert.Actions>
      </Alert.Content>
    </Alert>
  );
}
