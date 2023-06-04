import { ShelterApi } from "shelter/src/windowApi";
import { ShelterPluginEdition } from "shelter/src/pluginApi";

export { ShelterApi, ShelterPluginEdition };

export * from "shelter/src/types";

declare global {
  // i figure that mostly these will be used to write plugins, so this is more useful.
  const shelter: ShelterPluginEdition;

  // noinspection JSUnusedGlobalSymbols
  interface Window {
    shelter: ShelterPluginEdition;
  }
}
