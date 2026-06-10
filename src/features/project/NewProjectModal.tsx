import { useState } from "react";

import Button from "../../components/Button";
import Modal from "../../components/Modal";

type NewProjectModalProps = {
  onClose: () => void;
  onCreate: (title: string) => void;
};

function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
  const [title, setTitle] = useState("");
  const trimmed = title.trim();

  return (
    <Modal title="New presentation">
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) {
            onCreate(trimmed);
          }
        }}
      >
        <label className="field-label" htmlFor="project-title">
          Name
        </label>
        <input
          autoFocus
          className="text-input"
          id="project-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Q3 strategy review"
          value={title}
        />
        <div className="modal-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={!trimmed} type="submit" variant="primary">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NewProjectModal;
