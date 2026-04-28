<?php
/**
 * contact.php — Desserty
 * Invia due email via Resend API:
 *   1. Notifica interna → info@dessertyfood.com
 *   2. Conferma automatica → mittente
 *
 * SETUP: verifica il dominio dessertyfood.com su resend.com
 * (oppure usa temporaneamente noreply@oohfruit.com se già verificato)
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo non consentito.']);
    exit;
}

$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(strip_tags($_POST['email']   ?? ''));
$subject = trim(strip_tags($_POST['subject'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));
$lang    = trim(strip_tags($_POST['lang']    ?? 'it'));

if (!$name || !$email || !$message) {
    echo json_encode(['success' => false, 'message' => $lang === 'en'
        ? 'Please fill in all required fields.'
        : 'Compila tutti i campi obbligatori.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => $lang === 'en'
        ? 'Please enter a valid email address.'
        : 'Indirizzo email non valido.']);
    exit;
}

$subjectLabel = $subject ?: ($lang === 'en' ? '(not specified)' : '(non specificato)');
$dataOra      = date('d/m/Y H:i');

// ─── HELPER RESEND ─────────────────────────────────────────────────────────────
function sendViaResend(string $to, string $toName, string $subject, string $html, string $text, string $replyTo = ''): bool {
    $payload = [
        'from'    => FROM_NAME . ' <' . FROM_EMAIL . '>',
        'to'      => ["$toName <$to>"],
        'subject' => $subject,
        'html'    => $html,
        'text'    => $text,
    ];
    if ($replyTo) {
        $payload['reply_to'] = [$replyTo];
    }

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . RESEND_API_KEY,
            'Content-Type: application/json',
        ],
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode >= 200 && $httpCode < 300;
}

// ─── EMAIL INTERNA ─────────────────────────────────────────────────────────────
$htmlInterno = "
<!DOCTYPE html>
<html lang='it'>
<head><meta charset='UTF-8'/></head>
<body style='margin:0;padding:0;background:#EFEAE0;font-family:Arial,Helvetica,sans-serif'>
<table width='100%' cellpadding='0' cellspacing='0' style='background:#EFEAE0;padding:40px 0'>
<tr><td align='center'>
<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;border:1px solid #D9D2C2'>

  <!-- HEADER -->
  <tr>
    <td style='background:#2A2418;padding:32px 40px'>
      <p style='font-family:Georgia,serif;font-style:italic;font-size:30px;color:#EDE6CF;margin:0;letter-spacing:-0.5px'>
        <strong style='font-style:normal;font-weight:600'>D</strong>esserty<span style='color:#F97C46'>.</span>
      </p>
    </td>
  </tr>

  <!-- LABEL BAR -->
  <tr>
    <td style='background:#EDE6CF;padding:14px 40px;border-bottom:1px solid #D9D2C2'>
      <p style='font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#4d4534;margin:0;font-weight:700'>Nuovo messaggio · form contatti</p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style='padding:36px 40px 28px'>
      <table width='100%' cellpadding='0' cellspacing='0' style='font-size:14px;line-height:1.5'>
        <tr>
          <td style='padding:11px 0;border-bottom:1px solid #EFEAE0;color:#F97C46;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;font-weight:700;width:90px;vertical-align:top'>NOME</td>
          <td style='padding:11px 0 11px 16px;border-bottom:1px solid #EFEAE0;color:#2A2418;font-weight:600'>$name</td>
        </tr>
        <tr>
          <td style='padding:11px 0;border-bottom:1px solid #EFEAE0;color:#F97C46;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;font-weight:700;vertical-align:top'>EMAIL</td>
          <td style='padding:11px 0 11px 16px;border-bottom:1px solid #EFEAE0'>
            <a href='mailto:$email' style='color:#2A2418;text-decoration:none;border-bottom:1px solid #F97C46'>$email</a>
          </td>
        </tr>
        <tr>
          <td style='padding:11px 0;border-bottom:1px solid #EFEAE0;color:#F97C46;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;font-weight:700;vertical-align:top'>OGGETTO</td>
          <td style='padding:11px 0 11px 16px;border-bottom:1px solid #EFEAE0;color:#4d4534'>$subjectLabel</td>
        </tr>
        <tr>
          <td style='padding:11px 0;color:#F97C46;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;font-weight:700;vertical-align:top'>DATA</td>
          <td style='padding:11px 0 11px 16px;color:#9A9080;font-size:12px'>$dataOra</td>
        </tr>
      </table>

      <!-- MESSAGGIO -->
      <div style='margin-top:28px;border-left:2px solid #F97C46;padding-left:20px'>
        <p style='font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#F97C46;font-weight:700;margin:0 0 14px'>MESSAGGIO</p>
        <p style='font-family:Georgia,serif;font-style:italic;font-size:17px;line-height:1.75;color:#2A2418;margin:0;white-space:pre-wrap'>$message</p>
      </div>

      <!-- CTA -->
      <div style='margin-top:32px'>
        <a href='mailto:$email' style='display:inline-block;background:#2A2418;color:#EDE6CF;padding:13px 28px;border-radius:100px;text-decoration:none;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:700'>Rispondi a $name &rarr;</a>
      </div>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style='padding:18px 40px;border-top:1px solid #D9D2C2'>
      <p style='font-size:11px;color:#B0A898;margin:0'>Ricevuto il $dataOra tramite il form contatti di dessertyfood.com</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>";

$ok = sendViaResend(
    NOTIFY_EMAIL, 'Desserty',
    "Nuovo messaggio da $name — Desserty",
    $htmlInterno,
    "Nuovo messaggio da: $name <$email>\nOggetto: $subjectLabel\nData: $dataOra\n\n---\n\n$message",
    "$name <$email>"
);

if (!$ok) {
    echo json_encode(['success' => false, 'message' => $lang === 'en'
        ? 'Something went wrong. Please try again.'
        : 'Errore durante l\'invio. Riprova più tardi.']);
    exit;
}

// ─── EMAIL CONFERMA UTENTE ──────────────────────────────────────────────────────
if ($lang === 'en') {
    $greeting   = "We got your message, $name.";
    $bodyText   = "Thank you for reaching out. We&#39;ve received your message and will get back to you as soon as possible at <strong style='color:#2A2418'>$email</strong>.";
    $recapLabel = 'YOUR MESSAGE';
    $footerNote = '';
    $footerSub  = '';
    $emailSubject = 'We received your message — Desserty';
    $plainText  = "Hi $name,\n\nWe received your message and will get back to you at $email.\n\nYour message:\n$message\n\n---\nDesserty · info@dessertyfood.com";
} else {
    $greeting   = "Messaggio ricevuto, $name.";
    $bodyText   = "Grazie per averci scritto. Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto all'indirizzo <strong style='color:#2A2418'>$email</strong>.";
    $recapLabel = 'IL TUO MESSAGGIO';
    $footerNote = '';
    $footerSub  = '';
    $emailSubject = 'Abbiamo ricevuto il tuo messaggio — Desserty';
    $plainText  = "Ciao $name,\n\nAbbiamo ricevuto il tuo messaggio e ti risponderemo all'indirizzo $email.\n\nIl tuo messaggio:\n$message\n\n---\nDesserty · info@dessertyfood.com";
}

$htmlConferma = "
<!DOCTYPE html>
<html lang='$lang'>
<head><meta charset='UTF-8'/></head>
<body style='margin:0;padding:0;background:#EFEAE0;font-family:Arial,Helvetica,sans-serif'>
<table width='100%' cellpadding='0' cellspacing='0' style='background:#EFEAE0;padding:40px 0'>
<tr><td align='center'>
<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;background:#F7F4EE;border-radius:4px;overflow:hidden;border:1px solid #D9D2C2'>

  <!-- HEADER SCURO -->
  <tr>
    <td style='background:#2A2418;padding:36px 40px 32px'>
      <p style='font-family:Georgia,serif;font-style:italic;font-size:26px;color:#EDE6CF;margin:0 0 24px;letter-spacing:-0.5px'>
        <strong style='font-style:normal;font-weight:600'>D</strong>esserty<span style='color:#F97C46'>.</span>
      </p>
      <h1 style='font-family:Georgia,serif;font-weight:300;font-style:italic;font-size:30px;color:#EDE6CF;margin:0;line-height:1.1;letter-spacing:-0.02em'>$greeting</h1>
    </td>
  </tr>

  <!-- STRISCIA CREMA -->
  <tr>
    <td style='background:#EDE6CF;padding:0'><div style='height:3px;background:#F97C46'></div></td>
  </tr>

  <!-- CORPO -->
  <tr>
    <td style='padding:36px 40px 28px;background:#F7F4EE'>
      <p style='font-size:15px;line-height:1.8;color:#4d4534;margin:0 0 28px'>$bodyText</p>

      <!-- BOX MESSAGGIO -->
      <table width='100%' cellpadding='0' cellspacing='0'>
        <tr>
          <td style='background:#EDE6CF;border-radius:4px;padding:24px 28px'>
            <p style='font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#F97C46;font-weight:700;margin:0 0 14px'>$recapLabel</p>
            <p style='font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.75;color:#2A2418;margin:0;white-space:pre-wrap'>$message</p>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- FOOTER SCURO -->
  <tr>
    <td style='background:#2A2418;padding:22px 40px'>
      <p style='font-size:11px;color:rgba(237,230,207,0.45);margin:0'>
        &copy; 2026 Desserty &middot; Confluencia Srl &middot;
        <a href='mailto:info@dessertyfood.com' style='color:rgba(237,230,207,0.45);text-decoration:none'>info@dessertyfood.com</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>";

sendViaResend($email, $name, $emailSubject, $htmlConferma, $plainText);

echo json_encode(['success' => true]);
exit;
