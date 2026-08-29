export const SUGGESTED_HOTKEY = "accel,t";

const MODIFIER_KEYS = new Set(["Alt", "Control", "Meta", "Shift"]);

const KNOWN_ZOTERO_SHORTCUTS = new Set([
  "accel,a",
  "accel,c",
  "accel,f",
  "accel,g",
  "accel,p",
  "accel,v",
  "accel,x",
  "accel,y",
  "accel,z",
  "accel,shift,a",
  "accel,shift,c",
  "accel,shift,f",
  "accel,shift,i",
  "accel,shift,k",
  "accel,shift,l",
  "accel,shift,n",
  "accel,shift,o",
  "accel,shift,r",
  "accel,shift,s",
  "accel,shift,t",
]);

function normalizeKey(key: string): string {
  if (key === " ") return "space";
  return key.toLocaleLowerCase();
}

export function shortcutFromEvent(event: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(event.key)) return null;

  const modifiers: string[] = [];
  const primaryModifier = Zotero.isMac ? event.metaKey : event.ctrlKey;
  if (primaryModifier) modifiers.push("accel");
  if (event.shiftKey) modifiers.push("shift");
  if (Zotero.isMac && event.ctrlKey) modifiers.push("control");
  if (!Zotero.isMac && event.metaKey) modifiers.push("meta");
  if (event.altKey) modifiers.push("alt");

  // A shortcut without Ctrl/Cmd/Alt/Meta would interfere with normal typing.
  if (!primaryModifier && !event.altKey && !event.metaKey && !event.ctrlKey) {
    return null;
  }

  return [...modifiers, normalizeKey(event.key)].join(",");
}

export function eventMatchesShortcut(
  event: KeyboardEvent,
  shortcut: string,
): boolean {
  const recorded = shortcutFromEvent(event);
  return recorded !== null && recorded === shortcut.toLocaleLowerCase();
}

export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split(",").filter(Boolean);
  const formatted = parts.map((part) => {
    if (Zotero.isMac) {
      if (part === "accel" || part === "meta") return "⌘";
      if (part === "control") return "⌃";
      if (part === "alt") return "⌥";
      if (part === "shift") return "⇧";
    } else {
      if (part === "accel" || part === "control") return "Ctrl";
      if (part === "meta") return "Win";
      if (part === "alt") return "Alt";
      if (part === "shift") return "Shift";
    }
    return part.length === 1 ? part.toLocaleUpperCase() : part;
  });
  return formatted.join(Zotero.isMac ? "" : "+");
}

export function isKnownZoteroShortcut(shortcut: string): boolean {
  return KNOWN_ZOTERO_SHORTCUTS.has(shortcut.toLocaleLowerCase());
}

export function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  const editableNames = new Set([
    "input",
    "textarea",
    "select",
    "textbox",
    "menulist",
  ]);
  return (
    editableNames.has(element.localName) ||
    element.isContentEditable ||
    element.getAttribute?.("role") === "textbox" ||
    Boolean(
      element.closest?.(
        "[contenteditable='true'], [role='textbox'], input, textarea, select, textbox, menulist",
      ),
    )
  );
}
