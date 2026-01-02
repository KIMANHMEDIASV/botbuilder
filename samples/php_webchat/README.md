# PHP AI Bot Chat Sample

This sample shows a minimal PHP web chat experience that simulates an AI helper without any external dependencies. The chat history is stored in the PHP session so the conversation survives page refreshes.

## Getting started

1. Ensure PHP 8+ is installed locally.
2. From the repository root, start the PHP development server and point it to the public folder:
   ```bash
   php -S localhost:8000 -t samples/php_webchat/public
   ```
3. Open [http://localhost:8000](http://localhost:8000) in your browser and chat with the bot.

## How it works

- `public/index.php` renders the chat UI and loads the JavaScript that talks to the backend.
- `public/chat.php` receives chat messages via `fetch`, applies simple heuristics to craft a reply, and stores the conversation in the session.
- Refreshing the page triggers a `GET` request to `chat.php`, which restores the existing conversation so users can continue where they left off.

Because the responses are generated locally, the sample runs anywhere PHP is available—no API keys or cloud services required.
