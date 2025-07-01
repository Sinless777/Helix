import { ReactNode, ElementType } from "react";
import MapIcon from "@mui/icons-material/Map";

export interface NavItem {
  /** Unique key (used for rendering/list operations) */
  id: string;
  /** Display text */
  label: string;
  /** URL to navigate to (omit if this is a pure parent group) */
  href?: string;
  /** Nested items for multi-level menus */
  children?: NavItem[];
  /** Any React component (MUI icon, custom SVG, etc.) */
  icon?: ElementType; // <-------- You just need to import the icon component from MUI or your own library
  /** Opens link in new tab if true */
  external?: boolean;
  /** HTML target attribute (overrides `external`) */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** HTML rel attribute (e.g. "noopener noreferrer") */
  rel?: "noopener" | "noreferrer" | "nofollow" | "external" | string;
  /** Renders item in a disabled style/ignores clicks */
  disabled?: boolean;
  /** Small badge (e.g. "New", "Beta", count, etc.) */
  badge?: string | number | "alpha" | "beta" | "stable" | "";
  /** Optional item for nested navigation */
  items?: NavItem[];
}

export interface NavSection {
  /** Unique key for the section */
  id: string;
  /** Section heading */
  title: string;
  /** Top-level items under this heading */
  items: NavItem[];
}

/**
 * Example usage: you can now nest arbitrarily,
 * add icons, badges, disable links, open externals,
 * and customize per-item behavior.
 */
export const navSections: NavSection[] = [
  {
    id: "about",
    title: "About the Project",
    items: [
      {
        id: "overview",
        label: "Project Overview",
        href: "/Docs/About-The-Project/Project_Overview",
      },
      {
        id: "vision",
        label: "Grand Vision",
        href: "/Docs/About-The-Project/Grand_Vision",
        badge: "Beta",
        items: [
          {
            id: "introduction",
            label: "Introduction",
            href: "/Docs/About-The-Project/Grand_Vision/Introduction",
          },
          {
            id: "roadmap",
            label: "Roadmap",
            href: "/Docs/About-The-Project/Grand_Vision/Roadmap",
          },
          {
            id: "milestones",
            label: "Milestones",
            href: "/Docs/About-The-Project/Grand_Vision/Milestones",
          },
        ],
      },
    ],
  },
  {
    id: "setup",
    title: "Setup",
    items: [],
  },
  {
    id: "apps",
    title: "Application Overviews",
    items: [],
  },
  {
    id: "dev-docs",
    title: "Developer Documentation",
    items: [],
  },
  {
    id: "refs",
    title: "References",
    items: [
      {
        id: "citations",
        label: "Citations",
        href: "/Docs/About-The-Project/Citations",
        external: true,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
];
