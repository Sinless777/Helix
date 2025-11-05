'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  type DialogProps,
} from '@mui/material';
import { type ReactNode } from 'react';

export type PrimitiveModalProps = {
  /** Whether the modal is open */
  open: boolean;

  /** Called when modal closes (either backdrop click or close button) */
  onClose: () => void;

  /** Optional onClose passthrough for <Dialog> */
  onDialogClose?: DialogProps['onClose'];

  /** Optional modal title (string or node) */
  title?: ReactNode;

  /** Optional short description below title */
  description?: ReactNode;

  /** Optional footer actions (buttons, etc.) */
  actions?: ReactNode;

  /** Main content of the modal */
  children: ReactNode;

  /** Show or hide the “X” close button (defaults to true) */
  showCloseButton?: boolean;

  /** Adds dividers between title/content/actions (defaults to false) */
  dividers?: boolean;
} & Omit<DialogProps, 'open' | 'onClose' | 'children'>;

export function PrimitiveModal({
  open,
  onClose,
  onDialogClose,
  title,
  description,
  actions,
  children,
  showCloseButton = true,
  dividers = false,
  maxWidth = 'sm',
  fullWidth = true,
  scroll = 'paper',
  ...dialogProps
}: PrimitiveModalProps) {
  const handleDialogClose: DialogProps['onClose'] = (event, reason) => {
    if (onDialogClose) onDialogClose(event, reason);
    onClose();
  };

  const renderHeader = () => {
    if (!title && !description && !showCloseButton) return null;

    return (
      <DialogTitle sx={{ pb: description ? 0.5 : 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Stack spacing={0.5} flexGrow={1} overflow="hidden">
            {typeof title === 'string' ? (
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 600,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
            ) : (
              title
            )}
            {description &&
              (typeof description === 'string' ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.4,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {description}
                </Typography>
              ) : (
                description
              ))}
          </Stack>

          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              edge="end"
              sx={{
                ml: 1,
                mt: 0.25,
                color: 'text.secondary',
                '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll={scroll}
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: 'none',
          bgcolor: 'background.paper',
          boxShadow: 24,
          overflow: 'hidden',
        },
      }}
      {...dialogProps}
    >
      {renderHeader()}

      <DialogContent
        dividers={dividers}
        sx={{
          px: 3,
          py: 2,
          typography: 'body1',
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: dividers ? 'background.default' : 'transparent',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

export default PrimitiveModal;
