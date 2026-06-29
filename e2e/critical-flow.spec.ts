import { expect, test } from "@playwright/test";

const CREDENTIALS = {
  email: "john@mail.com",
  password: "changeme",
} as const;

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_STORAGE_KEY = "pagaleve-auth";

async function clearSession(page: import("@playwright/test").Page) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function login(page: import("@playwright/test").Page) {
  await page.getByLabel("E-mail").fill(CREDENTIALS.email);
  await page.getByLabel("Senha").fill(CREDENTIALS.password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("user-greeting")).toContainText("Olá", {
    timeout: 10_000,
  });
}

async function expectAuthCookiePresent(page: import("@playwright/test").Page) {
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((cookie) => cookie.name === AUTH_COOKIE_NAME);

  expect(authCookie).toBeDefined();
  expect(authCookie?.value).toBeTruthy();
}

async function expectAuthCookieAbsent(page: import("@playwright/test").Page) {
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((cookie) => cookie.name === AUTH_COOKIE_NAME);

  expect(authCookie?.value ?? "").toBe("");
}

async function expectNoTokensInLocalStorage(
  page: import("@playwright/test").Page,
) {
  const persistedAuth = await page.evaluate((storageKey) => {
    return localStorage.getItem(storageKey);
  }, AUTH_STORAGE_KEY);

  if (persistedAuth) {
    expect(persistedAuth).not.toContain("accessToken");
    expect(persistedAuth).not.toContain("refreshToken");
    expect(persistedAuth).not.toMatch(/"token"\s*:/);
  }
}

test.describe("Fluxo crítico da mini loja", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test("a-k: auth, catálogo, busca, filtro, detalhe, carrinho, persistência e logout", async ({
    page,
  }) => {
    // a) Rota protegida sem login → /login
    await page.goto("/");
    await expect(page).toHaveURL(/\/login(\?redirect=%2F)?/);
    await expect(page.getByTestId("login-form")).toBeVisible();

    // b) Login
    await login(page);
    await expectAuthCookiePresent(page);
    await expectNoTokensInLocalStorage(page);
    await expect(page.getByTestId("user-greeting")).toContainText("Olá");

    // c) Catálogo carregado
    await expect(
      page.getByRole("heading", { name: "Catálogo de produtos" }),
    ).toBeVisible();
    await expect(page.getByTestId("product-catalog")).toBeVisible();
    await expect(page.getByTestId("product-card").first()).toBeVisible({
      timeout: 20_000,
    });

    const initialProductCount = await page.getByTestId("product-card").count();
    expect(initialProductCount).toBeGreaterThan(0);

    // d) Busca com debounce
    await page.getByTestId("product-search").fill("Classic");
    await expect(page).toHaveURL(/search=Classic/, { timeout: 5_000 });
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    const searchedCount = await page.getByTestId("product-card").count();
    expect(searchedCount).toBeGreaterThan(0);
    expect(searchedCount).toBeLessThanOrEqual(initialProductCount);

    // e) Filtro por categoria via query param
    await page.getByTestId("product-search").fill("");
    await expect(page).not.toHaveURL(/search=/, { timeout: 5_000 });
    await page.getByTestId("category-1").click();
    await expect(page).toHaveURL(/\?category=1/);
    await expect(page.getByTestId("product-card").first()).toBeVisible();

    // f) Detalhe do produto
    const firstProduct = page.getByTestId("product-card").first();
    const productLink = firstProduct.locator("a");
    await productLink.click();
    await expect(page).toHaveURL(/\/products\/\d+/);
    await expect(page.getByTestId("product-detail")).toBeVisible();
    await expect(page.getByTestId("product-title")).not.toBeEmpty();
    await expect(page.getByTestId("product-price")).not.toBeEmpty();

    const productTitle = await page.getByTestId("product-title").textContent();

    // g) Adicionar ao carrinho
    await page.getByTestId("add-to-cart").click();
    await page.getByTestId("cart-link").click();
    await expect(page).toHaveURL("/cart");
    await expect(page.getByTestId("cart-view")).toBeVisible();
    await expect(page.getByTestId("cart-item")).toHaveCount(1);
    if (productTitle) {
      await expect(page.getByTestId("cart-item")).toContainText(productTitle);
    }

    const totalBefore = await page.getByTestId("cart-total").textContent();

    // h) Alterar quantidade
    const quantityInput = page.getByTestId("cart-quantity").first();
    await quantityInput.fill("3");
    await expect(quantityInput).toHaveValue("3");
    await expect(page.getByTestId("cart-total").textContent()).not.toEqual(
      totalBefore,
    );

    // i) Persistência após refresh (sessão via cookie + carrinho via localStorage)
    await page.reload();
    await expect(page.getByTestId("cart-item")).toHaveCount(1);
    await expect(page.getByTestId("cart-quantity").first()).toHaveValue("3");
    await expect(page.getByTestId("user-greeting")).toContainText("Olá");
    await expectAuthCookiePresent(page);
    await expectNoTokensInLocalStorage(page);

    // j) Remover produto
    await page.getByTestId("cart-remove").first().click();
    await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();

    // k) Logout
    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL("/login");
    await expectAuthCookieAbsent(page);
    await expectNoTokensInLocalStorage(page);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("regressão auth: redirect sem cookie, botão Login e sessão restaurada do cookie", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login(\?redirect=%2F)?/);

    await login(page);
    await expectAuthCookiePresent(page);
    await expectNoTokensInLocalStorage(page);

    await page.evaluate((storageKey) => {
      localStorage.removeItem(storageKey);
    }, AUTH_STORAGE_KEY);

    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("user-greeting")).toContainText("Olá", {
      timeout: 10_000,
    });
    await expectNoTokensInLocalStorage(page);

    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL("/login");
    await expectAuthCookieAbsent(page);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login(\?redirect=%2F)?/);
    await expect(page.getByTestId("login-button")).toBeVisible();
    await page.getByTestId("login-button").click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
  });
});
