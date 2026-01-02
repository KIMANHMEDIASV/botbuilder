# AI Chat Admin

A lightweight web page that lets you manage multiple AI models (add, update, delete) and chat with them from a single UI. The server keeps model metadata in a JSON file so you can quickly prototype without extra infrastructure.

## Running the sample

No external npm dependencies are required. From this folder run:

```bash
npm start
```

The app starts on http://localhost:3978. The server exposes:

- `GET /api/models` – list available models.
- `POST /api/models` – create a model (fields: `name`, `description`, `endpointUrl`, optional `id`).
- `PUT /api/models/:id` – update a model.
- `DELETE /api/models/:id` – remove a model.
- `POST /api/chat` – send a message with `{ modelId, message }` and receive a stubbed reply.

Model metadata is stored at `data/models.json`. The chat endpoint echoes a structured response so you can easily swap in your own AI client code.
