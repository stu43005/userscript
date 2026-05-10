import * as idbModule from "idb";

declare global {
  const idb: typeof idbModule;
}

export {};
