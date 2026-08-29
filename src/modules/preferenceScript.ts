import { config } from "../../package.json";
import {
  formatShortcut,
  isKnownZoteroShortcut,
  shortcutFromEvent,
  SUGGESTED_HOTKEY,
} from "../utils/hotkey";

export async function registerPrefsScripts(_window: Window) {
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
      columns: [],
      rows: [],
    };
  } else {
    addon.data.prefs.window = _window;
  }
  migrateLegacyDeepSeekModelPref();
  bindPrefEvents(_window);
}

function bindPrefEvents(win: Window) {
  const doc = win.document;
  const idPrefix = `zotero-prefpane-${config.addonRef}-`;
  const enabledCheckbox = doc.getElementById(
    `${idPrefix}hotkeyEnabled`,
  ) as HTMLInputElement | null;
  const shortcutInput = doc.getElementById(
    `${idPrefix}hotkey`,
  ) as HTMLInputElement | null;
  const suggestedButton = doc.getElementById(
    `${idPrefix}hotkeySuggested`,
  ) as HTMLElement | null;
  const clearButton = doc.getElementById(
    `${idPrefix}hotkeyClear`,
  ) as HTMLElement | null;
  const status = doc.getElementById(
    `${idPrefix}hotkeyStatus`,
  ) as HTMLElement | null;

  if (
    !enabledCheckbox ||
    !shortcutInput ||
    !suggestedButton ||
    !clearButton ||
    !status ||
    shortcutInput.dataset.hotkeyBound === "true"
  ) {
    return;
  }
  shortcutInput.dataset.hotkeyBound = "true";

  const hotkeyPref = `${config.prefsPrefix}.hotkey`;
  const getShortcut = () =>
    (Zotero.Prefs.get(hotkeyPref, true) as string) || "";
  const formatMessage = (
    id: string,
    args?: Record<string, string | number | null>,
  ) =>
    doc.l10n?.formatValue(`${config.addonRef}-${id}`, args) ??
    Promise.resolve(id);

  const updateStatus = async (shortcut = getShortcut()) => {
    if (shortcut && isKnownZoteroShortcut(shortcut)) {
      status.textContent = await formatMessage("pref-hotkey-conflict", {
        shortcut: formatShortcut(shortcut),
      });
      status.style.color = "#b45309";
      return;
    }
    status.textContent = await formatMessage("pref-hotkey-suggested", {
      shortcut: formatShortcut(SUGGESTED_HOTKEY),
    });
    status.style.color = "#666";
  };

  const render = () => {
    const shortcut = getShortcut();
    shortcutInput.value = shortcut ? formatShortcut(shortcut) : "";
    shortcutInput.disabled = !enabledCheckbox.checked;
    void updateStatus(shortcut);
  };

  enabledCheckbox.addEventListener("command", () => win.setTimeout(render, 0));
  enabledCheckbox.addEventListener("change", () => win.setTimeout(render, 0));
  shortcutInput.addEventListener("focus", async () => {
    status.textContent = await formatMessage("pref-hotkey-recording");
    status.style.color = "#666";
    shortcutInput.select();
  });
  shortcutInput.addEventListener("blur", () => void updateStatus());
  shortcutInput.addEventListener("keydown", async (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Escape") {
      shortcutInput.blur();
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      Zotero.Prefs.set(hotkeyPref, "", true);
      render();
      return;
    }

    const shortcut = shortcutFromEvent(event);
    if (!shortcut) {
      status.textContent = await formatMessage("pref-hotkey-invalid");
      status.style.color = "#b45309";
      return;
    }

    Zotero.Prefs.set(hotkeyPref, shortcut, true);
    render();
  });
  suggestedButton.addEventListener("command", () => {
    Zotero.Prefs.set(hotkeyPref, SUGGESTED_HOTKEY, true);
    render();
  });
  clearButton.addEventListener("command", () => {
    Zotero.Prefs.set(hotkeyPref, "", true);
    render();
  });

  render();
}

function migrateLegacyDeepSeekModelPref() {
  const providerPrefKey = `${config.prefsPrefix}.apiProvider`;
  const modelPrefKey = `${config.prefsPrefix}.apiModel`;
  const provider = Zotero.Prefs.get(providerPrefKey, true);
  const model = Zotero.Prefs.get(modelPrefKey, true);
  if (provider === "deepseek" && model === "deepseek-chat") {
    Zotero.Prefs.set(modelPrefKey, "deepseek-v4-flash", true);
  }
}
