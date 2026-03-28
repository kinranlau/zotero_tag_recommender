import { getLocaleID, getString } from "../utils/locale";
import { TagDialogFactory } from "./tagDialog";

function example(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling example ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(`Error in example ${target.name}.${String(propertyKey)}`, e);
      throw e;
    }
  };
  return descriptor;
}

export class BasicExampleFactory {
  @example
  static registerPrefs() {
    Zotero.PreferencePanes.register({
      pluginID: addon.data.config.addonID,
      src: rootURI + "content/preferences.xhtml",
      label: getString("prefs-title"),
      image: `chrome://${addon.data.config.addonRef}/content/icons/favicon.png`,
    });
  }
}

export class UIExampleFactory {
  @example
  static registerStyleSheet(win: Window) {
    const styles = ztoolkit.UI.createElement(win.document, "style", {
      properties: {
        innerHTML: `
          @import url("chrome://${addon.data.config.addonRef}/content/zotero.css");
        `,
      },
    });
    win.document.documentElement?.appendChild(styles);
  }

  @example
  static registerRightClickMenuItem() {
    const menuIcon = `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`;
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "zotero-itemmenu-tagrecommender-suggest",
      label: getString("menuitem-suggest-tags"),
      commandListener: (ev) => {
        TagDialogFactory.showTagDialog();
      },
      icon: menuIcon,
    });
  }

  @example
  static registerRightClickMenuPopup(win: Window) {
    // Removed - not needed for tag recommender
  }
}
