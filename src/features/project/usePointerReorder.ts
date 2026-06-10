import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type UsePointerReorderInput = {
  itemCount: number;
  onReorder: (from: number, to: number) => void;
};

type KeyboardReorderMode = "linear" | "vertical";

export function usePointerReorder({
  itemCount,
  onReorder,
}: UsePointerReorderInput) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);
  const itemCountRef = useRef(itemCount);
  const onReorderRef = useRef(onReorder);
  const removeWindowListenersRef = useRef<() => void>(() => {});

  itemCountRef.current = itemCount;
  onReorderRef.current = onReorder;

  useEffect(() => {
    itemCountRef.current = itemCount;
    onReorderRef.current = onReorder;
  });

  useEffect(() => () => removeWindowListenersRef.current(), []);

  function reset() {
    removeWindowListenersRef.current();
    draggingIndexRef.current = null;
    overIndexRef.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  }

  function handlePointerDown(
    event: PointerEvent<HTMLElement>,
    index: number,
  ) {
    if (!isValidIndex(index, itemCount)) {
      return;
    }

    event.preventDefault();
    addWindowListeners();
    draggingIndexRef.current = index;
    overIndexRef.current = index;
    setDraggingIndex(index);
    setOverIndex(index);
  }

  function handlePointerEnter(index: number) {
    if (
      draggingIndexRef.current === null ||
      !isValidIndex(index, itemCountRef.current)
    ) {
      return;
    }

    overIndexRef.current = index;
    setOverIndex(index);
  }

  function handlePointerUp() {
    const from = draggingIndexRef.current;
    const to = overIndexRef.current;
    const currentItemCount = itemCountRef.current;

    if (
      from !== null &&
      to !== null &&
      from !== to &&
      isValidIndex(from, currentItemCount) &&
      isValidIndex(to, currentItemCount)
    ) {
      onReorderRef.current(from, to);
    }
    reset();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLElement>,
    index: number,
    mode: KeyboardReorderMode = "linear",
  ) {
    const targetIndex = targetIndexForKey(
      event.key,
      index,
      itemCountRef.current,
      mode,
    );

    if (targetIndex === null) {
      return;
    }

    event.preventDefault();
    onReorderRef.current(index, targetIndex);
  }

  function addWindowListeners() {
    removeWindowListenersRef.current();

    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", reset);
    removeWindowListenersRef.current = () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", reset);
      removeWindowListenersRef.current = () => {};
    };
  }

  return {
    draggingIndex,
    overIndex,
    handlePointerCancel: reset,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    handleKeyDown,
  };
}

function isValidIndex(index: number, itemCount: number) {
  return Number.isInteger(index) && index >= 0 && index < itemCount;
}

function targetIndexForKey(
  key: string,
  index: number,
  itemCount: number,
  mode: KeyboardReorderMode,
) {
  const offset = keyboardOffsetForKey(key, mode);
  if (offset === 0) {
    return null;
  }

  const targetIndex = index + offset;
  return isValidIndex(targetIndex, itemCount) ? targetIndex : null;
}

function keyboardOffsetForKey(key: string, mode: KeyboardReorderMode) {
  if (key === "ArrowUp") {
    return -1;
  }
  if (key === "ArrowDown") {
    return 1;
  }
  if (mode === "linear" && key === "ArrowLeft") {
    return -1;
  }
  if (mode === "linear" && key === "ArrowRight") {
    return 1;
  }
  return 0;
}
