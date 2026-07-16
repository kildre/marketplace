# Chat Clear / New Conversation Integration Plan

## Purpose

Add a reliable way for a user to clear the visible chat and start a new conversation.

The clear action must reset both:

- the frontend chat state, so the UI immediately returns to the starter/suggestion view
- the backend conversation state, so follow-up prompts do not continue the old TalkBack chat

## Repository Names

- `TALKTALK`: frontend chat experience
- `TALKBACK-API`: backend AI/chat API
- `marketplace`: Marketplace application/frontend host
- `marketplace-monolith-node`: Marketplace backend/proxy

## Key Rule

The frontend must not call `TALKBACK-API` directly.

All browser calls should go through `marketplace-monolith-node`, which owns auth, tracing, retries, service-to-service credentials, and TalkBack response normalization.

```text
TALKTALK / marketplace UI
        |
        v
marketplace-monolith-node
        |
        v
TALKBACK-API
```

## Current Contract Issue

`marketplace` / `marketplace-monolith-node` use `conversationId`.

`TALKBACK-API` currently uses `chat_id`.

Because the TalkBack request schema ignores unknown fields, a request like this:

```json
{
  "message": "Compare Tableau and Databricks",
  "conversationId": "123"
}
```

does not continue TalkBack chat `123` unless either `marketplace-monolith-node` maps it to `chat_id`, or `TALKBACK-API` accepts `conversationId` as an alias.

Use `conversationId` as the external cross-service field. Treat `chat_id` as TalkBack's internal field.

## Target API Contract

### Send Message

Browser to Marketplace backend:

```http
POST /api/chat
```

Request:

```json
{
  "message": "Which products support dashboards?",
  "conversationId": "123",
  "metadata": {}
}
```

Response:

```json
{
  "answer": "Tableau supports dashboards and visual analytics.",
  "citations": [],
  "products": [],
  "conversationId": "123"
}
```

### Clear Current Conversation

Browser to Marketplace backend:

```http
DELETE /api/chat/{conversationId}
```

Response options:

```http
204 No Content
```

or:

```json
{
  "conversationId": "123",
  "cleared": true
}
```

Recommended UI behavior: treat `204`, `200`, and `404` as successful local clears. A missing backend conversation should not block the user from starting a new chat.

### Start New Conversation

The next message starts a new conversation by omitting `conversationId`:

```json
{
  "message": "What should I use for ML workflows?"
}
```

`TALKBACK-API` creates a new chat and returns a new `conversationId`.

## TALKTALK Changes

1. Add a clear/new-chat control to the chat header.
   - Use an icon button with an accessible label like `Start new chat`.
   - Disable it while a message is actively sending.
   - Place it near the expand/close controls.

2. Add a clear handler.
   - If there is no active `conversationId`, only clear local state.
   - If there is an active `conversationId`, call the Marketplace backend clear endpoint.
   - Clear local state even if the server returns `404`.

3. Reset local chat state.

```ts
setMessages([]);
setConversationId(undefined);
setInputValue("");
setErrorMessage(null);
```

4. Ensure the next send omits `conversationId`.

```ts
await sendChatMessage({
  message: trimmedPrompt
});
```

5. Keep close and clear separate.
   - Close hides the drawer.
   - Clear starts a new conversation.

6. Add frontend tests.
   - Clicking clear removes existing messages.
   - Clicking clear resets `conversationId`.
   - Next message does not send the old `conversationId`.
   - Clear works when the backend delete returns `404`.

## marketplace Changes

1. Wire the clear control into the embedded chat widget or Marketplace chat component.

2. Add an API service method for the clear endpoint.

```ts
static async clearChatConversation(conversationId: string): Promise<void> {
  const response = await window.fetch(
    getEndpointUrl("CHAT_CONVERSATION", { conversationId }),
    {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
      mode: "cors",
      credentials: "omit",
    }
  );

  if (response.status === 404) return;

  await this.handleResponse(response);
}
```

3. Add an API endpoint constant.

```ts
CHAT: "/api/chat",
CHAT_CONVERSATION: "/api/chat/:conversationId"
```

4. Make sure the chat request field is `message` or that the Marketplace backend continues to accept both `message` and deprecated `prompt`.

5. Add UI tests around the hosted Marketplace chat.
   - Clear button appears when the drawer is open.
   - Clear button calls `DELETE /api/chat/{conversationId}` when an ID exists.
   - Suggestions return after clear.

## marketplace-monolith-node Changes

1. Keep `POST /api/chat` as the only browser-facing send endpoint.

2. Add a browser-facing clear endpoint.

```http
DELETE /api/chat/:conversationId
```

3. Add controller/service/client methods.

Suggested flow:

```text
chatRoutes DELETE /:conversationId
  -> chatController.clearChat
  -> chatService.clearConversation
  -> talkbackClient.deleteConversation
  -> TALKBACK-API DELETE /chat/{chat_id}
```

4. Map `conversationId` to TalkBack's `chat_id`.
   - If `conversationId` is numeric, pass it as `chat_id`.
   - If TalkBack later moves to UUIDs, only this mapping layer should need to change.

5. Update the existing TalkBack send request mapping.

Current payload should include TalkBack-compatible ID fields:

```json
{
  "message": "prompt text",
  "prompt": "prompt text",
  "chat_id": 123,
  "conversationId": "123",
  "context": {},
  "metadata": {}
}
```

6. Normalize TalkBack responses.

Accept any of these from TalkBack:

```ts
data.conversationId
data.conversation_id
data.chat_id
```

Return only `conversationId` to the browser.

7. Handle TalkBack delete responses.
   - `200` or `204`: success
   - `404`: treat as success for UI reset, or return `204`
   - `5xx` / timeout: return an error, but the frontend may still clear local state

8. Add tests.
   - `DELETE /api/chat/:conversationId` calls TalkBack delete URL.
   - `404` from TalkBack does not prevent local reset semantics.
   - `POST /api/chat` maps `conversationId` to `chat_id`.
   - Response normalization maps `chat_id` back to `conversationId`.

## TALKBACK-API Changes

1. Accept `conversationId` as an alias for `chat_id`.

Recommended schema behavior:

```py
class ChatRequest(BaseModel):
    message: str
    chat_id: int | None = None
    conversationId: str | None = None

    @model_validator(mode="after")
    def normalize_conversation_id(self):
        if self.chat_id is None and self.conversationId:
            self.chat_id = int(self.conversationId)
        return self
```

2. Return `conversationId` on chat responses.

Current TalkBack responses include `chat_id` through the message response. Add a response shape that includes:

```json
{
  "content": "Assistant answer",
  "chat_id": 123,
  "conversationId": "123"
}
```

3. Keep or standardize the delete endpoint.

Existing endpoint:

```http
DELETE /chat/{chat_id}
```

Recommended behavior:

```http
204 No Content
```

or:

```json
{
  "conversationId": "123",
  "cleared": true
}
```

4. Ensure deleting a chat removes messages.

The service should delete:

- all messages for the chat
- the chat record itself

5. Add tests.
   - `POST /chat` with `conversationId` continues the existing chat.
   - `POST /chat` without `conversationId` creates a new chat.
   - Response includes `conversationId`.
   - `DELETE /chat/{chat_id}` deletes the chat and messages.
   - Deleting a missing chat returns either `404` or idempotent success, depending on chosen behavior.

## Recommended Rollout Order

1. Update `TALKBACK-API` to accept and return `conversationId`.
2. Update `marketplace-monolith-node` to map send and delete requests.
3. Update `marketplace` / `TALKTALK` to add the clear control and local reset behavior.
4. Run backend unit tests in `TALKBACK-API`.
5. Run backend unit tests in `marketplace-monolith-node`.
6. Run frontend tests in `marketplace` / `TALKTALK`.
7. Manually verify:
   - send first message
   - receive `conversationId`
   - send follow-up with same `conversationId`
   - clear chat
   - send another message without the old `conversationId`
   - confirm TalkBack creates a new chat record

## Acceptance Criteria

- User can click `Start new chat` from the chat header.
- Visible messages disappear immediately after clearing.
- Suggested prompts return after clearing.
- The next message starts a new TalkBack chat.
- Old `conversationId` is not sent after clearing.
- Browser never calls `TALKBACK-API` directly.
- `marketplace-monolith-node` remains the only integration point between the UI and TalkBack.
- Existing close/minimize behavior is unchanged.

