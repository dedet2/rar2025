export async function POST(req) {
  try {
    const data = await req.json();
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `New RAR Inquiry\nName: ${data.name}\nEmail: ${data.email}\nTier: ${data.tier}` })
      });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}
