import { getCurrentWindow } from "@tauri-apps/api/window";
import type { PointerEvent } from "react";

type TitleBarProps = {
  title: string;
};

function TitleBar({ title }: TitleBarProps) {
  const appWindow = getCurrentWindow();
  const stopDrag = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <header className="titlebar" data-tauri-drag-region="true">
      <div className="traffic-lights">
        <button
          aria-label="Close window"
          className="traffic-light traffic-light--close"
          onClick={() => void appWindow.close()}
          onPointerDown={stopDrag}
          type="button"
        />
        <button
          aria-label="Minimize window"
          className="traffic-light traffic-light--minimize"
          onClick={() => void appWindow.minimize()}
          onPointerDown={stopDrag}
          type="button"
        />
        <button
          aria-label="Maximize window"
          className="traffic-light traffic-light--zoom"
          onClick={() => void appWindow.toggleMaximize()}
          onPointerDown={stopDrag}
          type="button"
        />
      </div>
      <div className="titlebar-title" data-tauri-drag-region="true">
        {title}
      </div>
      <div aria-hidden="true" className="titlebar-spacer" />
    </header>
  );
}

export default TitleBar;
