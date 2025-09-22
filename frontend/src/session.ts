import { authStore, login, register, me } from "./auth.js";
import { loadTemplates, getTemplate } from "./templates.js";
import { logout } from "./auth.js";

type Theme = "light" | "dark";
const THEME_KEY = "app.theme";
let menuBound = false;

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.dataset.theme = theme; // CSSで[data-theme="dark"]などを参照
}

function getInitialTheme(): Theme {
  const saved = (localStorage.getItem(THEME_KEY) as Theme | null) || null;
  if (saved === "light" || saved === "dark") return saved;
  // 既定はライト
  return "light";
}

function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  updateThemeToggleLabel();
}

function toggleTheme() {
  const current =
    (document.documentElement.dataset.theme as Theme) || getInitialTheme();
  const next: Theme = current === "dark" ? "light" : "dark";
  setTheme(next);
}

function updateThemeToggleLabel() {
  const label = document.getElementById("themeToggleLabel");
  if (!label) return;
  const theme = (document.documentElement.dataset.theme as Theme) || "light";
  label.textContent = theme === "dark" ? "ライトモード" : "ダークモード";
}

async function mountAuthBoards() {
  await loadTemplates();
  const mount = document.getElementById("authBoards");
  if (!mount) return;
  // 既存要素クリア
  mount.innerHTML = "";
  // login を先に置き、registerは非表示に
  const loginTpl = getTemplate("tmpl-login-board");
  const regTpl = getTemplate("tmpl-register-board");
  const loginEl = loginTpl.content.cloneNode(true) as DocumentFragment;
  const regEl = regTpl.content.cloneNode(true) as DocumentFragment;
  mount.appendChild(loginEl);
  mount.appendChild(regEl);
  // registerBoardは初期非表示
  const registerBoard = document.getElementById("registerBoard");
  if (registerBoard) registerBoard.style.display = "none";
  bindAuthSwitchers();
  attachAuthFormHandlers();
}

function bindAuthSwitchers() {
  const btnOpenRegister = document.getElementById(
    "btnOpenRegister"
  ) as HTMLButtonElement | null;
  const btnBackToLogin = document.getElementById(
    "btnBackToLogin"
  ) as HTMLButtonElement | null;
  const loginBoard = document.getElementById("loginBoard");
  const registerBoard = document.getElementById("registerBoard");
  btnOpenRegister?.addEventListener("click", () => {
    if (loginBoard && registerBoard) {
      loginBoard.style.display = "none";
      registerBoard.style.display = "block";
    }
  });
  btnBackToLogin?.addEventListener("click", () => {
    if (loginBoard && registerBoard) {
      registerBoard.style.display = "none";
      loginBoard.style.display = "block";
    }
  });
}

function attachAuthFormHandlers() {
  const authError = document.getElementById("authError") as HTMLElement;
  const loginForm = document.getElementById("loginForm") as HTMLFormElement;
  const regForm = document.getElementById("registerForm") as HTMLFormElement;
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (authError) authError.style.display = "none";
    const email = (document.getElementById("loginEmail") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("loginPassword") as HTMLInputElement
    ).value;
    try {
      const user = await login(email, password);
      authStore.userId = user.userId;
      location.reload();
    } catch (err: any) {
      if (authError) {
        authError.textContent = String(err?.message || err);
        authError.style.display = "block";
      }
    }
  });

  regForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (authError) authError.style.display = "none";
    const name = (document.getElementById("regName") as HTMLInputElement).value;
    const email = (document.getElementById("regEmail") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("regPassword") as HTMLInputElement
    ).value;
    try {
      const user = await register(name, email, password);
      authStore.userId = user.userId;
      location.reload();
    } catch (err: any) {
      if (authError) {
        authError.textContent = String(err?.message || err);
        authError.style.display = "block";
      }
    }
  });
}

function showAuthBoard(show: boolean) {
  const auth = document.getElementById("authBoard")!;
  const header = document.querySelector("header") as HTMLElement;
  const board = document.getElementById("mainBoard") as HTMLElement;
  const result = document.getElementById("result") as HTMLElement;
  if (show) {
    auth.style.display = "block";
    header.style.display = "block"; // ログイン画面にもタイトルを表示
    const btnMenu = document.getElementById("btnMenu") as HTMLButtonElement;
    if (btnMenu) btnMenu.style.display = "none";
    board.style.display = "none";
    result.style.display = "none";
    // authBoardsにログイン/登録ボードをマウント
    mountAuthBoards();
  } else {
    auth.style.display = "none";
    header.style.display = "block";
    const btnMenu = document.getElementById("btnMenu") as HTMLButtonElement;
    if (btnMenu) btnMenu.style.display = "inline-block";
    board.style.display = "grid";
    result.style.display = "block";
  }
}

async function ensureSession() {
  const uid = authStore.userId;
  if (!uid) {
    showAuthBoard(true);
    return;
  }
  try {
    await me(uid);
    showAuthBoard(false);
  } catch {
    authStore.userId = null;
    showAuthBoard(true);
  }
}

function bindForms() {
  // 初回テーマ適用
  applyTheme(getInitialTheme());

  const btnMenu = document.getElementById("btnMenu") as HTMLButtonElement;
  btnMenu?.addEventListener("click", async () => {
    // テンプレートがまだなら読み込み
    await loadTemplates();
    const dlg = document.getElementById("menuDialog") as HTMLDialogElement;
    const btnToggle = document.getElementById(
      "btnToggleTheme"
    ) as HTMLButtonElement | null;
    const btnLogoutFromMenu = document.getElementById(
      "btnLogoutFromMenu"
    ) as HTMLButtonElement | null;
    const btnClose = document.getElementById(
      "menuClose"
    ) as HTMLButtonElement | null;

    // ラベルは毎回更新
    updateThemeToggleLabel();

    // 初回だけイベント結線
    if (!menuBound) {
      btnToggle?.addEventListener("click", () => {
        toggleTheme();
        // 切替後にラベル更新
        updateThemeToggleLabel();
      });
      btnLogoutFromMenu?.addEventListener("click", async () => {
        try {
          await logout();
        } finally {
          authStore.userId = null;
          location.reload();
        }
      });
      btnClose?.addEventListener("click", () => dlg.close());
      menuBound = true;
    }

    if (!dlg.open) dlg.showModal();
  });

  const appTitle = document.getElementById("appTitle") as HTMLHeadingElement;
  appTitle?.addEventListener("click", () => {
    // タイトルクリックでページを更新
    location.reload();
  });
}

bindForms();
ensureSession();
