import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc"; // for RSC support

const DOCS_DIR = path.join(process.cwd(), "Docs");

export async function getDoc(slugSegments: string[]) {
  const mdxPath = path.join(DOCS_DIR, ...slugSegments) + ".mdx";

  if (!fs.existsSync(mdxPath)) return null;

  const source = fs.readFileSync(mdxPath, "utf-8");
  const compiled = await compileMDX({ source });

  return compiled;
}
