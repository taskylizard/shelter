// @ts-check

import { readFile, writeFile } from "fs/promises";
import { build } from "esbuild";

await build({
  entryPoints: ["dist/src/index.js"],
  bundle: true,
  outfile: "dist/clibundle.cjs",
  external: [
    // literally everything except from solidjs
    "@babel/core",
    "@babel/preset-typescript",
    "lightningcss",
    "rolldown",
    "chokidar",
    "esbuild",
    "esbuild-sass-plugin-ysink",
    "postcss",
    "postcss-modules",
    "ws",
    // node things esbuild doesn't know about
    "readline/promises",
  ],
  platform: "node",
});

for (const f of ["dist/src/index.js", "dist/clibundle.cjs"])
  await writeFile(f, "#!/usr/bin/env node\n" + (await readFile(f)).toString());
