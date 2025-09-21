const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setViewport({ width: 1366, height: 800 });

  try {
    await page.goto("http://localhost:5173", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Try to navigate to admin orders page — common routes: /admin/orders, /admin
    const adminPaths = [
      "/admin/orders",
      "/admin",
      "/dashboard",
      "/admin/orders/list",
    ];
    let found = false;
    for (const p of adminPaths) {
      try {
        await page.goto(`http://localhost:5173${p}`, {
          waitUntil: "networkidle2",
          timeout: 10000,
        });
        // check for table or order list
        const has =
          (await page.$("table")) ||
          (await page.$('[data-testid="orders-list"]')) ||
          (await page.$("text/รายการคำสั่งซื้อ"));
        if (has) {
          found = true;
          break;
        }
      } catch (e) {}
    }

    if (!found) {
      // fallback: stay on root and try to find links
      // attempt to click any link that contains 'admin' or 'orders'
      const links = await page.$$("a");
      for (const a of links) {
        const txt = (
          await page.evaluate((el) => el.innerText || el.textContent, a)
        ).toLowerCase();
        if (
          txt.includes("admin") ||
          txt.includes("คำสั่งซื้อ") ||
          txt.includes("orders")
        ) {
          await a.click();
          await page.waitForTimeout(1200);
          break;
        }
      }
    }

    // Wait for an order row and click first row's details button
    await page.waitForSelector('table, [data-testid="orders-list"]', {
      timeout: 10000,
    });
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
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: "order_modal_screenshot.png",
      fullPage: false,
    });
    console.log("Screenshot saved to client/order_modal_screenshot.png");
  } catch (err) {
    console.error("Failed to capture screenshot:", err.message || err);
  } finally {
    await browser.close();
  }
})();
