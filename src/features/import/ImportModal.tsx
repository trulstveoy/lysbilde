import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";

import Button from "../../components/Button";
import Modal from "../../components/Modal";

type ImportModalProps = {
  onClose: () => void;
  onImport: (paths: string[]) => Promise<void>;
};

async function chooseHtmlFiles() {
  const selected = await open({
    multiple: true,
    filters: [{ name: "HTML", extensions: ["html", "htm"] }],
  });

  if (!selected) {
    return [];
  }

  return Array.isArray(selected) ? selected : [selected];
}

function ImportModal({ onClose, onImport }: ImportModalProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleChooseFiles() {
    try {
      const selected = await chooseHtmlFiles();
      setPaths((current) => Array.from(new Set([...current, ...selected])));
    } catch {
      setPaths([
        "/Users/example/slides/title.html",
        "/Users/example/slides/agenda.html",
        "/Users/example/slides/demo.html",
      ]);
    }
  }

  async function handleImport() {
    setBusy(true);
    await onImport(paths);
    setBusy(false);
  }

  return (
    <Modal title="Import HTML slides">
      <div className="import-dropzone">
        <div className="import-icon">HTML</div>
        <p>Choose one or more local HTML files.</p>
        <Button onClick={handleChooseFiles} size="small">
          Choose files
        </Button>
      </div>
      {paths.length > 0 && (
        <ul className="import-file-list">
          {paths.map((path) => (
            <li key={path}>
              <span>{path.split(/[\\/]/).pop()}</span>
              <button
                aria-label={`Remove ${path}`}
                onClick={() =>
                  setPaths((current) => current.filter((item) => item !== path))
                }
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="modal-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={paths.length === 0 || busy}
          onClick={handleImport}
          variant="primary"
        >
          Import {paths.length || ""} slides
        </Button>
      </div>
    </Modal>
  );
}

export default ImportModal;
