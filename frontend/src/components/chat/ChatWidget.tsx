import React, {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SendIcon from "@mui/icons-material/Send";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { ApiService } from "../../services/apiService";
import type {
  ChatApiResponse,
  ChatCitationApiDto,
  ChatHistoryItem,
  ChatProductApiDto,
} from "../../services/apiService";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitationApiDto[];
  products?: ChatProductApiDto[];
};

const SUGGESTED_PROMPTS = [
  "Which products support data visualization?",
  "Compare license based tools",
  "What should I request for AI or ML work?",
];

const createMessageId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const isSafeUrl = (url?: string) => {
  if (!url) return false;

  try {
    const parser = document.createElement("a");
    parser.href = url;
    return ["http:", "https:", "mailto:"].includes(parser.protocol);
  } catch {
    return false;
  }
};

const getAssistantContent = (response: ChatApiResponse) =>
  response.answer ||
  response.response ||
  response.message ||
  response.content ||
  response.text ||
  "No answer returned.";

const getCitations = (response: ChatApiResponse) =>
  response.citations || response.sources || [];

const getProducts = (response: ChatApiResponse) =>
  response.products || response.productCards || [];

const toHistory = (message: ChatMessage): ChatHistoryItem => ({
  role: message.role,
  content: message.content,
});

const renderInlineMarkdown = (text: string, keyPrefix: string) => {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (linkMatch && isSafeUrl(linkMatch[2])) {
      nodes.push(
        <a key={key} href={linkMatch[2]} target="_blank" rel="noreferrer">
          {linkMatch[1]}
        </a>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      nodes.push(token);
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
};

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  const blocks = content.trim().split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").filter(Boolean);
        const heading = block.match(/^(#{1,3})\s+(.+)$/);

        if (heading) {
          return (
            <h4
              key={`heading-${blockIndex}`}
              className="chat-widget__message-heading"
            >
              {renderInlineMarkdown(heading[2], `heading-${blockIndex}`)}
            </h4>
          );
        }

        if (
          lines.length > 0 &&
          lines.every((line) => /^[-*]\s+/.test(line.trim()))
        ) {
          return (
            <ul
              key={`list-${blockIndex}`}
              className="chat-widget__markdown-list"
            >
              {lines.map((line, lineIndex) => (
                <li key={`list-${blockIndex}-${lineIndex}`}>
                  {renderInlineMarkdown(
                    line.trim().replace(/^[-*]\s+/, ""),
                    `list-${blockIndex}-${lineIndex}`
                  )}
                </li>
              ))}
            </ul>
          );
        }

        if (
          lines.length > 0 &&
          lines.every((line) => /^\d+\.\s+/.test(line.trim()))
        ) {
          return (
            <ol
              key={`ordered-${blockIndex}`}
              className="chat-widget__markdown-list"
            >
              {lines.map((line, lineIndex) => (
                <li key={`ordered-${blockIndex}-${lineIndex}`}>
                  {renderInlineMarkdown(
                    line.trim().replace(/^\d+\.\s+/, ""),
                    `ordered-${blockIndex}-${lineIndex}`
                  )}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`paragraph-${blockIndex}`}>
            {lines.map((line, lineIndex) => (
              <React.Fragment key={`line-${blockIndex}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {renderInlineMarkdown(
                  line,
                  `paragraph-${blockIndex}-${lineIndex}`
                )}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};

const CitationList: React.FC<{ citations: ChatCitationApiDto[] }> = ({
  citations,
}) => {
  if (citations.length === 0) return null;

  return (
    <div className="chat-widget__citations" aria-label="Citations">
      {citations.map((citation, index) => {
        const label =
          citation.title || citation.source || `Source ${index + 1}`;
        const snippet = citation.snippet || citation.text;

        return (
          <div className="chat-widget__citation" key={`${label}-${index}`}>
            {isSafeUrl(citation.url) ? (
              <a href={citation.url} target="_blank" rel="noreferrer">
                {label}
              </a>
            ) : (
              <span>{label}</span>
            )}
            {snippet && <p>{snippet}</p>}
          </div>
        );
      })}
    </div>
  );
};

const ProductReferenceCard: React.FC<{ product: ChatProductApiDto }> = ({
  product,
}) => {
  const name = product.name || product.title || "Marketplace product";
  const price =
    product.rom ||
    (typeof product.price === "number"
      ? product.price === 0
        ? "Included"
        : `$${product.price.toLocaleString()}`
      : undefined);

  const cardContent = (
    <>
      <div className="chat-widget__product-name">{name}</div>
      {product.type && (
        <div className="chat-widget__product-type">{product.type}</div>
      )}
      {product.description && (
        <p className="chat-widget__product-description">{product.description}</p>
      )}
      {price && <div className="chat-widget__product-price">{price}</div>}
    </>
  );

  if (isSafeUrl(product.url)) {
    return (
      <a
        className="chat-widget__product-card"
        href={product.url}
        target="_blank"
        rel="noreferrer"
      >
        {cardContent}
      </a>
    );
  }

  return <div className="chat-widget__product-card">{cardContent}</div>;
};

const ProductCardList: React.FC<{ products: ChatProductApiDto[] }> = ({
  products,
}) => {
  if (products.length === 0) return null;

  return (
    <div className="chat-widget__products" aria-label="Referenced products">
      {products.map((product, index) => (
        <ProductReferenceCard
          key={`${product.id || product.name || product.title || index}`}
          product={product}
        />
      ))}
    </div>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <article
    className={`chat-widget__message chat-widget__message--${message.role}`}
  >
    <div className="chat-widget__avatar" aria-hidden="true">
      {message.role === "user" ? (
        <PersonOutlineIcon />
      ) : (
        <SmartToyOutlinedIcon />
      )}
    </div>
    <div className="chat-widget__bubble">
      <MarkdownMessage content={message.content} />
      <CitationList citations={message.citations || []} />
      <ProductCardList products={message.products || []} />
    </div>
  </article>
);

const TypingIndicator = () => (
  <div className="chat-widget__message chat-widget__message--assistant">
    <div className="chat-widget__avatar" aria-hidden="true">
      <SmartToyOutlinedIcon />
    </div>
    <div
      className="chat-widget__bubble chat-widget__bubble--typing"
      aria-label="Assistant is typing"
    >
      <span />
      <span />
      <span />
    </div>
  </div>
);

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<React.ElementRef<"textarea"> | null>(null);
  const messagesEndRef = useRef<React.ElementRef<"div"> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
  }, []);

  const clearConversation = useCallback(async () => {
    if (isLoading) return;

    const previousConversationId = conversationId;

    setMessages([]);
    setConversationId(undefined);
    setInputValue("");
    setErrorMessage(null);
    inputRef.current?.focus();

    if (!previousConversationId) return;

    try {
      await ApiService.clearChatConversation(previousConversationId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Previous conversation could not be cleared on the server.";
      setErrorMessage(
        `Chat cleared locally, but the previous conversation could not be cleared on the server. ${message}`
      );
    }
  }, [conversationId, isLoading]);

  useEffect(() => {
    if (!isOpen) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: { key: string }) => {
      if (event.key === "Escape") {
        closeAssistant();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeAssistant, isOpen]);

  const submitPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedPrompt,
    };
    const history = [...messages, userMessage].map(toHistory);

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputValue("");
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await ApiService.sendChatMessage({
        message: trimmedPrompt,
        conversationId,
        history,
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: getAssistantContent(response),
        citations: getCitations(response),
        products: getProducts(response),
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reach the Marketplace assistant.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<React.ElementRef<"form">>) => {
    event.preventDefault();
    void submitPrompt(inputValue);
  };

  const handleInputKeyDown = (
    event: ReactKeyboardEvent<React.ElementRef<"textarea">>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitPrompt(inputValue);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <section
          id="marketplace-chat-panel"
          className={`chat-widget__drawer${
            isExpanded ? " chat-widget__drawer--expanded" : ""
          }`}
          role="dialog"
          aria-label="Marketplace assistant"
        >
          <header className="chat-widget__header">
            <div className="chat-widget__header-title">
              <h2>Marketplace Assistant</h2>
              <span>Catalog answers</span>
            </div>
            <div className="chat-widget__header-actions">
              <button
                type="button"
                className="chat-widget__icon-button"
                aria-label="Start new chat"
                title="Start new chat"
                onClick={() => void clearConversation()}
                disabled={isLoading}
              >
                <AddCommentOutlinedIcon />
              </button>
              <button
                type="button"
                className="chat-widget__icon-button"
                aria-label={
                  isExpanded
                    ? "Collapse Marketplace assistant"
                    : "Expand Marketplace assistant"
                }
                title={isExpanded ? "Collapse" : "Expand"}
                onClick={() =>
                  setIsExpanded((currentValue) => !currentValue)
                }
              >
                {isExpanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
              </button>
              <button
                type="button"
                className="chat-widget__icon-button"
                aria-label="Close Marketplace assistant"
                title="Close"
                onClick={closeAssistant}
              >
                <CloseIcon />
              </button>
            </div>
          </header>

          <div className="chat-widget__messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-widget__suggestions">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => void submitPrompt(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {errorMessage && (
            <div className="chat-widget__error" role="alert">
              <ErrorOutlineIcon />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="chat-widget__composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="marketplace-chat-input">
              Message
            </label>
            <textarea
              id="marketplace-chat-input"
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask about marketplace products"
              rows={2}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chat-widget__send-button"
              aria-label="Send message"
              title="Send"
              disabled={isLoading || inputValue.trim().length === 0}
            >
              <SendIcon />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-widget__launcher"
        aria-label={
          isOpen ? "Close Marketplace assistant" : "Open Marketplace assistant"
        }
        aria-expanded={isOpen}
        aria-controls="marketplace-chat-panel"
        title={isOpen ? "Close assistant" : "Open assistant"}
        onClick={() => {
          if (isOpen) {
            closeAssistant();
            return;
          }

          setIsOpen(true);
        }}
      >
        {isOpen ? (
          <CloseIcon />
        ) : (
          <img
            src="/assets/icons/chatIcon.png"
            alt=""
            className="chat-widget__launcher-icon"
            aria-hidden="true"
          />
        )}
        {!isOpen && <span>Chat</span>}
      </button>
    </div>
  );
};

export default ChatWidget;
