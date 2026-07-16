import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiService } from "../../services/apiService";
import { ChatWidget } from "./ChatWidget";

vi.mock("../../services/apiService", () => ({
  ApiService: {
    sendChatMessage: vi.fn(),
    clearChatConversation: vi.fn(),
  },
}));

describe("ChatWidget", () => {
  const mockSendChatMessage = vi.mocked(ApiService.sendChatMessage);
  const mockClearChatConversation = vi.mocked(
    ApiService.clearChatConversation
  );

  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("opens the assistant drawer with suggested prompts", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    expect(
      screen.queryByRole("dialog", { name: /marketplace assistant/i })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /open marketplace assistant/i })
    );

    expect(
      screen.getByRole("dialog", { name: /marketplace assistant/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Which products support data visualization?")
    ).toBeInTheDocument();
  });

  it("expands and collapses the assistant drawer", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(
      screen.getByRole("button", { name: /open marketplace assistant/i })
    );

    const dialog = screen.getByRole("dialog", {
      name: /marketplace assistant/i,
    });
    expect(dialog).not.toHaveClass("chat-widget__drawer--expanded");

    await user.click(
      screen.getByRole("button", { name: /expand marketplace assistant/i })
    );

    expect(dialog).toHaveClass("chat-widget__drawer--expanded");
    expect(
      screen.getByRole("button", { name: /collapse marketplace assistant/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /collapse marketplace assistant/i })
    );

    expect(dialog).not.toHaveClass("chat-widget__drawer--expanded");
  });

  it("sends prompts to the backend and renders answer metadata", async () => {
    const user = userEvent.setup();
    mockSendChatMessage.mockResolvedValueOnce({
      answer: "**Tableau** is a strong dashboard option.",
      conversationId: "conversation-123",
      citations: [
        {
          title: "Catalog Source",
          url: "https://example.test/source",
          snippet: "Tableau is listed as a visualization product.",
        },
      ],
      products: [
        {
          id: 7,
          name: "Tableau Catalog",
          type: "License Based",
          description: "Interactive data visualization software.",
        },
      ],
    });

    render(<ChatWidget />);

    await user.click(
      screen.getByRole("button", { name: /open marketplace assistant/i })
    );
    await user.type(
      screen.getByPlaceholderText("Ask about marketplace products"),
      "Which tool is best for dashboards?"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(mockSendChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Which tool is best for dashboards?",
          history: [
            {
              role: "user",
              content: "Which tool is best for dashboards?",
            },
          ],
        })
      );
    });

    expect(
      await screen.findByText("Tableau", { selector: "strong" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Catalog Source" })
    ).toHaveAttribute("href", "https://example.test/source");
    expect(screen.getByText("Tableau Catalog")).toBeInTheDocument();
  });

  it("shows backend errors without clearing conversation history", async () => {
    const user = userEvent.setup();
    mockSendChatMessage.mockRejectedValueOnce(
      new Error("Assistant unavailable")
    );

    render(<ChatWidget />);

    await user.click(
      screen.getByRole("button", { name: /open marketplace assistant/i })
    );
    await user.type(
      screen.getByPlaceholderText("Ask about marketplace products"),
      "Help me choose a product"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Assistant unavailable"
    );
    expect(screen.getByText("Help me choose a product")).toBeInTheDocument();
  });

  it("clears the current conversation and starts the next prompt without the old id", async () => {
    const user = userEvent.setup();
    mockSendChatMessage
      .mockResolvedValueOnce({
        answer: "First assistant answer.",
        conversationId: "conversation-123",
      })
      .mockResolvedValueOnce({
        answer: "Second assistant answer.",
        conversationId: "conversation-456",
      });
    mockClearChatConversation.mockResolvedValueOnce();

    render(<ChatWidget />);

    await user.click(
      screen.getByRole("button", { name: /open marketplace assistant/i })
    );
    await user.type(
      screen.getByPlaceholderText("Ask about marketplace products"),
      "First question"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText("First assistant answer.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start new chat/i }));

    await waitFor(() => {
      expect(mockClearChatConversation).toHaveBeenCalledWith(
        "conversation-123"
      );
    });
    expect(screen.queryByText("First question")).not.toBeInTheDocument();
    expect(
      screen.getByText("Which products support data visualization?")
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Ask about marketplace products"),
      "Second question"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(mockSendChatMessage).toHaveBeenCalledTimes(2);
    });

    expect(mockSendChatMessage.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        message: "Second question",
        conversationId: undefined,
      })
    );
    expect(await screen.findByText("Second assistant answer.")).toBeInTheDocument();
  });

  it("clears local state without a backend call when no conversation exists", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    await user.click(
      screen.getByRole("button", { name: /open marketplace assistant/i })
    );
    await user.type(
      screen.getByPlaceholderText("Ask about marketplace products"),
      "Draft question"
    );

    await user.click(screen.getByRole("button", { name: /start new chat/i }));

    expect(mockClearChatConversation).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Ask about marketplace products")).toHaveValue("");
    expect(
      screen.getByText("Which products support data visualization?")
    ).toBeInTheDocument();
  });

  it("clears local chat state even if the backend clear fails", async () => {
    const user = userEvent.setup();
    mockSendChatMessage.mockResolvedValueOnce({
      answer: "Assistant answer before clear.",
      conversationId: "conversation-123",
    });
    mockClearChatConversation.mockRejectedValueOnce(
      new Error("Delete failed")
    );

    render(<ChatWidget />);

    await user.click(
      screen.getByRole("button", { name: /open marketplace assistant/i })
    );
    await user.type(
      screen.getByPlaceholderText("Ask about marketplace products"),
      "Question before clear"
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Assistant answer before clear.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start new chat/i }));

    await waitFor(() => {
      expect(mockClearChatConversation).toHaveBeenCalledWith(
        "conversation-123"
      );
    });
    expect(screen.queryByText("Question before clear")).not.toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Chat cleared locally"
    );
  });
});
