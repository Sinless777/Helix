"use client";

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  Link as MuiLink,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { Citations, CitationPageData, APACitation } from "@frontend/constants";

export default function CitationsPage() {
  const data: CitationPageData = Citations;

  // Group citations by category
  const grouped = data.citations.reduce(
    (acc: Record<string, APACitation[]>, cit) => {
      const key = cit.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(cit);
      return acc;
    },
    {},
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ justifyContent: "center", textAlign: "center" }}
      >
        {data.title}
      </Typography>
      {data.description && (
        <Typography variant="subtitle1" gutterBottom>
          {data.description}
        </Typography>
      )}
      <Divider sx={{ my: 2 }} />

      {Object.entries(grouped).map(([category, citations]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ textTransform: "capitalize", mb: 1 }}>
            {category}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {citations.map((c, idx) => {
              const parts: React.ReactNode[] = [];

              parts.push(
                <span key="author">
                  <strong>{c.author}</strong>
                </span>,
              );
              parts.push(<span key="year"> ({c.year}). </span>);
              parts.push(
                <span key="title">
                  <em>{c.title}</em>.
                </span>,
              );
              parts.push(<span key="source">{c.source}</span>);
              if (c.volume)
                parts.push(<span key="volume">{`, ${c.volume}`}</span>);
              if (c.issue) parts.push(<span key="issue">({c.issue})</span>);
              if (c.pages)
                parts.push(<span key="pages">{`, pp. ${c.pages}`}</span>);
              parts.push(<span key="period">.</span>);

              return (
                <ListItem
                  key={idx}
                  sx={{ display: "list-item", pl: 4, fontSize: "1.25rem" }}
                >
                  <Typography variant="body1">
                    {parts}
                    {c.url && (
                      <MuiLink
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        component={Link}
                        sx={{ ml: 1 }}
                      >
                        [Link]
                      </MuiLink>
                    )}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}
