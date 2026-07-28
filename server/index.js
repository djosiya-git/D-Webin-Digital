import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import { initDatabase, pool } from "./db.js";

dotenv.config({ path: "server/.env" });

const app = express();
const port = Number(process.env.PORT || 3001);
const sessions = new Map();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultProjects = [
  {
    category: "Web App",
    title: "Sistem Absensi Sekolah",
    description:
      "Dashboard absensi siswa dengan notifikasi WhatsApp dan integrasi mesin fingerprint.",
    details:
      "Sistem manajemen absensi yang menangani data siswa, log fingerprint, status kehadiran, notifikasi orang tua, serta laporan real-time untuk kebutuhan sekolah.",
    stack: ["CodeIgniter 4", "MySQL", "Bootstrap"],
    accent: "purple",
    demoUrl: "#contact",
    sourceUrl: "https://github.com/",
  },
  {
    category: "Frontend",
    title: "Portfolio Developer",
    description:
      "Website personal responsif dengan micro-interactions dan pengalaman pengguna modern.",
    details:
      "Portfolio yang berfokus pada visual modern, kemudahan navigasi, performa ringan, dan presentasi proyek yang mudah dipahami.",
    stack: ["React", "CSS", "Vite"],
    accent: "blue",
    demoUrl: "#home",
    sourceUrl: "https://github.com/",
  },
];

const defaultContent = [
  ["service", "Company Profile", "Website profil bisnis", "Website profesional untuk memperkenalkan bisnis, layanan, profil usaha, dan kontak.", {}, 1],
  ["service", "Landing Page", "Promosi produk atau jasa", "Halaman promosi yang fokus mengarahkan calon pelanggan untuk menghubungi Anda.", {}, 2],
  ["service", "Website Sekolah", "Profil sekolah dan PPDB", "Website informasi sekolah, profil lembaga, berita, halaman PPDB, dan sistem sederhana.", {}, 3],
  ["service", "Custom Web App", "Sistem sesuai kebutuhan", "Dashboard, sistem absensi, data siswa, katalog, atau aplikasi internal.", {}, 4],
  ["pricing", "Basic", "Mulai 750rb", "Cocok untuk landing page sederhana atau portfolio personal.", { items: ["1 halaman", "Responsive mobile", "Form kontak", "Revisi ringan"] }, 1],
  ["pricing", "Standard", "Mulai 1,5jt", "Cocok untuk company profile, jasa, sekolah, atau UMKM.", { items: ["3-5 halaman", "Desain custom", "Integrasi WhatsApp", "Optimasi dasar"] }, 2],
  ["pricing", "Custom", "Diskusi dulu", "Untuk sistem web dengan dashboard, login, database, dan fitur khusus.", { items: ["Fitur sesuai kebutuhan", "Admin panel", "Database MySQL", "Support deploy"] }, 3],
  ["faq", "Berapa lama pengerjaan website?", "", "Landing page biasanya 3-7 hari. Website company profile sekitar 1-2 minggu.", {}, 1],
  ["faq", "Apakah bisa request desain?", "", "Bisa. Anda boleh membawa referensi, warna brand, logo, atau contoh website yang disukai.", {}, 2],
  ["testimonial", "Klien Pertama", "UMKM / Sekolah", "Website rapi, mudah dipahami, dan proses pengerjaannya jelas.", { rating: 5 }, 1],
  ["page_content", "Hero Website", "Website profesional untuk bisnis dan sekolah", "Kami membantu membuat website responsif, cepat, dan mudah digunakan.", {}, 1],
];

const defaultSettings = [
  ["brand_name", "DWebin Digital"],
  ["whatsapp", "6281234567890"],
  ["email", "djosiyawahyudianto14@gmail.com"],
  ["github", "https://github.com/"],
  ["linkedin", "https://www.linkedin.com/"],
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use((req, _res, next) => {
  if (req.url === "/nodeapp") {
    req.url = "/";
  } else if (req.url.startsWith("/nodeapp/")) {
    req.url = req.url.slice("/nodeapp".length);
  }
  next();
});

app.get("/", (_req, res) => {
  res
    .type("html")
    .send("<!doctype html><html><body><h1>DWebin API is running</h1></body></html>");
});

function mapProject(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    desc: row.description,
    details: row.details || row.description,
    stack: JSON.parse(row.stack_json || "[]"),
    accent: row.accent || "blue",
    links: {
      demo: row.demo_url || "#contact",
      github: row.source_url || "https://github.com/",
    },
  };
}

function mapContent(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle || "",
    body: row.body || "",
    meta: JSON.parse(row.meta_json || "{}"),
    sortOrder: row.sort_order || 0,
  };
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  const user = sessions.get(token);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  next();
}

async function ensureSeedData() {
  const [[userCount]] = await pool.query("SELECT COUNT(*) AS total FROM users");
  if (userCount.total === 0) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await pool.query(
      "INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)",
      ["Djosiya Admin", "admin", passwordHash, "admin"],
    );
  }

  const [[projectCount]] = await pool.query(
    "SELECT COUNT(*) AS total FROM projects",
  );
  if (projectCount.total === 0) {
    for (const project of defaultProjects) {
      await pool.query(
        `INSERT INTO projects
          (category, title, description, details, stack_json, accent, demo_url, source_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.category,
          project.title,
          project.description,
          project.details,
          JSON.stringify(project.stack),
          project.accent,
          project.demoUrl,
          project.sourceUrl,
        ],
      );
    }
  }

  const [[contentCount]] = await pool.query(
    "SELECT COUNT(*) AS total FROM content_items",
  );
  if (contentCount.total === 0) {
    for (const item of defaultContent) {
      await pool.query(
        `INSERT INTO content_items
          (type, title, subtitle, body, meta_json, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [item[0], item[1], item[2], item[3], JSON.stringify(item[4]), item[5]],
      );
    }
  }

  for (const [key, value] of defaultSettings) {
    await pool.query(
      "INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)",
      [key, value],
    );
  }
  await pool.query(
    "UPDATE settings SET setting_value = ? WHERE setting_key = ? AND setting_value = ?",
    ["DWebin Digital", "brand_name", "Djosiya Web Studio"],
  );
  await pool.query(
    "UPDATE content_items SET body = REPLACE(body, 'Saya membantu', 'Kami membantu') WHERE type = ?",
    ["page_content"],
  );
}

let databaseStatus = "initializing";
let databaseReady = false;
let databaseError = "";

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: databaseReady ? "ready" : databaseStatus,
    error: databaseError,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  const user = users[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Username atau password salah." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const sessionUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
  };

  sessions.set(token, sessionUser);
  res.json({ token, user: sessionUser });
});

app.post("/api/auth/logout", authRequired, (req, res) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  sessions.delete(token);
  res.json({ ok: true });
});

app.get("/api/projects", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM projects ORDER BY id DESC");
  res.json(rows.map(mapProject));
});

app.post("/api/projects", authRequired, async (req, res) => {
  const project = req.body;
  const [result] = await pool.query(
    `INSERT INTO projects
      (category, title, description, details, stack_json, accent, demo_url, source_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      project.category,
      project.title,
      project.desc,
      project.details || project.desc,
      JSON.stringify(project.stack || []),
      project.accent || "blue",
      project.links?.demo || "#contact",
      project.links?.github || "https://github.com/",
    ],
  );

  const [[row]] = await pool.query("SELECT * FROM projects WHERE id = ?", [
    result.insertId,
  ]);
  res.status(201).json(mapProject(row));
});

app.put("/api/projects/:id", authRequired, async (req, res) => {
  const project = req.body;
  await pool.query(
    `UPDATE projects
     SET category = ?, title = ?, description = ?, details = ?, stack_json = ?,
         accent = ?, demo_url = ?, source_url = ?
     WHERE id = ?`,
    [
      project.category,
      project.title,
      project.desc,
      project.details || project.desc,
      JSON.stringify(project.stack || []),
      project.accent || "blue",
      project.links?.demo || "#contact",
      project.links?.github || "https://github.com/",
      req.params.id,
    ],
  );
  const [[row]] = await pool.query("SELECT * FROM projects WHERE id = ?", [
    req.params.id,
  ]);
  res.json(mapProject(row));
});

app.delete("/api/projects/:id", authRequired, async (req, res) => {
  await pool.query("DELETE FROM projects WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/messages", authRequired, async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM messages ORDER BY id DESC");
  res.json(rows);
});

app.post("/api/messages", async (req, res) => {
  const { name, email, message } = req.body;
  const [result] = await pool.query(
    "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
  );
  res.status(201).json({ id: result.insertId, name, email, message });
});

app.put("/api/messages/:id", authRequired, async (req, res) => {
  const { name, email, message } = req.body;
  await pool.query(
    "UPDATE messages SET name = ?, email = ?, message = ? WHERE id = ?",
    [name, email, message, req.params.id],
  );
  res.json({ id: Number(req.params.id), name, email, message });
});

app.delete("/api/messages/:id", authRequired, async (req, res) => {
  await pool.query("DELETE FROM messages WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/content/:type", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM content_items WHERE type = ? ORDER BY sort_order ASC, id DESC",
    [req.params.type],
  );
  res.json(rows.map(mapContent));
});

app.post("/api/content/:type", authRequired, async (req, res) => {
  const { title, subtitle, body, meta, sortOrder } = req.body;
  const [result] = await pool.query(
    `INSERT INTO content_items (type, title, subtitle, body, meta_json, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.params.type,
      title,
      subtitle || "",
      body || "",
      JSON.stringify(meta || {}),
      sortOrder || 0,
    ],
  );
  const [[row]] = await pool.query("SELECT * FROM content_items WHERE id = ?", [
    result.insertId,
  ]);
  res.status(201).json(mapContent(row));
});

app.put("/api/content/:type/:id", authRequired, async (req, res) => {
  const { title, subtitle, body, meta, sortOrder } = req.body;
  await pool.query(
    `UPDATE content_items
     SET title = ?, subtitle = ?, body = ?, meta_json = ?, sort_order = ?
     WHERE type = ? AND id = ?`,
    [
      title,
      subtitle || "",
      body || "",
      JSON.stringify(meta || {}),
      sortOrder || 0,
      req.params.type,
      req.params.id,
    ],
  );
  const [[row]] = await pool.query("SELECT * FROM content_items WHERE id = ?", [
    req.params.id,
  ]);
  res.json(mapContent(row));
});

app.delete("/api/content/:type/:id", authRequired, async (req, res) => {
  await pool.query("DELETE FROM content_items WHERE type = ? AND id = ?", [
    req.params.type,
    req.params.id,
  ]);
  res.json({ ok: true });
});

app.get("/api/settings", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM settings ORDER BY setting_key");
  res.json(
    rows.reduce((result, row) => {
      result[row.setting_key] = row.setting_value || "";
      return result;
    }, {}),
  );
});

app.put("/api/settings", authRequired, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value],
    );
  }
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

initDatabase()
  .then(ensureSeedData)
  .then(() => {
    databaseReady = true;
    databaseStatus = "ready";
    databaseError = "";
  })
  .catch((error) => {
    databaseReady = false;
    databaseStatus = "error";
    databaseError = error.message;
    console.error("Database is not ready:", error.message);
  });
