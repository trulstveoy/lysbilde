import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePointerReorder } from "./usePointerReorder";

afterEach(() => {
  cleanup();
});

function Harness({
  keyboardMode = "linear",
  itemCount = 3,
  onReorder = vi.fn(),
}: {
  keyboardMode?: "linear" | "vertical";
  itemCount?: number;
  onReorder?: (from: number, to: number) => void;
}) {
  const reorder = usePointerReorder({ itemCount, onReorder });

  return (
    <div>
      {Array.from({ length: itemCount }, (_, index) => (
        <div
          data-dragging={reorder.draggingIndex === index}
          data-over={reorder.overIndex === index}
          key={index}
          onPointerEnter={() => reorder.handlePointerEnter(index)}
        >
          <button
            aria-label={`Drag slide ${index + 1}`}
            onPointerCancel={reorder.handlePointerCancel}
            onPointerDown={(event) => reorder.handlePointerDown(event, index)}
            onPointerUp={reorder.handlePointerUp}
            onKeyDown={(event) =>
              reorder.handleKeyDown(event, index, keyboardMode)
            }
            type="button"
          />
        </div>
      ))}
    </div>
  );
}

describe("usePointerReorder", () => {
  it("reorders from the started index to the entered index on pointer up", () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);

    fireEvent.pointerDown(screen.getByLabelText("Drag slide 1"), {
      pointerId: 1,
    });
    fireEvent.pointerEnter(screen.getByLabelText("Drag slide 3").parentElement!);
    fireEvent.pointerUp(screen.getByLabelText("Drag slide 1"));

    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });

  it("reorders when the pointer is released outside the original handle", () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);

    fireEvent.pointerDown(screen.getByLabelText("Drag slide 1"), {
      pointerId: 1,
    });
    fireEvent.pointerEnter(screen.getByLabelText("Drag slide 3").parentElement!);
    fireEvent.pointerUp(window);

    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });

  it("uses the latest onReorder callback when pointer drag finishes after rerender", () => {
    const oldReorder = vi.fn();
    const newReorder = vi.fn();
    const { rerender } = render(<Harness onReorder={oldReorder} />);

    fireEvent.pointerDown(screen.getByLabelText("Drag slide 1"), {
      pointerId: 1,
    });
    fireEvent.pointerEnter(screen.getByLabelText("Drag slide 3").parentElement!);

    rerender(<Harness onReorder={newReorder} />);
    fireEvent.pointerUp(window);

    expect(oldReorder).not.toHaveBeenCalled();
    expect(newReorder).toHaveBeenCalledWith(0, 2);
  });

  it("does not reorder when the pointer returns to the starting index", () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);

    fireEvent.pointerDown(screen.getByLabelText("Drag slide 2"), {
      pointerId: 1,
    });
    fireEvent.pointerUp(screen.getByLabelText("Drag slide 2"));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("resets dragging state after pointer cancel", () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);

    fireEvent.pointerDown(screen.getByLabelText("Drag slide 1"), {
      pointerId: 1,
    });
    fireEvent.pointerEnter(screen.getByLabelText("Drag slide 2").parentElement!);
    fireEvent.pointerCancel(screen.getByLabelText("Drag slide 1"));

    expect(onReorder).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Drag slide 1").parentElement).toHaveAttribute(
      "data-dragging",
      "false",
    );
    expect(screen.getByLabelText("Drag slide 2").parentElement).toHaveAttribute(
      "data-over",
      "false",
    );
  });

  it("removes window pointer listeners after pointer cancel", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    render(<Harness />);

    fireEvent.pointerDown(screen.getByLabelText("Drag slide 1"), {
      pointerId: 1,
    });
    fireEvent.pointerCancel(window);

    expect(removeEventListener).toHaveBeenCalledWith(
      "pointerup",
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "pointercancel",
      expect.any(Function),
    );

    removeEventListener.mockRestore();
  });

  it("ignores pointer starts outside the item count", () => {
    const onReorder = vi.fn();

    function InvalidStartHarness() {
      const reorder = usePointerReorder({ itemCount: 1, onReorder });
      return (
        <button
          aria-label="Invalid drag"
          onPointerDown={(event) => reorder.handlePointerDown(event, 3)}
          onPointerUp={reorder.handlePointerUp}
          type="button"
        />
      );
    }

    render(<InvalidStartHarness />);

    fireEvent.pointerDown(screen.getByLabelText("Invalid drag"), {
      pointerId: 1,
    });
    fireEvent.pointerUp(screen.getByLabelText("Invalid drag"));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("reorders list items with ArrowUp and ArrowDown only", () => {
    const onReorder = vi.fn();
    render(<Harness keyboardMode="vertical" onReorder={onReorder} />);

    fireEvent.keyDown(screen.getByLabelText("Drag slide 2"), {
      key: "ArrowUp",
    });
    fireEvent.keyDown(screen.getByLabelText("Drag slide 2"), {
      key: "ArrowDown",
    });
    fireEvent.keyDown(screen.getByLabelText("Drag slide 2"), {
      key: "ArrowLeft",
    });

    expect(onReorder).toHaveBeenNthCalledWith(1, 1, 0);
    expect(onReorder).toHaveBeenNthCalledWith(2, 1, 2);
    expect(onReorder).toHaveBeenCalledTimes(2);
  });

  it("reorders grid items by one position with arrow keys", () => {
    const onReorder = vi.fn();
    render(<Harness keyboardMode="linear" onReorder={onReorder} />);

    fireEvent.keyDown(screen.getByLabelText("Drag slide 2"), {
      key: "ArrowLeft",
    });
    fireEvent.keyDown(screen.getByLabelText("Drag slide 2"), {
      key: "ArrowRight",
    });
    fireEvent.keyDown(screen.getByLabelText("Drag slide 2"), {
      key: "ArrowUp",
    });
    fireEvent.keyDown(screen.getByLabelText("Drag slide 2"), {
      key: "ArrowDown",
    });

    expect(onReorder).toHaveBeenNthCalledWith(1, 1, 0);
    expect(onReorder).toHaveBeenNthCalledWith(2, 1, 2);
    expect(onReorder).toHaveBeenNthCalledWith(3, 1, 0);
    expect(onReorder).toHaveBeenNthCalledWith(4, 1, 2);
  });
});
