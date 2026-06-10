import { getCurrentWindow } from "@tauri-apps/api/window";

type ResizeDirection =
  | "East"
  | "North"
  | "NorthEast"
  | "NorthWest"
  | "South"
  | "SouthEast"
  | "SouthWest"
  | "West";

const resizeHandles: Array<{
  className: string;
  direction: ResizeDirection;
  label: string;
}> = [
  {
    className: "resize-handle resize-handle--north",
    direction: "North",
    label: "Resize window from top",
  },
  {
    className: "resize-handle resize-handle--east",
    direction: "East",
    label: "Resize window from right",
  },
  {
    className: "resize-handle resize-handle--south",
    direction: "South",
    label: "Resize window from bottom",
  },
  {
    className: "resize-handle resize-handle--west",
    direction: "West",
    label: "Resize window from left",
  },
  {
    className: "resize-handle resize-handle--north-east",
    direction: "NorthEast",
    label: "Resize window from top right",
  },
  {
    className: "resize-handle resize-handle--north-west",
    direction: "NorthWest",
    label: "Resize window from top left",
  },
  {
    className: "resize-handle resize-handle--south-east",
    direction: "SouthEast",
    label: "Resize window from bottom right",
  },
  {
    className: "resize-handle resize-handle--south-west",
    direction: "SouthWest",
    label: "Resize window from bottom left",
  },
];

function ResizeHandles() {
  const appWindow = getCurrentWindow();

  return (
    <>
      {resizeHandles.map((handle) => (
        <div
          aria-label={handle.label}
          className={handle.className}
          key={handle.direction}
          onPointerDown={(event) => {
            event.preventDefault();
            void appWindow.startResizeDragging(handle.direction);
          }}
          role="separator"
        />
      ))}
    </>
  );
}

export default ResizeHandles;
