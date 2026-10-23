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

    await transporter.sendMail({
      from: `"${siteName}" <${user}>`,
      to: email,
      subject: "[Confirmation] Purchase confirmed",
      text: [
        "Your Clean Cakes Library Is Ready",
        "",
        "Welcome to Clean Cakes! Your collection of delicious, sugar-free recipes is now yours to explore.",
        "",
        "Explore my recipe library: https://lnk.bio/thank-you",
        "",
        "Keep your access link safe: https://lnk.bio/thank-you",
        "",
        "Clean Cakes © 2026",
      ].join("\n"),
      html: `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Clean Cakes Library Is Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f1e9dd;font-family:Arial,Helvetica,sans-serif;direction:ltr;text-align:left;">
  <div style="display:none;font-size:1px;max-height:0;opacity:0;overflow:hidden;">
    Your Clean Cakes recipe collection is ready.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="ltr" style="background-color:#f1e9dd;direction:ltr;">
    <tr>
      <td align="center" style="padding:30px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="ltr" style="max-width:600px;background-color:#fffdf9;border-radius:14px;overflow:hidden;direction:ltr;">
          <tr>
            <td align="center" bgcolor="#324b3c" style="padding:36px 20px;text-align:center;">
              <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#e1d6c1;">
                THE CLEAN CAKES COLLECTION
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:38px;font-weight:normal;color:#ffffff;">
                Clean Cakes
              </h1>
              <p style="margin:12px 0 0;font-size:11px;letter-spacing:2px;color:#e1d6c1;">
                BAKE BETTER. FEEL BETTER.
              </p>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding:36px 30px 28px;text-align:left;">
              <p style="margin:0 0 15px;font-size:11px;font-weight:bold;letter-spacing:1.2px;color:#a16e43;line-height:1.6;">
                A LITTLE SOMETHING SWEET, JUST FOR YOU
              </p>
              <h2 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:normal;line-height:1.25;color:#324b3c;">
                Your baking journey starts here.
              </h2>
              <p style="margin:0;font-size:15px;line-height:1.9;color:#5f5b51;">
                Welcome to Clean Cakes! Your collection of delicious, sugar-free recipes is now yours to explore.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 30px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#324b3c" style="border-radius:8px;">
                    <a href="https://lnk.bio/thank-you" target="_blank" style="display:block;padding:19px 12px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;text-align:center;direction:ltr;">
                      Explore My Recipe Library &nbsp; &#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f2e9" style="border-radius:10px;">
                <tr>
                  <td align="left" style="padding:22px;text-align:left;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" dir="ltr">
                      <tr>
                        <td valign="middle" style="padding-right:10px;">
                          <img src="https://img.icons8.com/ios/50/a16e43/bookmark-ribbon.png" width="22" height="22" alt="" style="display:block;border:0;">
                        </td>
                        <td valign="middle">
                          <h4 style="margin:0;font-size:15px;color:#324b3c;">
                            Keep your access link safe
                          </h4>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:14px 0 16px;font-size:13px;line-height:1.8;color:#777167;">
                      Save this email so you can always find your collection again.
                    </p>
                    <a href="https://lnk.bio/thank-you" target="_blank" style="color:#a16e43;font-size:13px;text-decoration:underline;word-break:break-all;">
                      https://lnk.bio/thank-you
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 20px 32px;text-align:center;">
              <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16px;color:#324b3c;">
                Made for your sweetest moments.
              </p>
              <p style="margin:0;font-size:11px;color:#948a7d;">
                Clean Cakes &nbsp;&middot;&nbsp; &copy; 2026
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      headers: {
        "X-Order-Number": orderNumber,
        ...(total ? { "X-Order-Total": total.replace(/[\r\n]/g, " ") } : {}),
        ...(date ? { "X-Order-Date": date.replace(/[\r\n]/g, " ") } : {}),
      },
    });

    return NextResponse.json({ ok: true }, { headers: baseHeaders(origin) });
  } catch (err) {
    seen.delete(orderNumber);
    console.error("notify-order: send failed", err);
    return NextResponse.json({ ok: false, error: "send failed" }, { status: 500, headers: baseHeaders(origin) });
  }
}
