import { useRef, useState, type ChangeEvent } from "react";
import {
  Button,
  ButtonGroup,
  Modal,
  Field,
  IconButton,
  InfoBlock,
  InfoBlockButton,
  Input,
  Textarea,
} from "@exp-textura/react";
import { AiNew, Upload, Link, ChevronLeft, File } from "@exp-textura/icons";

type CreateXtensionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Step = "choose" | "ai" | "import" | "url";

// Three parallel starting points instead of two cards where the "spec" option was itself
// overloaded (file OR url, chosen inside a single combined screen). Each card jumps straight to
// the one focused input it promised, rather than a picker nested inside a picker.
export function CreateXtensionModal({ open, onOpenChange }: CreateXtensionModalProps) {
  const [step, setStep] = useState<Step>("choose");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setStep("choose");
      setDescription("");
      setUrl("");
      setFileName(null);
    }
  };

  const StepHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <IconButton
          aria-label="Back"
          buttonType="secondary"
          size="sm"
          onClick={() => setStep("choose")}
          style={{ marginLeft: -8 }}
        >
          <ChevronLeft />
        </IconButton>
        <span style={{ fontWeight: 600 }}>{title}</span>
      </div>
      <p style={{ color: "var(--ntx-color-content-weak)", margin: 0 }}>{subtitle}</p>
    </div>
  );

  return (
    // Modal, not Drawer — per the platform constitution's Overlay Surface Hierarchy, this is a
    // one-shot "choose a method, fill one input, done" task, not a panel the user revisits
    // repeatedly in a session (that's what Drawer is for). Promoted to md: the choose step's
    // three cards sit side by side, and sm was demonstrably too narrow for that — each card's
    // subtitle truncated mid-word (InfoBlock.Subtitle is always single-line).
    <Modal open={open} onOpenChange={handleOpenChange} size="md">
      <Modal.Title>Create Xtension</Modal.Title>
      <Modal.CloseIconButton aria-label="Close modal" />
      <Modal.Divider />
      <Modal.Content style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {step === "choose" && (
          <>
            <p style={{ fontWeight: 600, margin: 0 }}>How do you want to create your Xtension?</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <InfoBlockButton onClick={() => setStep("ai")} style={{ flex: "1 1 0", minWidth: 0 }}>
                <InfoBlock>
                  <InfoBlock.Visual>
                    <InfoBlock.IconThumbnail>
                      <AiNew />
                    </InfoBlock.IconThumbnail>
                  </InfoBlock.Visual>
                  <InfoBlock.Content>
                    <InfoBlock.Title>Start with AI</InfoBlock.Title>
                    <InfoBlock.Subtitle>Describe your idea</InfoBlock.Subtitle>
                  </InfoBlock.Content>
                </InfoBlock>
                <InfoBlockButton.TriggerIcon />
              </InfoBlockButton>

              <InfoBlockButton onClick={() => setStep("import")} style={{ flex: "1 1 0", minWidth: 0 }}>
                <InfoBlock>
                  <InfoBlock.Visual>
                    <InfoBlock.IconThumbnail>
                      <Upload />
                    </InfoBlock.IconThumbnail>
                  </InfoBlock.Visual>
                  <InfoBlock.Content>
                    <InfoBlock.Title>Import</InfoBlock.Title>
                    <InfoBlock.Subtitle>Upload a spec file</InfoBlock.Subtitle>
                  </InfoBlock.Content>
                </InfoBlock>
                <InfoBlockButton.TriggerIcon />
              </InfoBlockButton>

              <InfoBlockButton onClick={() => setStep("url")} style={{ flex: "1 1 0", minWidth: 0 }}>
                <InfoBlock>
                  <InfoBlock.Visual>
                    <InfoBlock.IconThumbnail>
                      <Link />
                    </InfoBlock.IconThumbnail>
                  </InfoBlock.Visual>
                  <InfoBlock.Content>
                    <InfoBlock.Title>Add URL</InfoBlock.Title>
                    <InfoBlock.Subtitle>Paste a spec URL</InfoBlock.Subtitle>
                  </InfoBlock.Content>
                </InfoBlock>
                <InfoBlockButton.TriggerIcon />
              </InfoBlockButton>
            </div>
          </>
        )}

        {step === "ai" && (
          <>
            <StepHeader
              title="Describe your Xtension"
              subtitle="Tell us what the connector should do — we&rsquo;ll generate it for you."
            />
            <Field name="description" required>
              <Field.Label>Description</Field.Label>
              <Field.Control>
                {(field) => (
                  <Textarea
                    {...field}
                    value={description}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setDescription(event.target.value)
                    }
                    placeholder="e.g. Connect to our internal HR system's REST API for employee lookups"
                    rows={6}
                  />
                )}
              </Field.Control>
            </Field>
          </>
        )}

        {step === "import" && (
          <>
            <StepHeader
              title="Upload your OpenAPI specification"
              subtitle="JSON or YAML files exported from your API or Xtension are supported."
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: 32,
                border: "1px dashed var(--ntx-color-border-default)",
                borderRadius: "var(--ntx-border-radius-md)",
              }}
            >
              <Upload width={24} height={24} aria-hidden />
              {fileName ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <File width={16} height={16} aria-hidden />
                  {fileName}
                </span>
              ) : (
                <span style={{ color: "var(--ntx-color-content-weak)" }}>
                  Drag and drop a file, or
                </span>
              )}
              <Button buttonType="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                Choose a file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                style={{ display: "none" }}
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
              />
            </div>
          </>
        )}

        {step === "url" && (
          <>
            <StepHeader
              title="Link to your OpenAPI specification"
              subtitle="Paste a URL to a hosted OpenAPI spec (JSON or YAML)."
            />
            <Field name="url" required>
              <Field.Label>OpenAPI spec URL</Field.Label>
              <Field.Control>
                {(field) => (
                  <Input
                    {...field}
                    value={url}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setUrl(event.target.value)}
                    placeholder="https://api.example.com/openapi.json"
                  />
                )}
              </Field.Control>
            </Field>
          </>
        )}
      </Modal.Content>
      <Modal.Divider />
      <Modal.Footer>
        <ButtonGroup style={{ display: "flex", justifyContent: "flex-end" }}>
          <Modal.Close>
            <Button buttonType="tertiary">Cancel</Button>
          </Modal.Close>
          {step === "ai" && (
            <Button buttonType="primary" disabled={!description.trim()}>
              Generate
            </Button>
          )}
          {step === "import" && (
            <Button buttonType="primary" disabled={!fileName}>
              Upload
            </Button>
          )}
          {step === "url" && (
            <Button buttonType="primary" disabled={!url.trim()}>
              Continue
            </Button>
          )}
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
}
