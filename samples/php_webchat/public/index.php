<?php
// Simple PHP front end for the AI bot chat sample.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PHP AI Bot Chat</title>
    <link rel="stylesheet" href="assets/style.css" />
</head>
<body>
    <header class="app-header">
        <div class="header-content">
            <div>
                <p class="eyebrow">Bot Framework Samples</p>
                <h1>PHP AI Bot Chat</h1>
                <p class="subhead">A lightweight PHP web experience that simulates an AI chat bot using only built-in PHP features.</p>
            </div>
            <div class="badge">PHP</div>
        </div>
    </header>
    <main class="layout">
        <section class="panel" aria-label="Chat panel">
            <div id="chat-window" class="chat-window" aria-live="polite"></div>
            <form id="chat-form" class="chat-form" autocomplete="off">
                <label class="sr-only" for="message">Type your message</label>
                <input id="message" name="message" type="text" placeholder="Say hello or ask for help" required />
                <button type="submit">Send</button>
            </form>
        </section>
        <aside class="panel guidance" aria-label="How it works">
            <h2>How it works</h2>
            <ol>
                <li>The chat UI sends messages to <code>chat.php</code> using <code>fetch</code>.</li>
                <li><code>chat.php</code> stores the conversation in the session and creates responses with simple heuristics.</li>
                <li>Refreshing the page restores the conversation from the stored history.</li>
            </ol>
            <p class="note">This sample avoids external API calls so it runs anywhere PHP is available.</p>
        </aside>
    </main>
    <script src="assets/chat.js"></script>
</body>
</html>
