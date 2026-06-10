import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  title: string;
};

function Modal({ children, title }: ModalProps) {
  return (
    <div className="modal-overlay" role="presentation">
      <section aria-labelledby="modal-title" className="modal-shell">
        <h2 id="modal-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}

export default Modal;
