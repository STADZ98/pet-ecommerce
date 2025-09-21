const fetch = require("node-fetch");

/**
 * Simple Shipping Controller
 * - Exposes `track` which accepts { carrier, tracking }
 * - For each supported carrier, calls the provider API or returns a mocked response
 * NOTE: Provider integrations often require API keys and specific request formats.
 * Put credentials in environment variables and update provider handlers accordingly.
 */
const supported = ["ไปรษณีย์ไทย", "Flash", "J&T", "Kerry", "Ninjavan"];

function normalizeCarrierName(name) {
  if (!name) return "";
  const n = String(name).toLowerCase();
  if (n.includes("flash")) return "Flash";
  if (n.includes("j&t") || n.includes("jnt")) return "J&T";
  if (n.includes("kerry")) return "Kerry";
  if (n.includes("ninjavan")) return "Ninjavan";
  if (n.includes("ไปรษณีย์") || n.includes("post")) return "ไปรษณีย์ไทย";
  return name;
}

async function track(req, res) {
  const { carrier, tracking } = req.body || {};
  if (!carrier || !tracking)
    return res
      .status(400)
      .json({ message: "carrier and tracking are required" });

  try {
    // Normalize provider
    const prov = normalizeCarrierName(carrier);
    if (!supported.includes(prov)) {
      return res
        .status(400)
        .json({ message: "unsupported carrier", carrier: prov });
    }

    // Dispatch to provider handlers
    switch (prov) {
      case "ไปรษณีย์ไทย":
        return await trackThaiPost(tracking, res);
      case "Flash":
        return await trackFlash(tracking, res);
      case "J&T":
        return await trackJNT(tracking, res);
      default:
        return res
          .status(501)
          .json({ message: "provider integration not implemented" });
    }
  } catch (err) {
    console.error("track error", err);
    return res
      .status(500)
      .json({ message: "internal error", error: String(err) });
  }
}

// Example: Thailand Post
async function trackThaiPost(tracking, res) {
  // Use generic provider request helper
  const prefix = "THAI_POST";
  // If THAI_API_KEY exists, send in headers (some Thailand Post APIs require an API key)
  const extraHeaders = {};
  if (process.env.THAI_API_KEY) {
    extraHeaders["Authorization"] = `Bearer ${process.env.THAI_API_KEY}`;
  }
  const result = await performProviderRequest(prefix, tracking, extraHeaders);
  if (result.mocked)
    return res.json({
      provider: "ไปรษณีย์ไทย",
      tracking,
      events: result.events || null,
      warning: result.warning,
    });
  if (result.error) {
    // Configurable behavior: by default, fall back to mocked events so UI doesn't get a hard 502
    // Set FALLBACK_ON_PROVIDER_ERROR=false in environment to preserve 502 behavior.
    if (process.env.FALLBACK_ON_PROVIDER_ERROR === "false") {
      return res
        .status(502)
        .json({ message: "thai post request failed", error: result.error });
    }
    return res.json({
      provider: "ไปรษณีย์ไทย",
      tracking,
      events: result.events || [
        {
          time: new Date().toISOString(),
          status: "Provider unavailable - mocked",
        },
      ],
      warning: `Provider error: ${result.error}`,
    });
  }
  const data = result.data;
  const events = extractEventsFromResponse(data) || null;
  return res.json({ provider: "ไปรษณีย์ไทย", tracking, events });
}

// Example: Flash Express (public API may require API key)
async function trackFlash(tracking, res) {
  // Configs: FLASH_TRACK_URL, FLASH_API_KEY
  const prefix = "FLASH";
  const result = await performProviderRequest(prefix, tracking);
  if (result.mocked)
    return res.json({
      provider: "Flash",
      tracking,
      events: result.events || null,
      warning: result.warning,
    });
  if (result.error) {
    if (process.env.FALLBACK_ON_PROVIDER_ERROR === "false") {
      return res
        .status(502)
        .json({
          message: "flash provider request failed",
          error: result.error,
        });
    }
    return res.json({
      provider: "Flash",
      tracking,
      events: result.events || [
        {
          time: new Date().toISOString(),
          status: "Provider unavailable - mocked",
        },
      ],
      warning: `Provider error: ${result.error}`,
    });
  }
  const data = result.data;
  const events = extractEventsFromResponse(data) || null;
  return res.json({ provider: "Flash", tracking, events });
}

// Example: J&T (placeholder)
async function trackJNT(tracking, res) {
  const prefix = "JNT";
  const result = await performProviderRequest(prefix, tracking);
  if (result.mocked)
    return res.json({
      provider: "J&T",
      tracking,
      events: result.events || null,
      warning: result.warning,
    });
  if (result.error) {
    if (process.env.FALLBACK_ON_PROVIDER_ERROR === "false") {
      return res
        .status(502)
        .json({ message: "j&t provider request failed", error: result.error });
    }
    return res.json({
      provider: "J&T",
      tracking,
      events: result.events || [
        {
          time: new Date().toISOString(),
          status: "Provider unavailable - mocked",
        },
      ],
      warning: `Provider error: ${result.error}`,
    });
  }
  const data = result.data;
  const events = extractEventsFromResponse(data) || null;
  return res.json({ provider: "J&T", tracking, events });
}

async function performProviderRequest(prefix, tracking, extraHeaders = {}) {
  // Env variable patterns: <PREFIX>_TRACK_URL, <PREFIX>_TRACK_METHOD, <PREFIX>_TRACK_HEADERS (JSON), <PREFIX>_TRACK_BODY (template)
  const urlTemplate = process.env[`${prefix}_TRACK_URL`];
  if (!urlTemplate) {
    return {
      mocked: true,
      warning: `Missing ${prefix}_TRACK_URL in environment`,
      events: [{ time: new Date().toISOString(), status: "Mocked" }],
    };
  }
  const url = urlTemplate.replace("{tracking}", encodeURIComponent(tracking));
  const method = (process.env[`${prefix}_TRACK_METHOD`] || "GET").toUpperCase();
  let headers = { Accept: "application/json" };
  if (process.env[`${prefix}_TRACK_HEADERS`]) {
    try {
      headers = {
        ...headers,
        ...(JSON.parse(process.env[`${prefix}_TRACK_HEADERS`]) || {}),
      };
    } catch (e) {
      /* ignore parse error */
    }
  }
  // Merge extraHeaders (explicit) last so they override env headers if needed
  headers = { ...headers, ...(extraHeaders || {}) };
  const bodyTemplate = process.env[`${prefix}_TRACK_BODY`];
  let opts = { method, headers };
  if (method === "POST" || method === "PUT") {
    const body = bodyTemplate
      ? bodyTemplate.replace("{tracking}", tracking)
      : JSON.stringify({ tracking });
    opts.body = body;
    if (!opts.headers["Content-Type"])
      opts.headers["Content-Type"] = "application/json";
  }
  try {
    const resp = await fetchWithTimeout(url, opts, 10000);
    const data = await resp.json();
    return { url, data };
  } catch (err) {
    return { error: String(err) };
  }
}

async function fetchWithTimeout(url, opts = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return resp;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function extractEventsFromResponse(data) {
  if (!data) return null;
  // Common patterns: data.events, data.tracking.events, data.data.history, data.tracking_history
  if (Array.isArray(data.events)) return normalizeEvents(data.events);
  if (data.tracking && Array.isArray(data.tracking.events))
    return normalizeEvents(data.tracking.events);
  if (data.data && Array.isArray(data.data.history))
    return normalizeEvents(data.data.history);
  if (Array.isArray(data.tracking_history))
    return normalizeEvents(data.tracking_history);

  // Flash example: may return { data: { track: [...] } }
  if (data.data && data.data.track && Array.isArray(data.data.track))
    return normalizeEvents(data.data.track);

  // Try to find any array of objects with time/date/timestamp keys
  const arr = findFirstEventsArray(data);
  if (arr) return normalizeEvents(arr);

  return null;
}

function normalizeEvents(arr) {
  return arr.map((e) => {
    // Try common fields
    const time =
      e.time ||
      e.datetime ||
      e.timestamp ||
      e.date ||
      e.status_time ||
      e.event_time;
    const status =
      e.status || e.description || e.message || e.status_description || e.event;
    const location = e.location || e.place || e.area || e.branch;
    return { time, status, location, raw: e };
  });
}

function findFirstEventsArray(obj) {
  if (!obj || typeof obj !== "object") return null;
  for (const k of Object.keys(obj)) {
    if (
      Array.isArray(obj[k]) &&
      obj[k].length > 0 &&
      typeof obj[k][0] === "object"
    )
      return obj[k];
  }
  return null;
}

// Lookup an order in our database by tracking code and optionally fetch provider events
async function lookupOrderByTracking(req, res) {
  try {
    const tracking = (
      req.query.tracking ||
      req.query.trackingNumber ||
      ""
    ).trim();
    if (!tracking)
      return res.status(400).json({ message: "tracking query required" });

    // Lazy-load prisma to avoid circular requires
    const prisma = require("../config/prisma");

    const order = await prisma.order.findFirst({
      where: { trackingCode: tracking },
      include: {
        address: true,
        orderedBy: true,
        products: { include: { product: true, variant: true } },
      },
    });

    if (!order)
      return res
        .status(404)
        .json({ message: "ไม่พบคำสั่งซื้อสำหรับรหัสติดตามนี้" });

    // Try to detect provider from tracking pattern (basic heuristics)
    let providerGuess = null;
    const t = tracking.toUpperCase();
    if (t.endsWith("TH") || t.startsWith("EG") || t.match(/^TH/))
      providerGuess = "ไปรษณีย์ไทย";
    else if (/^JNT|^J&T|^JNT/.test(t)) providerGuess = "J&T";
    else if (/^KERRY|^KRY|^KY/.test(t)) providerGuess = "Kerry";
    else if (t.length >= 10 && /[A-Z]{2}\d{9}[A-Z]{2}/.test(t))
      providerGuess = "ไปรษณีย์ไทย";

    let trackingEvents = null;
    if (providerGuess) {
      try {
        // Reuse provider tracking logic: call performProviderRequest via track handlers
        const normalized = providerGuess;
        // Use performProviderRequest helper if available
        const prefixMap = {
          ไปรษณีย์ไทย: "THAI_POST",
          Flash: "FLASH",
          "J&T": "JNT",
          Kerry: "KERRY",
          Ninjavan: "NINJA",
        };
        const prefix = prefixMap[normalized];
        if (prefix) {
          const result = await performProviderRequest(prefix, tracking);
          if (result && result.data)
            trackingEvents = extractEventsFromResponse(result.data) || null;
        }
      } catch (e) {
        console.warn("provider lookup failed", e?.message || e);
      }
    }

    const summary = {
      id: order.id,
      createdAt: order.createdAt,
      cartTotal: order.cartTotal,
      trackingCarrier: order.trackingCarrier || providerGuess,
      trackingCode: order.trackingCode,
      orderStatus: order.orderStatus,
      address: order.address || null,
      orderedBy: order.orderedBy || null,
    };

    return res.json({ ok: true, order: summary, events: trackingEvents });
  } catch (err) {
    console.error("lookupOrderByTracking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { track, lookupOrderByTracking };
