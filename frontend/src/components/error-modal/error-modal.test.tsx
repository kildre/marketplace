import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { ErrorModal } from "./error-modal";

describe("ErrorModal", () => {
  it("renders when open is true", () => {
    render(
      <ErrorModal
        open={true}
        onClose={vi.fn()}
        errorCode="404"
        errorMessage="Test error message"
      />
    );

    expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    expect(screen.getByText("Error Code: 404")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <ErrorModal
        open={false}
        onClose={vi.fn()}
        errorCode="404"
        errorMessage="Test error message"
      />
    );

    expect(screen.queryByText(/Test error message/i)).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <ErrorModal
        open={true}
        onClose={onCloseMock}
        errorCode="500"
        errorMessage="Server error"
      />
    );

    const closeButton = screen.getByLabelText("close");
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when CLOSE button is clicked", async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <ErrorModal
        open={true}
        onClose={onCloseMock}
        errorCode="400"
        errorMessage="Bad request"
      />
    );

    const closeButton = screen.getByText("CLOSE");
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmitTicket when submit ticket button is clicked", async () => {
    const user = userEvent.setup();
    const onSubmitTicketMock = vi.fn();

    render(
      <ErrorModal
        open={true}
        onClose={vi.fn()}
        errorCode="403"
        errorMessage="Forbidden"
        onSubmitTicket={onSubmitTicketMock}
      />
    );

    const submitButton = screen.getByText("Submit a Support Ticket");
    await user.click(submitButton);

    expect(onSubmitTicketMock).toHaveBeenCalledTimes(1);
  });

  it("renders help text when onSubmitTicket is provided", () => {
    render(
      <ErrorModal
        open={true}
        onClose={vi.fn()}
        errorCode="403"
        errorMessage="Forbidden"
        onSubmitTicket={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Please try again later or submit a support ticket/i)
    ).toBeInTheDocument();
  });

  it("renders with default error message when no message is provided", () => {
    render(<ErrorModal open={true} onClose={vi.fn()} errorCode="500" />);

    expect(
      screen.getByText(/Your request could not be submitted at this time/i)
    ).toBeInTheDocument();
  });

  it("does not render error code when not provided", () => {
    render(
      <ErrorModal
        open={true}
        onClose={vi.fn()}
        errorMessage="Test error without code"
      />
    );

    // Check that the code container doesn't exist
    const codeElement = screen.queryByText(/^\{.*\}$/);
    expect(codeElement).not.toBeInTheDocument();
  });

  it("does not render Submit a Support Ticket button when onSubmitTicket is not provided", () => {
    render(
      <ErrorModal
        open={true}
        onClose={vi.fn()}
        errorCode="404"
        errorMessage="Not found"
      />
    );

    expect(
      screen.queryByText("Submit a Support Ticket")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/submit a support ticket/i)
    ).not.toBeInTheDocument();
  });

  it("renders help text with cart preservation message", () => {
    render(
      <ErrorModal
        open={true}
        onClose={vi.fn()}
        errorCode="500"
        errorMessage="Server error"
        onSubmitTicket={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Items in your cart will be here when you come back/i)
    ).toBeInTheDocument();
  });
});
