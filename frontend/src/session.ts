import { authStore, login, register, me } from "./auth.js";
import { loadTemplates, getTemplate } from "./templates.js";
import { logout } from "./auth.js";

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
    const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
    if (btnLogout) btnLogout.style.display = "none";
    board.style.display = "none";
    result.style.display = "none";
    // authBoardsにログイン/登録ボードをマウント
    mountAuthBoards();
  } else {
    auth.style.display = "none";
    header.style.display = "block";
    const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
    if (btnLogout) btnLogout.style.display = "inline-block";
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
  const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
  btnLogout?.addEventListener("click", async () => {
    try {
      await logout();
    } finally {
      authStore.userId = null;
      location.reload();
    }
  });

  const appTitle = document.getElementById("appTitle") as HTMLHeadingElement;
  appTitle?.addEventListener("click", () => {
    // タイトルクリックでページを更新
    location.reload();
  });
}

bindForms();
ensureSession();
