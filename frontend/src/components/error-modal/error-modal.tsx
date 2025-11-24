import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  errorCode?: string;
  errorMessage?: string;
  onSubmitTicket?: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  errorCode,
  errorMessage = "Your request could not be submitted at this time.",
  onSubmitTicket,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="error-modal"
      PaperProps={{
        className: "error-modal__paper",
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        className="error-modal__close-button"
      >
        <CloseIcon />
      </IconButton>

      <DialogContent className="error-modal__content">
        <div className="error-modal__message">
          {errorMessage}
          {errorCode && (
            <div className="error-modal__code">{`Error Code: ${errorCode}`}</div>
          )}
        </div>

        {onSubmitTicket && (
          <div className="error-modal__help-text">
            Please try again later or submit a support ticket and include this
            code so our team can investigate. Items in your cart will be here
            when you come back.
          </div>
        )}
      </DialogContent>

      <DialogActions className="error-modal__actions">
        <Button
          onClick={onClose}
          variant="outlined"
          className="error-modal__button error-modal__button--close"
        >
          CLOSE
        </Button>
        {onSubmitTicket && (
          <Button
            onClick={onSubmitTicket}
            variant="contained"
            className="error-modal__button error-modal__button--submit"
          >
            Submit a Support Ticket
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
