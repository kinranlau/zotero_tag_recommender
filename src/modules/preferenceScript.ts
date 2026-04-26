import { config } from "../../package.json";

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
  bindPrefEvents();
}

function bindPrefEvents() {
  // Event bindings can be added here if needed for dynamic behavior
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
