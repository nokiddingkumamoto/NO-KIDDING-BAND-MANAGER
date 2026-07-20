const MEMBERS = new Set(["YAMA", "殿", "うっちー", "RYUTO", "じゅん", "マスター"]);
const STATUSES = new Set(["yes", "maybe", "no"]);
const TYPES = new Set(["studio", "live", "other"]);
const CATEGORIES = new Set(["tshirt", "sticker", "badge", "cd", "other"]);

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const text = (value, maximum = 200) => String(value ?? "").trim().slice(0, maximum);
const integer = value => Math.max(0, Math.floor(Number(value) || 0));
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value));
const validMonth = value => /^\d{4}-\d{2}$/.test(String(value));

const allData = async DB => {
  const results = await DB.batch([
    DB.prepare("SELECT id, type, name, date, start_time AS startTime, end_time AS endTime, location, notes, updated_at AS updatedAt FROM schedules ORDER BY date, start_time"),
    DB.prepare("SELECT date AS key, month, label FROM studio_dates ORDER BY date"),
    DB.prepare("SELECT member, date, status FROM studio_answers"),
    DB.prepare("SELECT id, name, category, details, price, stock, image, updated_at AS updatedAt FROM products ORDER BY category, name"),
    DB.prepare("SELECT id, product_id AS productId, product_name AS productName, quantity, unit_price AS unitPrice, sold_at AS soldAt FROM sales ORDER BY sold_at DESC LIMIT 500")
  ]);
  const answers = {};
  for (const row of results[2].results || []) {
    answers[row.member] ||= {};
    answers[row.member][row.date] = row.status;
  }
  return {
    schedules: results[0].results || [],
    studioDates: results[1].results || [],
    studioAnswers: answers,
    products: results[3].results || [],
    sales: results[4].results || [],
    serverTime: new Date().toISOString()
  };
};

export const onRequestGet = async context => {
  if (!context.env.DB) return json({ error: "Cloudflare D1のDBバインドが設定されていません。" }, 503);
  try { return json(await allData(context.env.DB)); }
  catch (error) { return json({ error: "共有データを読み込めませんでした。", detail: error.message }, 500); }
};

export const onRequestPost = async context => {
  const DB = context.env.DB;
  if (!DB) return json({ error: "Cloudflare D1のDBバインドが設定されていません。" }, 503);
  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: "送信データを確認してください。" }, 400); }

  try {
    switch (body.action) {
      case "schedule.save": {
        const item = body.item || {};
        if (!text(item.id, 100) || !TYPES.has(item.type) || !text(item.name, 60) || !validDate(item.date)) {
          return json({ error: "予定の入力内容を確認してください。" }, 400);
        }
        await DB.prepare(`INSERT INTO schedules
          (id, type, name, date, start_time, end_time, location, notes, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET type=excluded.type, name=excluded.name, date=excluded.date,
          start_time=excluded.start_time, end_time=excluded.end_time, location=excluded.location,
          notes=excluded.notes, updated_at=CURRENT_TIMESTAMP`)
          .bind(text(item.id, 100), item.type, text(item.name, 60), item.date,
            text(item.startTime, 5), text(item.endTime, 5), text(item.location, 80), text(item.notes, 500)).run();
        break;
      }
      case "schedule.delete":
        await DB.prepare("DELETE FROM schedules WHERE id = ?").bind(text(body.id, 100)).run();
        break;
      case "studio.addMonth": {
        if (!validMonth(body.month) || !Array.isArray(body.dates) || body.dates.length > 31) {
          return json({ error: "候補月の内容を確認してください。" }, 400);
        }
        const statements = body.dates
          .filter(item => validDate(item.key) && item.month === body.month)
          .map(item => DB.prepare("INSERT OR IGNORE INTO studio_dates (date, month, label) VALUES (?, ?, ?)")
            .bind(item.key, item.month, text(item.label, 30)));
        if (statements.length) await DB.batch(statements);
        break;
      }
      case "studio.answer": {
        if (!MEMBERS.has(body.member) || !validDate(body.date) || !STATUSES.has(body.status)) {
          return json({ error: "日程回答の内容を確認してください。" }, 400);
        }
        await DB.prepare(`INSERT INTO studio_answers (member, date, status, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(member, date) DO UPDATE SET status=excluded.status, updated_at=CURRENT_TIMESTAMP`)
          .bind(body.member, body.date, body.status).run();
        break;
      }
      case "studio.answers": {
        if (!MEMBERS.has(body.member) || !Array.isArray(body.answers) || body.answers.length > 31) {
          return json({ error: "日程回答の内容を確認してください。" }, 400);
        }
        const entries = body.answers.filter(item => validDate(item.date) && STATUSES.has(item.status));
        if (entries.length !== body.answers.length) return json({ error: "日程回答の内容を確認してください。" }, 400);
        if (entries.length) {
          await DB.batch(entries.map(item => DB.prepare(`INSERT INTO studio_answers (member, date, status, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(member, date) DO UPDATE SET status=excluded.status, updated_at=CURRENT_TIMESTAMP`)
            .bind(body.member, item.date, item.status)));
        }
        break;
      }
      case "product.save": {
        const item = body.item || {};
        if (!text(item.id, 100) || !text(item.name, 80) || !CATEGORIES.has(item.category)) {
          return json({ error: "商品の入力内容を確認してください。" }, 400);
        }
        await DB.prepare(`INSERT INTO products
          (id, name, category, details, price, stock, image, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name, category=excluded.category,
          details=excluded.details, price=excluded.price, stock=excluded.stock,
          image=excluded.image, updated_at=CURRENT_TIMESTAMP`)
          .bind(text(item.id, 100), text(item.name, 80), item.category, text(item.details, 100),
            integer(item.price), integer(item.stock), text(item.image, 200)).run();
        break;
      }
      case "product.delete":
        await DB.prepare("DELETE FROM products WHERE id = ?").bind(text(body.id, 100)).run();
        break;
      case "product.adjustStock": {
        const delta = Math.max(-10000, Math.min(10000, Math.trunc(Number(body.delta) || 0)));
        await DB.prepare("UPDATE products SET stock = MAX(0, stock + ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(delta, text(body.id, 100)).run();
        break;
      }
      case "sale.record": {
        const id = text(body.id, 100);
        const productId = text(body.productId, 100);
        const quantity = integer(body.quantity);
        const unitPrice = integer(body.unitPrice);
        const soldAt = text(body.soldAt, 40);
        if (!id || !productId || quantity < 1 || !soldAt) return json({ error: "販売内容を確認してください。" }, 400);
        await DB.batch([
          DB.prepare(`INSERT INTO sales (id, product_id, product_name, quantity, unit_price, sold_at)
            SELECT ?, id, name, ?, ?, ? FROM products WHERE id = ? AND stock >= ?`)
            .bind(id, quantity, unitPrice, soldAt, productId, quantity),
          DB.prepare(`UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND EXISTS (SELECT 1 FROM sales WHERE id = ?)`)
            .bind(quantity, productId, id)
        ]);
        const sale = await DB.prepare("SELECT id FROM sales WHERE id = ?").bind(id).first();
        if (!sale) return json({ error: "在庫数を超えています。最新データを読み直しました。" }, 409);
        break;
      }
      case "sale.undo": {
        const id = text(body.id, 100);
        await DB.batch([
          DB.prepare(`UPDATE products SET stock = stock + COALESCE((SELECT quantity FROM sales WHERE id = ?), 0),
            updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT product_id FROM sales WHERE id = ?)`)
            .bind(id, id),
          DB.prepare("DELETE FROM sales WHERE id = ?").bind(id)
        ]);
        break;
      }
      default:
        return json({ error: "未対応の操作です。" }, 400);
    }
    return json({ ok: true, data: await allData(DB) });
  } catch (error) {
    return json({ error: "共有データを保存できませんでした。", detail: error.message }, 500);
  }
};
