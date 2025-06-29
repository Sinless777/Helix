import React from "react";
import NextLink from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Button,
  List,
  ListItem,
  Skeleton,
  useTheme,
} from "@mui/material";

export interface ListItemProps {
  text: string;
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  role?: string;
  detailedDescription?: string;
  icon?: React.ReactNode;
  image?: string;
}

export interface CardProps {
  title: string;
  description?: string;
  listItems?: ListItemProps[];
  image?: string;
  link?: string;
  buttonText?: string;
  quote?: string;
  aspectRatio?: string; // e.g. "16/9" or "4/3"
  sx?: object;
}

export const HelixCard: React.FC<CardProps> = ({
  title,
  description,
  listItems,
  image,
  link,
  buttonText = "Read more",
  quote,
  aspectRatio = "16/9",
  sx,
}) => {
  const theme = useTheme();
  const [imgLoaded, setImgLoaded] = React.useState(false);

  // Calculate padding-bottom percentage from aspect ratio
  const [w, h] = aspectRatio.split("/").map(Number);
  const pb = w && h ? `${(h / w) * 100}%` : "56.25%";

  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
        ...sx,
      }}
    >
      <CardActionArea
        component={link?.startsWith("/") ? NextLink : "a"}
        href={link || '#'}
        target={link && !link.startsWith("/") ? "_blank" : undefined}
        rel={link && !link.startsWith("/") ? "noopener noreferrer" : undefined}
        sx={{ flexGrow: 1, textDecoration: 'none' }}
      >
        {image && (
          <Box
            sx={{ position: "relative", width: "100%", pb, overflow: "hidden" }}
          >
            {!imgLoaded && <Skeleton variant="rectangular" width="100%" height="100%" />}
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width:600px) 100vw, 33vw"
              style={{ objectFit: "contain", padding: theme.spacing(2) }}
              onLoadingComplete={() => setImgLoaded(true)}
            />
          </Box>
        )}

        <CardContent sx={{ p: theme.spacing(2) }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
          {quote && (
            <Typography
              variant="body1"
              align="center"
              sx={{ fontStyle: "italic", fontFamily: theme.typography.fontFamily }}
              color="secondary.main"
              gutterBottom
            >
              “{quote}”
            </Typography>
          )}

          {listItems && listItems.length > 0 ? (
            <List disablePadding sx={{ maxHeight: theme.spacing(21), overflowY: "auto" }}>
              {listItems.map((item, idx) => (
                <ListItem key={idx} disableGutters sx={{ display: "list-item", justifyContent: "center", py: 0 }}>
                  <Button
                    component="a"
                    href={item.href}
                    target={item.target || "_blank"}
                    rel="noopener noreferrer"
                    variant="text"
                    sx={{
                      color: "secondary.main",
                      textTransform: "none",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {item.icon && <Box mr={1}>{item.icon}</Box>}
                    {item.text}
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : description ? (
            <Typography variant="body2" color="secondary.main" align="center">
              {description}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              More details coming soon.
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      {link && (
        <Box sx={{ p: theme.spacing(2), textAlign: "center" }}>
          <Button
            component={link.startsWith("/") ? NextLink : "a"}
            href={link}
            target={link.startsWith("/") ? undefined : "_blank"}
            rel={link.startsWith("/") ? undefined : "noopener noreferrer"}
            variant="contained"
            color={link.startsWith("/") ? "primary" : undefined}
            sx={
              link.startsWith("/")
                ? {}
                : {
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.getContrastText(theme.palette.secondary.main),
                    fontFamily: theme.typography.fontFamily,
                  }
            }
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default HelixCard;
