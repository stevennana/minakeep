import "dotenv/config";

import { expect, test, type Page } from "@playwright/test";

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

function getOwnerCredentials() {
  return {
    password: process.env.OWNER_PASSWORD ?? "password",
    username: process.env.OWNER_USERNAME ?? "owner"
  };
}

async function signIn(page: Page) {
  const { username, password } = getOwnerCredentials();

  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function setEditorSelection(page: Page, start: number, end: number) {
  await page.evaluate(
    ({ nextEnd, nextStart }) => {
      const textarea = document.querySelector<HTMLTextAreaElement>("[data-testid='note-markdown-input']");

      if (!textarea) {
        throw new Error("Expected note markdown textarea to exist.");
      }

      textarea.focus();
      textarea.setSelectionRange(nextStart, nextEnd);
      textarea.dispatchEvent(new Event("select", { bubbles: true }));
    },
    { nextEnd: end, nextStart: start }
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  expect(hasOverflow).toBe(false);
}

async function expectAccessibleStructure(page: Page) {
  const audit = await page.evaluate(() => {
    const issues: string[] = [];

    const getLabelText = (element: Element) => {
      const ariaLabel = element.getAttribute("aria-label")?.trim();
      if (ariaLabel) {
        return ariaLabel;
      }

      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
          .join(" ")
          .trim();

        if (text) {
          return text;
        }
      }

      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        const label = element.labels?.[0]?.textContent?.trim();

        if (label) {
          return label;
        }
      }

      return element.textContent?.trim() ?? "";
    };

    const interactive = document.querySelectorAll("a[href], button, input:not([type='hidden']), textarea, select");

    interactive.forEach((element) => {
      if (!getLabelText(element)) {
        issues.push(`unnamed:${element.tagName.toLowerCase()}`);
      }
    });

    return {
      h1Count: document.querySelectorAll("h1").length,
      issues,
      lang: document.documentElement.lang,
      mainCount: document.querySelectorAll("main").length
    };
  });

  expect(audit.lang).toBe("en");
  expect(audit.mainCount).toBe(1);
  expect(audit.h1Count).toBeGreaterThan(0);
  expect(audit.issues).toEqual([]);
}

test("@ui-note-math desktop workbench renders inline and block math from raw markdown", async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await signIn(page);
  await page.goto("/app/notes/new");

  const editor = page.getByTestId("note-markdown-input");
  const preview = page.getByTestId("note-markdown-preview");
  const toolbar = page.getByTestId("note-editor-toolbar");

  await page.getByRole("textbox", { name: "Title" }).fill("Math note");
  await expect(toolbar.getByRole("button", { name: "Inline math markdown" })).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Block math markdown" })).toBeVisible();

  await editor.fill("E = mc^2");
  await setEditorSelection(page, 0, 8);
  await toolbar.getByRole("button", { name: "Inline math markdown" }).click();
  await expect(editor).toHaveValue("$E = mc^2$");
  await expect(preview.locator(".katex")).toHaveCount(1);

  await editor.fill("x^2 + y^2 = z^2");
  await setEditorSelection(page, 0, 15);
  await toolbar.getByRole("button", { name: "Block math markdown" }).click();
  await expect(editor).toHaveValue("$$\nx^2 + y^2 = z^2\n$$");
  await expect(preview.locator(".katex-display")).toHaveCount(1);
  await expect(preview).not.toContainText("$$");

  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-math-desktop.png", {
    animations: "disabled"
  });
});

test("@ui-note-math mobile preview keeps rendered math readable without overflow", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await signIn(page);
  await page.goto("/app/notes/new");

  const editor = page.getByTestId("note-markdown-input");
  const toolbar = page.getByTestId("note-editor-toolbar");
  const modeSwitcher = page.getByTestId("note-editor-mode-switcher");
  const previewPane = page.getByTestId("note-editor-preview-pane");

  await page.getByRole("textbox", { name: "Title" }).fill("Mobile math note");
  await editor.fill("a^2 + b^2 = c^2");
  await setEditorSelection(page, 0, 15);
  await toolbar.getByRole("button", { name: "Block math markdown" }).click();
  await modeSwitcher.getByRole("button", { name: "Preview" }).click();

  await expect(previewPane).toBeVisible();
  await expect(previewPane.locator(".katex-display")).toHaveCount(1);
  await expect(previewPane).not.toContainText("$$");
  await expectAccessibleStructure(page);
  await expectNoHorizontalOverflow(page);

  await expect(page.locator(".note-editor-shell")).toHaveScreenshot("ui-note-math-mobile.png", {
    animations: "disabled"
  });
});
