<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['chat_history'])) {
    $_SESSION['chat_history'] = [];
}

if (count($_SESSION['chat_history']) === 0) {
    appendMessage('bot', "Hi there! I'm a lightweight demo bot. Ask me for help, share your goals, or say hello.");
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['history' => $_SESSION['chat_history']], JSON_UNESCAPED_UNICODE);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
$message = trim((string)($payload['message'] ?? ''));

if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Message cannot be empty.']);
    exit;
}

appendMessage('user', $message);
$reply = buildReply($message);
appendMessage('bot', $reply);

echo json_encode([
    'reply' => $reply,
    'history' => $_SESSION['chat_history'],
], JSON_UNESCAPED_UNICODE);

function appendMessage(string $role, string $text): void
{
    $_SESSION['chat_history'][] = [
        'role' => $role,
        'text' => $text,
        'timestamp' => date('g:i a'),
    ];
}

function buildReply(string $message): string
{
    $normalized = strtolower($message);

    $greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening'];
    foreach ($greetings as $greeting) {
        if (strpos($normalized, $greeting) !== false) {
            return 'Hello! How can I assist you today? I can summarize goals, share tips, or outline next steps.';
        }
    }

    if (strpos($normalized, 'help') !== false || strpos($normalized, 'idea') !== false) {
        return 'Tell me what you are trying to build and I will outline a quick plan with next steps.';
    }

    if (strpos($normalized, 'thank') !== false) {
        return "You're welcome! Let me know if you want to explore another topic.";
    }

    if (strpos($normalized, 'plan') !== false || strpos($normalized, 'next step') !== false) {
        return 'Start by writing down your goal, list the tools you have, and I will propose a concise plan to get you there.';
    }

    if (strpos($normalized, 'joke') !== false) {
        return "Why did the developer go broke? Because he used up all his cache.";
    }

    if (substr_count($normalized, '?') >= 1) {
        return 'Great question! I recommend breaking it into smaller tasks. Which part should we tackle first?';
    }

    return 'I am here to help. Share a goal, ask for advice, or request a checklist and I will respond with guidance.';
}
