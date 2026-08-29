import { config } from "../../package.json";
import { eventMatchesShortcut, isEditableTarget } from "../utils/hotkey";
import { TagDialogFactory } from "./tagDialog";

export class HotkeyFactory {
  private static readonly handlers = new Map<Window, EventListener>();

  static register(win: _ZoteroTypes.MainWindow): void {
    if (this.handlers.has(win)) return;

    const handler: EventListener = (rawEvent) => {
      const event = rawEvent as KeyboardEvent;
      if (
        event.repeat ||
        event.defaultPrevented ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const enabled = Zotero.Prefs.get(
        `${config.prefsPrefix}.hotkeyEnabled`,
        true,
      );
      const shortcut = Zotero.Prefs.get(
        `${config.prefsPrefix}.hotkey`,
        true,
      ) as string;
      if (!enabled || !shortcut || !eventMatchesShortcut(event, shortcut)) {
        return;
      }

      if (win.Zotero_Tabs.selectedType !== "library") return;
      const selectedItems = win.ZoteroPane.getSelectedItems();
      if (!selectedItems?.length) return;

      event.preventDefault();
      event.stopPropagation();
      void TagDialogFactory.showTagDialog();
    };

    win.addEventListener("keydown", handler);
    this.handlers.set(win, handler);
  }

  static unregister(win: Window): void {
    const handler = this.handlers.get(win);
    if (!handler) return;
    win.removeEventListener("keydown", handler);
    this.handlers.delete(win);
  }

  static unregisterAll(): void {
    for (const [win, handler] of this.handlers) {
      win.removeEventListener("keydown", handler);
    }
    this.handlers.clear();
  }
}
