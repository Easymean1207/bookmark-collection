export type CustomFolder = { id: string; name: string };
export type FolderStore = { added: CustomFolder[]; deleted: string[]; renamed: Record<string, string> };

export function swapFolderPositions(folders: CustomFolder[], firstId: string, secondId: string): CustomFolder[] {
  const first = folders.findIndex((folder) => folder.id === firstId);
  const second = folders.findIndex((folder) => folder.id === secondId);
  if (first < 0 || second < 0 || first === second) return folders;
  const swapped = [...folders];
  [swapped[first], swapped[second]] = [swapped[second], swapped[first]];
  return swapped;
}

export function orderFolders(folders: CustomFolder[], rawOrder: string | null): CustomFolder[] {
  try {
    const saved: unknown = JSON.parse(rawOrder ?? "null");
    if (!Array.isArray(saved)) return folders;
    const positions = new Map(saved.filter((id): id is string => typeof id === "string").map((id, index) => [id, index]));
    return [...folders].sort((a, b) => (positions.get(a.id) ?? folders.length) - (positions.get(b.id) ?? folders.length));
  } catch {
    return folders;
  }
}

export function renameFolder(store: FolderStore, folderId: string, name: string, visibleFolders: CustomFolder[]): FolderStore {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("폴더 이름을 입력해 주세요.");
  if (trimmed.length > 40) throw new Error("폴더 이름은 40자 이내로 입력해 주세요.");
  const folder = visibleFolders.find((item) => item.id === folderId);
  if (!folder) throw new Error("폴더를 찾을 수 없습니다.");
  if (visibleFolders.some((item) => item.id !== folderId && item.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
    throw new Error("이미 있는 폴더 이름입니다.");
  }
  if (store.added.some((item) => item.id === folderId)) {
    return { ...store, added: store.added.map((item) => item.id === folderId ? { ...item, name: trimmed } : item) };
  }
  return { ...store, renamed: { ...store.renamed, [folderId]: trimmed } };
}

export function parseFolderStore(raw: string | null): FolderStore {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (Array.isArray(value)) return { added: parseCustomFolders(raw), deleted: [], renamed: {} };
    if (!value || typeof value !== "object") return { added: [], deleted: [], renamed: {} };
    const saved = value as { added?: unknown; deleted?: unknown; renamed?: unknown };
    return {
      added: parseCustomFolders(JSON.stringify(saved.added ?? [])),
      deleted: Array.isArray(saved.deleted)
        ? saved.deleted.filter((id): id is string => typeof id === "string")
        : [],
      renamed: saved.renamed && typeof saved.renamed === "object" && !Array.isArray(saved.renamed)
        ? Object.fromEntries(Object.entries(saved.renamed).filter(([, name]) =>
            typeof name === "string" && name.trim().length > 0 && name.length <= 40))
        : {},
    };
  } catch {
    return { added: [], deleted: [], renamed: {} };
  }
}

export function addCustomFolder(existing: CustomFolder[], name: string, id: string): CustomFolder[] {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("폴더 이름을 입력해 주세요.");
  if (existing.some((folder) => folder.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
    throw new Error("이미 있는 폴더 이름입니다.");
  }
  return [...existing, { id, name: trimmed }];
}

export function parseCustomFolders(raw: string | null): CustomFolder[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value)
      ? value.filter((folder): folder is CustomFolder =>
          folder !== null && typeof folder === "object" &&
          typeof folder.id === "string" && /^custom-[\w-]+$/.test(folder.id) &&
          typeof folder.name === "string" && folder.name.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}
