import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(v: unknown, max = 200): string {
  return typeof v === "string" || typeof v === "number" ? String(v).slice(0, max).trim() : "";
}

const allowedOrigins = (process.env.NOTIFY_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const apiKey = process.env.NOTIFY_API_KEY ?? "";

const seen = new Map<string, number>();
const hits = new Map<string, number[]>();

function prune(now: number) {
  for (const [k, t] of seen) if (now - t > 10 * 60_000) seen.delete(k);
  for (const [k, arr] of hits) {
    const kept = arr.filter((t) => now - t < 60_000);
    if (kept.length === 0) hits.delete(k);
    else hits.set(k, kept);
  }
}

function baseHeaders(origin: string | null): Record<string, string> {
  const ok = !allowedOrigins.length || (!!origin && allowedOrigins.includes(origin));
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (ok) headers["Access-Control-Allow-Origin"] = origin ?? "*";
  return headers;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: baseHeaders(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (allowedOrigins.length && (!origin || !allowedOrigins.includes(origin))) {
    return NextResponse.json({ ok: false, error: "origin not allowed" }, { status: 403, headers: baseHeaders(origin) });
  }

  if (!apiKey || request.headers.get("x-api-key") !== apiKey) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: baseHeaders(origin) });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return NextResponse.json({ ok: false, error: "smtp not configured" }, { status: 503, headers: baseHeaders(origin) });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400, headers: baseHeaders(origin) });
  }

  const p = (body ?? {}) as Record<string, unknown>;
  const email = str(p.email, 200);
  const orderNumber = str(p.orderNumber, 40);
  const total = str(p.total, 40);
  const date = str(p.date, 60);

  if (!orderNumber || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400, headers: baseHeaders(origin) });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  prune(now);

  const list = hits.get(ip) ?? [];
  if (list.filter((t) => now - t < 60_000).length >= 10) {
    return NextResponse.json({ ok: false, error: "too many requests" }, { status: 429, headers: baseHeaders(origin) });
  }
  list.push(now);
  hits.set(ip, list);

  if (seen.has(orderNumber)) {
    return NextResponse.json({ ok: true, deduped: true }, { headers: baseHeaders(origin) });
  }
  seen.set(orderNumber, now);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const siteName = process.env.NOTIFY_FROM_NAME || "Nora Library";
    const safeTotal = total.replace(/</g, "&lt;");

    await transporter.sendMail({
      from: `"${siteName}" <${user}>`,
      to: email,
      subject: `Your receipt — Order #${orderNumber}`,
      text: [
        `Thank you for your order!`,
        ``,
        `Order: #${orderNumber}`,
        total ? `Total: ${total}` : null,
        date ? `Date: ${date}` : null,
        ``,
        `${siteName}`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
      html: [
        `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#222">`,
        `<h2 style="margin:0 0 16px">${siteName}</h2>`,
        `<p>Thank you for your order!</p>`,
        `<table style="width:100%;border-collapse:collapse;margin:16px 0">`,
        `<tr><td style="padding:8px;border:1px solid #e5e5e5"><strong>Order</strong></td><td style="padding:8px;border:1px solid #e5e5e5">#${orderNumber}</td></tr>`,
        total
          ? `<tr><td style="padding:8px;border:1px solid #e5e5e5"><strong>Total</strong></td><td style="padding:8px;border:1px solid #e5e5e5">${safeTotal}</td></tr>`
          : "",
        date
          ? `<tr><td style="padding:8px;border:1px solid #e5e5e5"><strong>Date</strong></td><td style="padding:8px;border:1px solid #e5e5e5">${date.replace(/</g, "&lt;")}</td></tr>`
          : "",
        `</table>`,
        `<p style="color:#666;font-size:13px">This is an automated receipt for your purchase.</p>`,
        `</div>`,
      ].join(""),
      headers: { "X-Order-Number": orderNumber },
    });

    return NextResponse.json({ ok: true }, { headers: baseHeaders(origin) });
  } catch (err) {
    seen.delete(orderNumber);
    console.error("notify-order: send failed", err);
    return NextResponse.json({ ok: false, error: "send failed" }, { status: 500, headers: baseHeaders(origin) });
  }
}
