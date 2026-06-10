export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (!isValidMove(items.length, from, to)) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function selectedIndexAfterMove(
  selectedIndex: number,
  from: number,
  to: number,
  itemCount?: number,
) {
  if (!isValidMove(itemCount, from, to)) {
    return selectedIndex;
  }
  if (selectedIndex === from) {
    return to;
  }
  if (from < selectedIndex && to >= selectedIndex) {
    return selectedIndex - 1;
  }
  if (from > selectedIndex && to <= selectedIndex) {
    return selectedIndex + 1;
  }
  return selectedIndex;
}

function isValidMove(itemCount: number | undefined, from: number, to: number) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from === to) {
    return false;
  }
  if (from < 0 || to < 0) {
    return false;
  }
  if (itemCount === undefined) {
    return true;
  }
  return from < itemCount && to < itemCount;
}
