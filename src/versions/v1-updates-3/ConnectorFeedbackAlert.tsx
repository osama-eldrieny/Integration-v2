import { Alert, Button } from "@exp-textura/react";

// Rendered once on the main Integrations page (not per-drawer) — generic on purpose, since it
// isn't about any one surface's connector gaps specifically. Placeholder href: the real
// feedback-form URL hasn't been provided yet.
export function ConnectorFeedbackAlert() {
  return (
    <Alert variant="info" type="inline" style={{ flex: "0 0 auto", marginBottom: 16 }}>
      <Alert.Icon />
      <Alert.Content>
        <Alert.Description>Help us prioritize which connectors we bring here next.</Alert.Description>
        {/* No variant override — this alert's treatment is "subtle" (light background), so
            Alert.Actions' own default pairing ("desaturated") is correct here. */}
        <Alert.Actions>
          <Button onClick={() => window.open("#", "_blank", "noopener,noreferrer")}>Share feedback</Button>
        </Alert.Actions>
      </Alert.Content>
    </Alert>
  );
}
