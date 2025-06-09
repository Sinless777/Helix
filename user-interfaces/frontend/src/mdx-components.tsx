import type { MDXComponents } from "mdx/types";

// Define your fallback components here, if any
const defaultComponents: MDXComponents = {
  // Optional: 'h1': (props) => <h1 className="text-xl" {...props} />,
};

export function useMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return {
    ...defaultComponents,
    ...components,
  };
}
