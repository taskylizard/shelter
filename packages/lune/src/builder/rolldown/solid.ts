import { transformAsync, type TransformOptions } from "@babel/core";
import ts from "@babel/preset-typescript";
import solid from "babel-preset-solid";
import type { Plugin } from "rolldown";
import { OutputType, transform } from "../../../../oxc-jsx-dom-expressions";

function getExtension(filename: string): string {
  const index = filename.lastIndexOf(".");
  return index < 0 ? "" : filename.substring(index).replace(/\?.+$/, "");
}

export const SolidPlugin = (): Plugin => {
  let projectRoot = process.cwd();
  return {
    name: "lune:rolldown:solid-js",
    transform: {
      // Handle only .tsx and .jsx files
      filter: { id: /(\.tsx|\.jsx)$/ },
      handler: async (source, id) => {
        const currentFileExtension = getExtension(id);

        id = id.replace(/\?.+$/, "");

        const code = transform(source, {
          generate: OutputType.Dom,
          hydratable: true,
          contextToCustomElements: true,
          wrapConditionals: true,
          validate: true,
          builtIns: [
            "For",
            "Show",
            "Switch",
            "Match",
            "Suspense",
            "SuspenseList",
            "Portal",
            "Index",
            "Dynamic",
            "ErrorBoundary",
          ],
        });

        return { code: code ?? "" };
      },
    },
  };
};
