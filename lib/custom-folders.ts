export type CustomFolder = { id: string; name: string };

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
