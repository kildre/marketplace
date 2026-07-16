# Marketplace Chat UI Guide

Repository: `marketplace`

## Goal
Embed the RAG chatbot into the Marketplace UI.

## Checklist

### Components
- [ ] Floating chat button
- [ ] Chat drawer/modal
- [ ] Conversation history
- [ ] Markdown rendering
- [ ] Typing indicator

### API
- [ ] Call POST /api/chat
- [ ] Handle loading/errors
- [ ] Support streaming (optional)

### UX
- [ ] Product cards in responses
- [ ] Citation rendering
- [ ] Suggested prompts
- [ ] Dark mode
- [ ] Accessibility

## Component Layout

```text
App
 ├── ChatButton
 ├── ChatDrawer
 ├── MessageList
 ├── MessageBubble
 ├── CitationList
 └── ProductCard
```

The frontend should communicate only with the Marketplace backend, never directly with talkback-api or AWS.
