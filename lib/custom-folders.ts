export type CustomFolder = { id: string; name: string };
export type FolderStore = { added: CustomFolder[]; deleted: string[] };

export function parseFolderStore(raw: string | null): FolderStore {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (Array.isArray(value)) return { added: parseCustomFolders(raw), deleted: [] };
    if (!value || typeof value !== "object") return { added: [], deleted: [] };
    const saved = value as { added?: unknown; deleted?: unknown };
    return {
      added: parseCustomFolders(JSON.stringify(saved.added ?? [])),
      deleted: Array.isArray(saved.deleted)
        ? saved.deleted.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { added: [], deleted: [] };
  }
}

export function deleteFolder(store: FolderStore, folderId: string, staticIds: string[]): FolderStore {
  if (staticIds.includes(folderId) && !store.deleted.includes(folderId)) {
    return { ...store, deleted: [...store.deleted, folderId] };
  }
  if (store.added.some((folder) => folder.id === folderId)) {
    return { ...store, added: store.added.filter((folder) => folder.id !== folderId) };
  }
  throw new Error("폴더를 찾을 수 없습니다.");
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
