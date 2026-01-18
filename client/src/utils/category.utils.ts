import type { Category } from "../services/category.service";

export type FlatCategoryRow = Category & {
  parent_name: string | null;
  level_label: string; // untuk indent: "— — Kursi Makan"
};

export type ParentOption = FlatCategoryRow & {
  disabled: boolean;
  disabled_reason?: string;
};

export const flattenCategories = (
  cats: Category[],
  parentName: string | null = null,
  depth = 0
): FlatCategoryRow[] => {
  const rows: FlatCategoryRow[] = [];

  for (const c of cats) {
    rows.push({
      ...c,
      parent_name: parentName,
      level_label: `${"— ".repeat(depth)}${c.name}`,
    });

    if (c.children?.length) {
      rows.push(...flattenCategories(c.children, c.name, depth + 1));
    }
  }

  return rows;
};

// cari node by id di tree
export const findCategoryNode = (cats: Category[], id: number): Category | null => {
  for (const c of cats) {
    if (c.id === id) return c;
    if (c.children?.length) {
      const found = findCategoryNode(c.children, id);
      if (found) return found;
    }
  }
  return null;
};

// kumpulkan semua descendant id (anak, cucu, dst)
export const collectDescendantIds = (node: Category | null): Set<number> => {
  const ids = new Set<number>();
  if (!node?.children?.length) return ids;

  const stack = [...node.children];
  while (stack.length) {
    const cur = stack.pop()!;
    ids.add(cur.id);
    if (cur.children?.length) stack.push(...cur.children);
  }
  return ids;
};

// opsi parent: disable diri sendiri + semua descendant
export const buildParentOptionsAdvanced = (
  treeCategories: Category[],
  flatRows: FlatCategoryRow[],
  editingId: number | null
): ParentOption[] => {
  const disabledIds = new Set<number>();

  if (editingId) {
    disabledIds.add(editingId);

    const node = findCategoryNode(treeCategories, editingId);
    const descendants = collectDescendantIds(node);
    descendants.forEach((id) => disabledIds.add(id));
  }

  return flatRows.map((row) => {
    const disabled = disabledIds.has(row.id);
    return {
      ...row,
      disabled,
      disabled_reason: disabled
        ? row.id === editingId
          ? "Tidak boleh pilih diri sendiri"
          : "Tidak boleh pilih keturunan sendiri"
        : undefined,
    };
  });
};

// validasi safety di submit juga
export const isInvalidParentSelection = (
  treeCategories: Category[],
  editingId: number | null,
  parentId: number | null
) => {
  if (!editingId || !parentId) return false;
  if (parentId === editingId) return true;

  const node = findCategoryNode(treeCategories, editingId);
  const descendants = collectDescendantIds(node);
  return descendants.has(parentId);
};
