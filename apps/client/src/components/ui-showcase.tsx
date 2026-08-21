import { useState } from "preact/hooks";
import { Box, Button, Input, Modal, Select, Skeleton } from "./ui";
import styles from "./ui-showcase.module.css";

const SERVER_OPTIONS = [
  { label: "Europe West", value: "euw", hint: "312 playing" },
  { label: "US East", value: "use", hint: "148 playing" },
  { label: "Asia", value: "asia", hint: "offline" },
  { label: "Local Dev", value: "local", hint: "1 playing" },
];

const SWATCHES: { name: string; varName: string }[] = [
  { name: "theme", varName: "--ui-theme" },
  { name: "accent", varName: "--ui-accent" },
  { name: "danger", varName: "--ui-danger" },
  { name: "gold", varName: "--ui-gold" },
  { name: "panel", varName: "--ui-panel" },
  { name: "field", varName: "--ui-field" },
];

export function UiShowcase() {
  const [name, setName] = useState("SwiftStriker42");
  const [server, setServer] = useState("local");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fakeLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div class={styles.page}>
      <div class={styles.wrap}>
        <h1 class={styles.title}>UI Components</h1>
        <p class={styles.subtitle}>Fuseball component library preview</p>

        {/* Colors */}
        <Box class={styles.section}>
          <h3>Palette</h3>
          <div class={styles.swatches}>
            {SWATCHES.map((s) => (
              <div
                key={s.varName}
                class={`ui-box ${styles.swatch}`}
                style={{ backgroundColor: `var(${s.varName})` }}
              >
                {s.name}
              </div>
            ))}
          </div>
        </Box>

        {/* Buttons */}
        <Box class={styles.section}>
          <h3>Buttons</h3>
          <div class={styles.stack}>
            <div class={styles.row}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div class={styles.row}>
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
            <div class={styles.row}>
              <Button loading={loading} onClick={fakeLoad}>
                {loading ? "Loading" : "Click to load"}
              </Button>
              <Button disabled>Disabled</Button>
              <Button variant="secondary" size="small">
                ▶ With icon
              </Button>
            </div>
            <Button block variant="primary" size="large">
              ▶ Quick Play (block)
            </Button>
          </div>
        </Box>

        {/* Inputs + Select */}
        <div class={styles.grid}>
          <Box class={styles.section}>
            <h3>Inputs</h3>
            <div class={styles.stack}>
              <Input
                label="Display name"
                value={name}
                onValue={setName}
                maxLength={16}
                extra={<span>🎲</span>}
                onExtraClick={() =>
                  setName("LuckyPanther" + Math.floor(Math.random() * 90 + 10))
                }
              />
              <Input
                label="Party code"
                value=""
                onValue={() => {}}
                placeholder="e.g. FUSE-7Q2X"
              />
            </div>
          </Box>

          <Box class={styles.section}>
            <h3>Select</h3>
            <Select
              label="Server"
              options={SERVER_OPTIONS}
              value={server}
              onChange={setServer}
            />
          </Box>
        </div>

        {/* Modal + Skeleton */}
        <div class={styles.grid}>
          <Box class={styles.section}>
            <h3>Modal</h3>
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          </Box>

          <Box class={styles.section}>
            <h3>Skeleton</h3>
            <div class={styles.stack}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="90%" height={16} />
              <Skeleton width={48} height={48} radius={8} />
            </div>
          </Box>
        </div>

        {/* Box variants */}
        <div class={styles.grid}>
          <Box class={styles.section}>
            <h3>Box (default padding)</h3>
            <p style={{ margin: 0, color: "var(--ui-text-dim)" }}>
              Chunky panel with border, offset shadow and bottom lip.
            </p>
          </Box>
          <Box
            flush
            class={styles.section}
            style={{ padding: "0", overflow: "hidden" }}
          >
            <div style={{ padding: "16px" }}>
              <h3>Box (flush)</h3>
              <p style={{ margin: 0, color: "var(--ui-text-dim)" }}>
                No default padding — you control the inside.
              </p>
            </div>
          </Box>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example modal"
      >
        <p style={{ marginTop: 0, color: "var(--ui-text-dim)" }}>
          This is a modal built from the UI kit. Press Esc, click the backdrop,
          or the ✕ to close.
        </p>
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setModalOpen(false)}>Confirm</Button>
        </div>
      </Modal>
    </div>
  );
}
