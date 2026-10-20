export type GalleryUploadEntry = {
  id: string;
};

export function reserveGallerySortOrders(
  existingSortOrders: number[],
  nextReservedSortOrder: number,
  count: number,
) {
  const nextOrder = Math.max(
    nextReservedSortOrder,
    existingSortOrders.reduce((max, order) => Math.max(max, order + 1), 0),
  );

  return {
    sortOrders: Array.from({ length: count }, (_, index) => nextOrder + index),
    nextReservedSortOrder: nextOrder + count,
  };
}

export function mergeGalleryUploadEntries<T extends GalleryUploadEntry>(
  current: T[],
  updates: T[],
): T[] {
  const next = [...current];
  for (const update of updates) {
    const existingIndex = next.findIndex((entry) => entry.id === update.id);
    if (existingIndex === -1) {
      next.push(update);
    } else {
      next[existingIndex] = update;
    }
  }
  return next;
}
