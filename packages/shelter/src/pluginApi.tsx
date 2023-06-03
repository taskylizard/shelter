import { isInited, storage } from "./storage";
import { createMutable } from "solid-js/store";
import { injectCss, ModalBody, ModalHeader, ModalRoot, openModal } from "shelter-ui";
import { getDispatcher, intercept as interceptFlux } from "./flux";
import { observe } from "./observer";
import { after, before, instead } from "spitroast";
import { getSettings, StoredPlugin } from "./plugins";
import { Repetition } from "./tsUtils";

export type ScopedUnpatches = Repetition<7, (() => void)[]>;

export const pluginStorages = storage("plugins-data");

function createStorage(pluginId: string): [Record<string, any>, () => void] {
  if (!isInited(pluginStorages))
    throw new Error("to keep data persistent, plugin storages must not be created until connected to IDB");

  const data = createMutable((pluginStorages[pluginId] ?? {}) as Record<string, any>);

  const flush = () => (pluginStorages[pluginId] = { ...data });

  return [
    new Proxy(data, {
      set(t, p, v, r) {
        queueMicrotask(flush);
        return Reflect.set(t, p, v, r);
      },
      deleteProperty(t, p) {
        queueMicrotask(flush);
        return Reflect.deleteProperty(t, p);
      },
    }),
    flush,
  ];
}

export function createShelterPluginEdition(pluginId: string, data: StoredPlugin) {
  const [store, flushStore] = createStorage(pluginId);

  const scopedUnpatches: ScopedUnpatches = [[], [], [], [], [], [], []];

  const interceptUnpatch = <T extends Function>(i: number, f: T): T =>
    ((...args) => {
      const res = f(...args);
      scopedUnpatches[i].push(res);
      return res;
    }) as any; // i give up with types

  /*const shelterPluginEdition =*/
  return [
    {
      ...window["shelter"],
      plugin: {
        store,
        flushStore,
        manifest: data.manifest,
        showSettings: () =>
          openModal((mprops) => (
            <ModalRoot>
              <ModalHeader close={mprops.close}>Settings - {data.manifest.name}</ModalHeader>
              <ModalBody>{getSettings(pluginId)({})}</ModalBody>
            </ModalRoot>
          )),
        scoped: {
          subscribe(type: string, cb: (payload: any) => void) {
            getDispatcher().then((d) => {
              d.subscribe(type, cb);
              scopedUnpatches[0].push(() => d.unsubscribe(type, cb));
            });
            return () => getDispatcher().then((d) => d.unsubscribe(type, cb));
          },
          intercept: interceptUnpatch(1, interceptFlux),
          observeDom: interceptUnpatch(2, observe),
          before: interceptUnpatch(3, before),
          after: interceptUnpatch(4, after),
          instead: interceptUnpatch(5, instead),
          injectCss: interceptUnpatch(6, injectCss),
        },
      },
    },
    scopedUnpatches,
  ] as const;
}
