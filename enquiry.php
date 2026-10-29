<?php
// Enquiry endpoint: core PHP + MySQL (PDO, prepared statements). No framework.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    respond(503, ['ok' => false, 'message' => 'Enquiry service is not configured yet. Copy api/config.sample.php to api/config.php.']);
}
$config = require $configFile;

// Honeypot: bots fill hidden fields. Pretend success.
if (!empty($_POST['website'])) {
    respond(200, ['ok' => true]);
}

$types  = ['hotel', 'travel_agent', 'package_operator', 'transport', 'vendor', 'corporate_travel', 'other'];
$topics = ['demo', 'modules', 'revenue', 'requirements'];

$in = [
    'name'          => trim((string)($_POST['name'] ?? '')),
    'company'       => trim((string)($_POST['company'] ?? '')),
    'business_type' => (string)($_POST['business_type'] ?? ''),
    'email'         => trim((string)($_POST['email'] ?? '')),
    'phone'         => trim((string)($_POST['phone'] ?? '')),
    'topic'         => (string)($_POST['topic'] ?? 'demo'),
    'message'       => trim((string)($_POST['message'] ?? '')),
];

$errors = [];
if (mb_strlen($in['name']) < 2 || mb_strlen($in['name']) > 120)       $errors['name'] = 'Please enter your name.';
if (mb_strlen($in['company']) < 2 || mb_strlen($in['company']) > 160) $errors['company'] = 'Please enter your company name.';
if (!in_array($in['business_type'], $types, true))                      $errors['business_type'] = 'Please choose a business type.';
if (!filter_var($in['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($in['email']) > 190) $errors['email'] = 'Enter a valid email address.';
$digits = preg_replace('/\D/', '', $in['phone']);
if (!preg_match('/^[+\d][\d\s\-().]*$/', $in['phone']) || strlen($digits) < 7 || strlen($digits) > 15) $errors['phone'] = 'Enter a valid phone number.';
if (mb_strlen($in['message']) < 10 || mb_strlen($in['message']) > 2000) $errors['message'] = 'Message must be 10–2000 characters.';
if (!in_array($in['topic'], $topics, true)) $in['topic'] = 'demo';

if ($errors) {
    respond(422, ['ok' => false, 'message' => 'Please correct the highlighted fields.', 'errors' => $errors]);
}

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']),
        $config['db_user'],
        $config['db_pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]
    );

    // Simple throttle: max 5 enquiries per IP per hour.
    $ip = substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);
    $q = $pdo->prepare('SELECT COUNT(*) FROM enquiries WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 1 HOUR)');
    $q->execute([$ip]);
    if ((int)$q->fetchColumn() >= 5) {
        respond(429, ['ok' => false, 'message' => 'Too many enquiries from your network. Please try again later.']);
    }

    $ins = $pdo->prepare(
        'INSERT INTO enquiries (name, company, business_type, email, phone, topic, message, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $ins->execute([$in['name'], $in['company'], $in['business_type'], $in['email'], $in['phone'], $in['topic'], $in['message'], $ip]);
} catch (Throwable $e) {
    error_log('B2BStays enquiry error: ' . $e->getMessage());
    respond(500, ['ok' => false, 'message' => 'We could not save your enquiry right now. Please try again later.']);
}

// Optional email notification (strip CR/LF to prevent header injection).
if (!empty($config['notify_email'])) {
    $clean = static fn(string $s): string => str_replace(["\r", "\n"], ' ', $s);
    @mail(
        $config['notify_email'],
        'New B2BStays enquiry: ' . $clean($in['company']),
        "Name: {$in['name']}\nCompany: {$in['company']}\nType: {$in['business_type']}\nTopic: {$in['topic']}\nEmail: {$in['email']}\nPhone: {$in['phone']}\n\n{$in['message']}",
        'From: ' . ($config['mail_from'] ?? 'no-reply@localhost') . "\r\nReply-To: " . $clean($in['email'])
    );
}

respond(200, ['ok' => true]);
