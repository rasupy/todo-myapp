// テンプレートファイルのリスト
const TEMPLATE_FILES = [
  "/templates/category-item.html",
  "/templates/task-item.html",
  "/templates/modal-category-add.html",
  "/templates/modal-task-add.html",
  "/templates/modal-task-edit.html",
] as const;

export async function loadTemplates() {
  // 既にロード済みならスキップ
  if (document.body.dataset.templatesLoaded === "1") return;

  const frags = await Promise.all(
    TEMPLATE_FILES.map(async (path) => {
      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load template: ${path}`);
      const html = await res.text();
      const tpl = document.createElement("template");
      tpl.innerHTML = html.trim();
      // 内部の <template> を取り出して返す
      const inner = tpl.content.firstElementChild;
      if (!inner || inner.tagName.toLowerCase() !== "template") {
        throw new Error(`Invalid template wrapper in ${path}`);
      }
      return inner as HTMLTemplateElement;
    })
  );

  const mount = document.createDocumentFragment();
  frags.forEach((t) => mount.appendChild(t));
  document.body.appendChild(mount);
  // モーダルテンプレートは実体も配置しておく（ID参照で既存コードが動くように）
  frags
    .filter((t) => t.id.startsWith("tmpl-modal-"))
    .forEach((t) => {
      const content = (t as HTMLTemplateElement).content.cloneNode(
        true
      ) as DocumentFragment;
      document.body.appendChild(content);
    });
  document.body.dataset.templatesLoaded = "1";
}

export function getTemplate(id: string): HTMLTemplateElement {
  const tpl = document.getElementById(id) as HTMLTemplateElement | null;
  if (!tpl) throw new Error(`Template not found: ${id}`);
  return tpl;
}
