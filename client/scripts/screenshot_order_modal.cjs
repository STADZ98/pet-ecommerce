const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setViewport({ width: 1366, height: 800 });

  const path = require("path");
  const fs = require("fs");
  const outDir = path.resolve(__dirname, "..", "screenshots");

  try {
    const clientPort = process.env.CLIENT_PORT || "5173";
    const baseUrl = `http://localhost:${clientPort}`;
    // If FORCE_INJECT_MODAL is set, inject a static modal into about:blank and screenshot immediately
    if (
      process.env.FORCE_INJECT_MODAL === "1" ||
      process.env.FORCE_INJECT_MODAL === "true"
    ) {
      await page.goto("about:blank");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      await page.evaluate(() => {
        const modal = document.createElement("div");
        modal.setAttribute("role", "dialog");
        modal.style.position = "fixed";
        modal.style.left = "50%";
        modal.style.top = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.width = "900px";
        modal.style.maxHeight = "80vh";
        modal.style.overflow = "auto";
        modal.style.background = "#fff";
        modal.style.borderRadius = "24px";
        modal.style.boxShadow = "0 20px 50px rgba(0,0,0,0.15)";
        modal.style.padding = "24px";
        modal.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div>
              <h3 style="margin:0;font-size:20px">รายละเอียดคำสั่งซื้อ</h3>
              <div style="color:#6b7280;font-size:13px">วันที่: ${new Date().toLocaleString()}</div>
            </div>
            <div style="font-weight:600;color:#2563eb">สถานะ: กำลังดำเนินการ</div>
          </div>
          <div style="display:flex;gap:16px">
            <div style="flex:1">
              <h4 style="margin:0 0 8px 0">รายการสินค้า</h4>
              <div style="background:#f8fafc;padding:12px;border-radius:8px">ของเล่นแมว x2 — 500 บาท/ชิ้น</div>
            </div>
            <div style="width:300px">
              <h4 style="margin:0 0 8px 0">การจัดส่ง</h4>
              <div style="background:#fff;border:1px solid #e5e7eb;padding:12px;border-radius:8px">
                <div style="margin-bottom:8px"><strong>ผู้ให้บริการ:</strong> ไปรษณีย์</div>
                <div style="margin-bottom:8px"><strong>รหัสติดตาม:</strong> <code style="background:#f1f5f9;padding:2px 6px;border-radius:6px">TRACK123456</code></div>
                <div><a href="#" target="_blank">เปิดหน้าติดตามผู้ให้บริการ</a></div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      });
      const injectedPath = path.join(outDir, "order-modal-injected.png");
      await page.screenshot({ path: injectedPath, fullPage: false });
      console.log(
        "FORCE_INJECT_MODAL: injected modal screenshot saved to",
        injectedPath
      );
      await browser.close();
      return;
    }

    // Optional: mock admin API responses to allow rendering without full auth flow.
    const shouldMock =
      process.env.MOCK_ADMIN === "1" || process.env.MOCK_ADMIN === "true";
    if (shouldMock) {
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const url = req.url();
        // console debug to trace matched requests
        // Note: this will print a lot; it's temporary for debugging
        // console.log('Request:', url);
        if (url.includes("/api/admin/profile")) {
          return req.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              name: "Admin Tester",
              email: "admin-test@example.com",
            }),
          });
        }
        if (url.includes("/api/admin/orders")) {
          console.log("Mocking admin/orders request:", url);
          const now = new Date().toISOString();
          const orders = [
            {
              id: 1,
              createdAt: now,
              updatedAt: now,
              orderStatus: "PROCESSING",
              cartTotal: 1000,
              shippingFee: 50,
              name: "คุณผู้ซื้อ",
              email: "customer@example.com",
              address: {
                name: "คุณผู้ซื้อ",
                address: "บ้านเลขที่ 1",
                telephone: "0812345678",
              },
              products: [
                {
                  product: {
                    _id: "p1",
                    title: "ของเล่นแมว",
                    images: [],
                    category: { name: "ของเล่น" },
                  },
                  variant: null,
                  price: 500,
                  count: 2,
                },
              ],
              trackingCarrier: "ไปรษณีย์",
              trackingCode: "TRACK123456",
            },
          ];
          return req.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(orders),
          });
        }
        // Allow other requests to pass through (static files, assets)
        return req.continue();
      });
    }
    // If an ADMIN_TOKEN env var is provided, seed the client's persisted store
    // (Zustand persist uses the key 'PetShopOnline') so the app has an auth token.
    const adminToken = process.env.ADMIN_TOKEN || null;
    if (adminToken) {
      await page.goto("about:blank");
      await page.evaluate((token) => {
        try {
          // Persist both token and a minimal user object so ProtectRouteAdmin passes the `user && token` check.
          localStorage.setItem(
            "PetShopOnline",
            JSON.stringify({ token, user: { email: "admin-test@example.com" } })
          );
        } catch (e) {
          // ignore
        }
      }, adminToken);
    }

    // If ADMIN_EMAIL and ADMIN_PASSWORD provided, perform login flow on the client (outside page.evaluate)
    const adminEmail = process.env.ADMIN_EMAIL || null;
    const adminPassword = process.env.ADMIN_PASSWORD || null;
    if (adminEmail && adminPassword) {
      // Navigate to login page and perform login
      await page.goto(`${baseUrl}/login`, {
        waitUntil: "networkidle2",
        timeout: 20000,
      });
      // Fill email and password fields and submit
      await page.type('input[name="email"]', adminEmail, { delay: 20 });
      await page.type('input[name="password"]', adminPassword, { delay: 20 });
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }),
      ]).catch(() => {});
      // give the app a moment to persist state
      await page.waitForTimeout(1200);
    }

    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Navigate to admin root (ProtectRoute may redirect); give the app time to hydrate persisted store
    await page.goto(`${baseUrl}/admin`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait longer for orders table to appear (the app may fetch data after profile check)
    try {
      await page.waitForSelector(
        'table, [data-testid="orders-list"], text/รายการคำสั่งซื้อ, .orders-table',
        {
          timeout: 30000,
        }
      );
    } catch (err) {
      // Save debug artifacts to help diagnose why the table didn't render
      try {
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const fullPath = path.join(outDir, "admin_page_full.png");
        await page.screenshot({ path: fullPath, fullPage: true });
        const html = await page.content();
        fs.writeFileSync(path.join(outDir, "admin_page.html"), html);
        console.error(
          "Debug: saved",
          fullPath,
          "and admin_page.html in",
          outDir
        );
      } catch (e) {
        console.error("Failed to write debug artifacts:", e.message || e);
      }
      throw err;
    }
    // try to click first button that looks like 'รายละเอียด' or has PackageSearch icon
    const detailBtn = await page.$x(
      "//button[contains(., 'รายละเอียด') or contains(., 'Detail') or contains(., 'ดูรายละเอียด')]"
    );
    if (detailBtn.length > 0) {
      await detailBtn[0].click();
    } else {
      // fallback: click first row
      const firstRow = await page.$("table tbody tr");
      if (firstRow) await firstRow.click();
    }

    // wait for modal
    await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
    await page.waitForTimeout(800);
    const outPath = path.join(outDir, "order-modal.png");
    await page.screenshot({ path: outPath, fullPage: false });
    console.log("Screenshot saved to", outPath);
  } catch (err) {
    // If FORCE_INJECT_MODAL is set, inject a static modal for screenshotting
    if (
      process.env.FORCE_INJECT_MODAL === "1" ||
      process.env.FORCE_INJECT_MODAL === "true"
    ) {
      try {
        const fs = require("fs");
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        await page.evaluate(() => {
          const modal = document.createElement("div");
          modal.setAttribute("role", "dialog");
          modal.style.position = "fixed";
          modal.style.left = "50%";
          modal.style.top = "50%";
          modal.style.transform = "translate(-50%, -50%)";
          modal.style.width = "900px";
          modal.style.maxHeight = "80vh";
          modal.style.overflow = "auto";
          modal.style.background = "#fff";
          modal.style.borderRadius = "24px";
          modal.style.boxShadow = "0 20px 50px rgba(0,0,0,0.15)";
          modal.style.padding = "24px";
          modal.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div>
                <h3 style="margin:0;font-size:20px">รายละเอียดคำสั่งซื้อ</h3>
                <div style="color:#6b7280;font-size:13px">วันที่: ${new Date().toLocaleString()}</div>
              </div>
              <div style="font-weight:600;color:#2563eb">สถานะ: กำลังดำเนินการ</div>
            </div>
            <div style="display:flex;gap:16px">
              <div style="flex:1">
                <h4 style="margin:0 0 8px 0">รายการสินค้า</h4>
                <div style="background:#f8fafc;padding:12px;border-radius:8px">ของเล่นแมว x2 — 500 บาท/ชิ้น</div>
              </div>
              <div style="width:300px">
                <h4 style="margin:0 0 8px 0">การจัดส่ง</h4>
                <div style="background:#fff;border:1px solid #e5e7eb;padding:12px;border-radius:8px">
                  <div style="margin-bottom:8px"><strong>ผู้ให้บริการ:</strong> ไปรษณีย์</div>
                  <div style="margin-bottom:8px"><strong>รหัสติดตาม:</strong> <code style="background:#f1f5f9;padding:2px 6px;border-radius:6px">TRACK123456</code></div>
                  <div><a href="#" target="_blank">เปิดหน้าติดตามผู้ให้บริการ</a></div>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
        });
        const injectedPath = require("path").join(
          outDir,
          "order-modal-injected.png"
        );
        await page.screenshot({ path: injectedPath, fullPage: false });
        console.log(
          "Fallback injected modal screenshot saved to",
          injectedPath
        );
      } catch (e) {
        console.error("Failed to inject fallback modal:", e.message || e);
      }
    }
    console.error("Failed to capture screenshot:", err.message || err);
  } finally {
    await browser.close();
  }
})();
