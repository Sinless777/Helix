"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Divider,
} from "@mui/material";
import { navSections } from "../../constants/Docs/navigation";

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'background.paper',
        overflowY: 'auto',
      }}
    >
      <List
        component="nav"
        subheader={
          <ListSubheader component="div" disableSticky>
            Documentation
          </ListSubheader>
        }
      >
        {navSections.map((section, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ pl: 1, mb: 1, fontWeight: 600 }}>
              {section.title}
            </Typography>
            {section.items.map((item, j) => {
              const selected = pathname === item.href;
              return (
                <ListItemButton
                  key={j}
                  component={Link}
                  href={item.href}
                  selected={selected}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
            {i < navSections.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}
      </List>
    </Box>
  );
}
