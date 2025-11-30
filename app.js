require("dotenv").config();
const fs = require("fs");
const path = require("path");
const input = require("input");
const { Telegraf } = require("telegraf");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const API_ID = Number(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_ID = Number(process.env.BOT_OWNER_ID || 0);
const DEFAULT_INTERVAL = Number(process.env.DEFAULT_INTERVAL_MINUTES || 10);

if (!API_ID || !API_HASH || !BOT_TOKEN || !OWNER_ID) {
  console.error(
    "❌ .env İçinde TELEGRAM_API_ID / TELEGRAM_API_HASH / TELEGRAM_BOT_TOKEN / BOT_OWNER_ID Eksik!"
  );
  process.exit(1);
}

const SESSION_FILE = path.join(__dirname, "session.txt");
const CONFIG_FILE = path.join(__dirname, "config.json");
const STATS_FILE = path.join(__dirname, "stats.json");

const defaultStats = {
  startedAt: new Date().toISOString(),
  lastResetAt: new Date().toISOString(),
  totalLoops: 0,
  totalSuccess: 0,
  totalFail: 0,
  avgLoopMs: 0,
  perTarget: {}
};

function loadStats() {
  try {
    if (!fs.existsSync(STATS_FILE)) {
      fs.writeFileSync(STATS_FILE, JSON.stringify(defaultStats, null, 2));
      return { ...defaultStats };
    }
    const raw = fs.readFileSync(STATS_FILE, "utf8");
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch (e) {
    log("Stats Verileri Okunamadı:", e.message);
    const base = { ...defaultStats };
    fs.writeFileSync(STATS_FILE, JSON.stringify(base, null, 2));
    return base;
  }
}

function saveStats(stats) {
  const merged = { ...defaultStats, ...stats };
  fs.writeFileSync(STATS_FILE, JSON.stringify(merged, null, 2));
  return merged;
}

function resetStats() {
  const base = {
    ...defaultStats,
    startedAt: new Date().toISOString(),
    lastResetAt: new Date().toISOString()
  };
  return saveStats(base);
}

function incSendStats(targetId, ok, errorMsg) {
  const stats = loadStats();
  if (!stats.perTarget[targetId]) {
    stats.perTarget[targetId] = {
      ok: 0,
      fail: 0,
      lastError: null,
      lastOkAt: null
    };
  }

  if (ok) {
    stats.totalSuccess++;
    stats.perTarget[targetId].ok++;
    stats.perTarget[targetId].lastOkAt = new Date().toISOString();
  } else {
    stats.totalFail++;
    stats.perTarget[targetId].fail++;
    stats.perTarget[targetId].lastError = errorMsg || "";
  }

  saveStats(stats);
}

function updateLoopTime(loopMs) {
  const stats = loadStats();
  stats.totalLoops++;
  const n = stats.totalLoops;
  stats.avgLoopMs =
    n === 1
      ? Math.round(loopMs)
      : Math.round(((stats.avgLoopMs * (n - 1)) + loopMs) / n);

  saveStats(stats);
}

const MAX_LOG_BUFFER = 100;
const logBuffer = [];

function log(...args) {
  const line = `${new Date().toISOString()} | ${args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ")}`;
  console.log(line);
  logBuffer.push(line);
  if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
}

const defaultConfig = {
  sourceChatId: null,
  targetChatIds: [],
  intervalMinutes: DEFAULT_INTERVAL,
  enabled: false,
  lastRunAt: null,
  sendMode: "last",
  fixedMessage: "",
  jitterSeconds: 0
};


function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      return { ...defaultConfig };
    }
    const raw = fs.readFileSync(CONFIG_FILE, "utf8");
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch (e) {
    log("Config Dosyası Okunamadı:", e.message);
    return { ...defaultConfig };
  }
}

function saveConfig(cfg) {
  const merged = { ...defaultConfig, ...cfg };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2));
  return merged;
}

async function initSession() {
  log("User Session İnit Başlıyor...");

  const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
    connectionRetries: 5
  });

  await client.start({
    phoneNumber: async () => await input.text("📞 Telegram Hesabınıza Bağlı Telefon Numaranızı, Örnekteki Gibi Giriniz. [+90 555 444 33 22]: "),
    password: async () => await input.text("🔒 Hesabınızın 2FA Parolası Varsa Eğer Lütfen Parolayı Giriniz. (Eğer 2Fa Parolanız Yoksa Enter Tuşuna Basarak Geçebilirsiniz): "),
    phoneCode: async () => await input.text("🔢 Telegram Hesabınıza Telegram Tarafından Gönderilen Kodu Yazıp Enter Tuşuna Basınız: "),
    onError: (err) => console.error(err)
  });

  fs.writeFileSync(SESSION_FILE, client.session.save());
  log("✅ Oturumunuz Başarıyla Oluşturuldu Ve Ana Dizine Kaydedildi. Lütfen session.txt Dosyanızı Silmeyiniz!");
  await client.sendMessage("me", { message: "Session OK" });
  process.exit(0);
}

let globalClient = null;

async function getUserClient() {
  if (globalClient) return globalClient;
//My Lion Brother @qUareXbey
  if (!fs.existsSync(SESSION_FILE)) {
    console.log("");
    console.log("❌ Merhaba! Telegram Oturumunuz Bulunamadı. Endişe Etmenize Gerek Yok. Hadi Hemen Yeni Bir Oturum Oluşturalım! ✨ Lütfen Aşağıya [npm run init-session] Yazıp, Enter Tuşuna Basarmısınız? Lütfen Sonra Size Sorulan Soruları Doğru Cevaplayınız.");
    process.exit(1);
  }

  const session = fs.readFileSync(SESSION_FILE, "utf8");
  const client = new TelegramClient(new StringSession(session), API_ID, API_HASH, {
    connectionRetries: 5
  });

  await client.connect();
  log("✅ Harika! Her Şey Yolunda Gözüküyor. Botumuz Artık Aktif! Botumuza Gidip [/start] Komutunu Vererek Yönetim Paneline Erişebilirsiniz.");
  globalClient = client;
  return client;
}
const bot = new Telegraf(BOT_TOKEN);
bot.use((ctx, next) => {
  if (!ctx.from || ctx.from.id !== OWNER_ID) {
    return;
  }
  return next();
});
const ownerState = {
  inputMode: null
};

function getStatusText(cfg) {
  return (
    "📋 *Mevcut Reklam Ayarları*\n\n" +
    `Reklam Kaynağı: \`${cfg.sourceChatId}\`\n` +
    `Reklam Hedefleri: \`${cfg.targetChatIds.join(", ") || "Yok"}\`\n` +
    `Reklam Aralığı: \`${cfg.intervalMinutes}\` Dakika\n` +
    `Jitter: \`${cfg.jitterSeconds}\` sn\n` +
    `Gönderim Modu: \`${cfg.sendMode === "last" ? "Seçilen Kaynaktaki Son Mesaj" : "Kullanıcının Belirlediği Sabit Mesaj"}\`\n` +
    (cfg.sendMode === "fixed" && cfg.fixedMessage
      ? `Sabit Mesaj: \`${cfg.fixedMessage.slice(0, 50)}${cfg.fixedMessage.length > 50 ? "..." : ""}\`\n`
      : "") +
    (cfg.lastRunAt ? `Son Çalışma: \`${cfg.lastRunAt}\`` : "")
  );
}


function mainKeyboard(cfg) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
        { text: "📍 Reklam Kaynağı", callback_data: "src_menu" },
        { text: "🎯 Reklam Hedefleri", callback_data: "tgt_menu" }
        ],
        [
        { text: "⏱ Reklam Zamanlama", callback_data: "time_menu" },
        { text: "📊 Reklam İstatistikleri", callback_data: "stats_menu" }
        ],
        [
        { text: "📋 Reklam Durumu", callback_data: "show_status" },
        { text: "🧪 Test", callback_data: "send_test" }
        ],
        [
        { text: "⚙ Gelişmiş", callback_data: "adv_menu" },
        { text: "📜 Reklam Logları", callback_data: "logs_menu" }
        ],
        [
        { text: cfg.enabled ? "⛔ Reklamları Durdur" : "▶ Reklamları Başlat", callback_data: cfg.enabled ? "disable" : "enable" }
        ]
      ]
    }
  };
}

bot.start((ctx) => {
  const cfg = loadConfig();
  ctx.reply(`
👋 *Merhaba!*

🛠 *Telegram Bot Reklam Paneline Hoş Geldiniz!*

ℹ️ Bu Bot Reklam Paneli, Telegram Hesabınız Üzerinden Tam Otomatik Mesaj İletimi Yapabilmeniz İçin Özenle Tasarlandı.

❇️ Aşağıdaki Butonları Kullanarak Tüm Ayarlarınızı Kolayca Yönetebilir, Reklamlarınızı İstediğiniz Gruplara Saniyeler İçinde Yönlendirebilirsiniz.

✨ *Neler Yapabilirsiniz?*

📍 Reklam Mesajlarınızın Alınacağı Kaynak Grubu Seçebilirsiniz.
🎯 Reklamların Gönderileceği Hedef Grupları Belirleyebilirsiniz.
⏱ Reklam Mesajlarınızın Gönderim Aralığını Yönetebilirsiniz.
📨 Sabit Veya Gruptaki Son Mesaj Modları Arasında Geçiş Yapabilirsiniz.
⚙ Gelişmiş Ayarlarla Tam Kontrol Sağlayabilirsiniz.
📜 Log Kayıtlarını Anlık İnceleyebilirsiniz.
🧪 Test Gönderimi Yaparak Sistemin Çalıştığını Doğrulayabilirsiniz.

🚀 *Her Şey Sizin İçin Kolay, Hızlı Ve Zahmetsiz Olacak Şekilde Tasarlandı.*

✅ *Hazırsanız, Aşağıdaki Menüden Dilediğiniz İşlemi Seçerek Başlayabilirsiniz!*
`, {
    parse_mode: "Markdown",
    ...mainKeyboard(cfg)
  });
});

bot.on("text", (ctx) => {
  if (!ctx.from || ctx.from.id !== OWNER_ID) return;

  const txt = ctx.message.text.trim();
  const cfg = loadConfig();

  if (ownerState.inputMode === "custom_interval") {
    const mins = Number(txt);
    if (!mins || mins < 1) {
      ownerState.inputMode = null;
      return ctx.reply("❌ Geçersiz Dakika Ayarlama İsteğiniz İptal Edildi.");
    }
    cfg.intervalMinutes = mins;
    saveConfig(cfg);
    ownerState.inputMode = null;
    return ctx.reply(`⏱ Özel Aralık Kaydedildi: ${mins} Dakika.`, mainKeyboard(cfg));
  }

  if (ownerState.inputMode === "fixed_message") {
    cfg.fixedMessage = txt;
    cfg.sendMode = "fixed";
    saveConfig(cfg);
    ownerState.inputMode = null;
    return ctx.reply("✅ Sabit Mesajınız Kaydedildi Ve, Reklam Modu SABİT Mesaj Olarak Ayarlandı.", mainKeyboard(cfg));
  }

  return ctx.reply("🛠 Paneli Butonlarla Kullanabilirsin.", mainKeyboard(cfg));
});

const PAGE_SIZE = 5;
async function fetchChats() {
  const client = await getUserClient();
  const dialogs = await client.getDialogs({});
  const chats = dialogs
    .filter((d) => !d.isUser)
    .map((d) => ({
      id: d.id,
      title: d.name || "Adsız",
      type: d.isChannel ? "Kanal" : d.isGroup ? "Grup" : "Diğer"
    }));
  return chats;
}

const selectionState = {
  mode: null,
  chats: [],
  page: 0,
  selectedTargets: new Set()
};

function safeEditMarkup(ctx, keyboard) {
  return ctx.editMessageReplyMarkup(keyboard.reply_markup).catch((e) => {
    if (!String(e.message).includes("message is not modified")) {
      console.error("editMessageReplyMarkup hatası:", e.message);
    }
  });
}

function buildSourceKeyboard() {
  const { chats, page } = selectionState;
  const totalPages = Math.max(1, Math.ceil(chats.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const pageItems = chats.slice(start, start + PAGE_SIZE);

  const rows = pageItems.map((c) => [
    {
      text: `📍 [${c.type}] ${c.title}`,
      callback_data: `src_set:${c.id}`
    }
  ]);

  const navRow = [];
  if (page > 0) navRow.push({ text: "⬅️", callback_data: "src_page:" + (page - 1) });
  navRow.push({ text: `Sayfa ${page + 1}/${totalPages}`, callback_data: "src_page:" + page });
  if (page < totalPages - 1) navRow.push({ text: "➡️", callback_data: "src_page:" + (page + 1) });

  rows.push(navRow);
  rows.push([{ text: "⬅️ Ana Menü", callback_data: "back_main" }]);

  return { reply_markup: { inline_keyboard: rows } };
}

function buildTargetsKeyboard() {
  const { chats, page, selectedTargets } = selectionState;
  const totalPages = Math.max(1, Math.ceil(chats.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const pageItems = chats.slice(start, start + PAGE_SIZE);

  const rows = pageItems.map((c) => {
    const selected = selectedTargets.has(c.id);
    return [
      {
        text: `${selected ? "✅" : "⬜"} [${c.type}] ${c.title}`,
        callback_data: `tgt_toggle:${c.id}`
      }
    ];
  });

  const navRow = [];
  if (page > 0) navRow.push({ text: "⬅️", callback_data: "tgt_page:" + (page - 1) });
  navRow.push({ text: `Sayfa ${page + 1}/${totalPages}`, callback_data: "tgt_page:" + page });
  if (page < totalPages - 1) navRow.push({ text: "➡️", callback_data: "tgt_page:" + (page + 1) });

  rows.push(navRow);
  rows.push([
    { text: "✅ Hepsini Seç", callback_data: "tgt_all" },
    { text: "🧹 Temizle", callback_data: "tgt_clear" }
  ]);
  rows.push([
    { text: "💾 Hedefleri Kaydet", callback_data: "tgt_save" },
    { text: "⬅️ Ana Menü", callback_data: "back_main" }
  ]);

  return { reply_markup: { inline_keyboard: rows } };
}

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const cfg = loadConfig();

   if (data === "stats_menu") {
    const stats = loadStats();
    const total = stats.totalSuccess + stats.totalFail;
    const successRate = total ? ((stats.totalSuccess / total) * 100).toFixed(1) : "0.0";

    const lines = [];
    lines.push("📊 *Reklam İstatistikleri Özeti*");
    lines.push("");
    lines.push(`Reklam Başlangıcı: \`${stats.startedAt}\``);
    lines.push(`Son Sıfırlama: \`${stats.lastResetAt}\``);
    lines.push("");
    lines.push(`Toplam Başarılı Gönderim: *${stats.totalSuccess}* ✅`);
    lines.push(`Toplam Hatalı Gönderim: *${stats.totalFail}* ❌`);
    lines.push(`Başarı Oranı: *${successRate}%*`);
    lines.push("");
    lines.push(`Ortalama Döngü Süresi: \`${stats.avgLoopMs} ms\``);
    lines.push("");
    lines.push("*Hedef Bazlı Sonuçlar*");

    const perTargets = Object.entries(stats.perTarget || {});
    if (perTargets.length === 0) {
      lines.push("_Henüz hedef istatistiği yok._");
    } else {
      perTargets.slice(0, 30).forEach(([id, t]) => {
        const blocked =
          (t.lastError && t.lastError.includes("FORWARDS_RESTRICTED")) ||
          (t.lastError && t.lastError.includes("PEER_ID_INVALID"));
        lines.push(
          `• \`${id}\` → ✅ ${t.ok} / ❌ ${t.fail}` +
          (blocked ? " 🚫 (Kısıtlı / Engelli)" : "")
        );
      });
      if (perTargets.length > 30) {
        lines.push(`_(${perTargets.length - 30} Hedef Daha Var...)_`);
      }
    }

    const kb = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔄 İstatistikleri Sıfırla", callback_data: "stats_reset" },
            { text: "⬅️ Ana Menü", callback_data: "back_main" }
          ]
        ]
      }
    };

    return ctx.reply(lines.join("\n"), {
      parse_mode: "Markdown",
      ...kb
    });
  }

  if (data === "stats_reset") {
    resetStats();
    await ctx.answerCbQuery("İstatistikler sıfırlandı.");
    const cfg2 = loadConfig();
    return ctx.reply("📊 İstatistikler sıfırlandı.", {
      parse_mode: "Markdown",
      ...mainKeyboard(cfg2)
    });
  }

  if (data === "back_main") {
    selectionState.mode = null;
    ownerState.inputMode = null;
    return ctx
      .editMessageText(
`
👋 *Merhaba!*

🛠 *Telegram Bot Reklam Paneline Hoş Geldiniz!*

ℹ️ Bu Bot Reklam Paneli, Telegram Hesabınız Üzerinden Tam Otomatik Mesaj İletimi Yapabilmeniz İçin Özenle Tasarlandı.

❇️ Aşağıdaki Butonları Kullanarak Tüm Ayarlarınızı Kolayca Yönetebilir, Reklamlarınızı İstediğiniz Gruplara Saniyeler İçinde Yönlendirebilirsiniz.

✨ *Neler Yapabilirsiniz?*

📍 Reklam Mesajlarınızın Alınacağı Kaynak Grubu Seçebilirsiniz.
🎯 Reklamların Gönderileceği Hedef Grupları Belirleyebilirsiniz.
⏱ Reklam Mesajlarınızın Gönderim Aralığını Yönetebilirsiniz.
📨 Sabit Veya Gruptaki Son Mesaj Modları Arasında Geçiş Yapabilirsiniz.
⚙ Gelişmiş Ayarlarla Tam Kontrol Sağlayabilirsiniz.
📜 Log Kayıtlarını Anlık İnceleyebilirsiniz.
🧪 Test Gönderimi Yaparak Sistemin Çalıştığını Doğrulayabilirsiniz.

🚀 *Her Şey Sizin İçin Kolay, Hızlı Ve Zahmetsiz Olacak Şekilde Tasarlandı.*

✅ *Hazırsanız, Aşağıdaki Menüden Dilediğiniz İşlemi Seçerek Başlayabilirsiniz!*
`
        , {
        parse_mode: "Markdown",
        ...mainKeyboard(cfg)
      })
      .catch(() => {});
  }

  if (data === "src_menu") {
    selectionState.mode = "source";
    selectionState.page = 0;
    selectionState.chats = await fetchChats();
    if (selectionState.chats.length === 0) {
      return ctx.answerCbQuery("Hiçbir Grup, Kanal Bulunamadı.", { show_alert: true });
    }
    return ctx
      .editMessageText("📍 Reklam Kaynağı Olarak Kullanmak İstediğiniz, Grubu Veya Kanalı Seçiniz.", buildSourceKeyboard())
      .catch(() => {});
  }

  if (data.startsWith("src_page:") && selectionState.mode === "source") {
    const page = Number(data.split(":")[1]);
    if (!isNaN(page)) selectionState.page = page;
    return safeEditMarkup(ctx, buildSourceKeyboard());
  }

  if (data.startsWith("src_set:") && selectionState.mode === "source") {
    const id = Number(data.split(":")[1]);
    const chat = selectionState.chats.find((c) => c.id === id);
    cfg.sourceChatId = id;
    saveConfig(cfg);
    selectionState.mode = null;
    await ctx.answerCbQuery("Kaynak Seçildi.");
    return ctx
      .editMessageText(
        `✅ Kaynak Ayarlandı:\n\`${id}\` (${chat ? chat.title : "Seçilen Sohbet"})`,
        { parse_mode: "Markdown", ...mainKeyboard(cfg) }
      )
      .catch(() => {});
  }

  if (data === "tgt_menu") {
    selectionState.mode = "targets";
    selectionState.page = 0;
    selectionState.chats = await fetchChats();
    selectionState.selectedTargets = new Set(cfg.targetChatIds || []);
    if (selectionState.chats.length === 0) {
      return ctx.answerCbQuery("Hiçbir Grup, Kanal Bulunamadı.", { show_alert: true });
    }
    return ctx
      .editMessageText("🎯 Reklamların Gönderileceği, Hedef Grupları Veya Kanalları Seçiniz.", buildTargetsKeyboard())
      .catch(() => {});
  }

  if (data.startsWith("tgt_page:") && selectionState.mode === "targets") {
    const page = Number(data.split(":")[1]);
    if (!isNaN(page)) selectionState.page = page;
    return safeEditMarkup(ctx, buildTargetsKeyboard());
  }

  if (data.startsWith("tgt_toggle:") && selectionState.mode === "targets") {
    const id = Number(data.split(":")[1]);
    if (selectionState.selectedTargets.has(id))
      selectionState.selectedTargets.delete(id);
    else selectionState.selectedTargets.add(id);
    return safeEditMarkup(ctx, buildTargetsKeyboard());
  }

  if (data === "tgt_all" && selectionState.mode === "targets") {
    selectionState.selectedTargets = new Set(selectionState.chats.map((c) => c.id));
    return safeEditMarkup(ctx, buildTargetsKeyboard());
  }

  if (data === "tgt_clear" && selectionState.mode === "targets") {
    selectionState.selectedTargets.clear();
    return safeEditMarkup(ctx, buildTargetsKeyboard());
  }

  if (data === "tgt_save" && selectionState.mode === "targets") {
    cfg.targetChatIds = Array.from(selectionState.selectedTargets);
    saveConfig(cfg);
    selectionState.mode = null;
    await ctx.answerCbQuery("Reklam Hedefleri kaydedildi.");
    return ctx
      .editMessageText("✅ Reklam Hedefleri kaydedildi.", {
        ...mainKeyboard(cfg)
      })
      .catch(() => {});
  }

  if (data === "time_menu") {
    ownerState.inputMode = null;
    const kb = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "1 dk", callback_data: "time_set:1" },
            { text: "5 dk", callback_data: "time_set:5" },
            { text: "10 dk", callback_data: "time_set:10" }
          ],
          [
            { text: "30 dk", callback_data: "time_set:30" },
            { text: "60 dk", callback_data: "time_set:60" }
          ],
          [{ text: "🔢 Özel Dakika", callback_data: "time_custom" }],
          [{ text: "🎲 Jitter +/−30sn", callback_data: "jitter_toggle" }],
          [{ text: "⬅️ Ana Menü", callback_data: "back_main" }]
        ]
      }
    };
    return ctx.editMessageText("⏱ Reklam Mesajlarınızın, Hangiz Aralıklarla Gönderileceğini Seçiniz.", kb).catch(() => {});
  }

  if (data.startsWith("time_set:")) {
    const mins = Number(data.split(":")[1]);
    if (!mins) return ctx.answerCbQuery("Hatalı Değer Girdiniz.");
    cfg.intervalMinutes = mins;
    saveConfig(cfg);
    return ctx.answerCbQuery(`Aralık ${mins} Dk Olarak Ayarlandı.`);
  }

  if (data === "time_custom") {
    ownerState.inputMode = "custom_interval";
    return ctx.reply("🔢 Özel Dakika Gir (Sadece Sayı):").catch(() => {});
  }

  if (data === "jitter_toggle") {
    cfg.jitterSeconds = cfg.jitterSeconds === 0 ? 30 : 0;
    saveConfig(cfg);
    return ctx.answerCbQuery(
      cfg.jitterSeconds ? "Jitter AKTİF (±30sn)" : "Jitter Durumu KAPALI Olarak Güncellendi"
    );
  }

  if (data === "show_status") {
    return ctx.reply(getStatusText(cfg), { parse_mode: "Markdown" });
  }

  if (data === "enable") {
    cfg.enabled = true;
    saveConfig(cfg);
    await ctx.answerCbQuery("Reklam Gönderimi: AKTİF");
    return safeEditMarkup(ctx, mainKeyboard(cfg));
  }
  if (data === "disable") {
    cfg.enabled = false;
    saveConfig(cfg);
    await ctx.answerCbQuery("Reklam Gönderimi: PASİF");
    return safeEditMarkup(ctx, mainKeyboard(cfg));
  }

  if (data === "send_test") {
    try {
      const client = await getUserClient();
      await client.sendMessage("me", { message: "🧪 Bu Bir Test Mesajıdır. Reklam Botunuz Başarılı Bir Şekilde Çalışıyor!" });
      await ctx.answerCbQuery("Test Mesajı Gönderildi.");
    } catch (e) {
      await ctx.answerCbQuery("Hata: " + e.message, { show_alert: true });
    }
    return;
  }

  if (data === "adv_menu") {
    ownerState.inputMode = null;
    const kb = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text:
                cfg.sendMode === "last"
                  ? "📨 Varsayılan Reklam Mesajı Modu: Son Mesaj"
                  : "📨 Varsayılan Reklam Mesajı Modu: Sabit Mesaj",
              callback_data: "sendmode_toggle"
            }
          ],
          [{ text: "✏ Sabit Mesajı Ayarla", callback_data: "fixed_edit" }],
          [{ text: "👤 Hesap Bilgisi", callback_data: "acct_info" }],
          [{ text: "⬅️ Ana Menü", callback_data: "back_main" }]
        ]
      }
    };
    return ctx.editMessageText("⚙ Gelişmiş Reklam Ayarları", kb).catch(() => {});
  }

  if (data === "sendmode_toggle") {
    cfg.sendMode = cfg.sendMode === "last" ? "fixed" : "last";
    saveConfig(cfg);
    return ctx.answerCbQuery(
      `Mod: ${cfg.sendMode === "last" ? "Seçilen Gruptaki Son Mesaj Olarak Ayarlandı" : "Yazılan Sabit Mesaj Olarak Ayarlandı"}`
    );
  }

  if (data === "fixed_edit") {
    ownerState.inputMode = "fixed_message";
    return ctx.reply("✏ Lütfen Reklam Mesajı Olarak Gönderilecek Sabit Mesajınızı Yazınız.").catch(() => {});
  }

if (data === "acct_info") {
  const client = await getUserClient();
  const me = await client.getMe();
  const dialogs = await client.getDialogs({});
  const groupCount = dialogs.filter((d) => !d.isUser).length;
  const info =
    `<b>👤 Hesap Bilgisi</b>\n\n` +
    `Hesap ID: <code>${me.id}</code>\n` +
    `Hesap Kulllanıcı Adı: <code>@${me.username || "-"}</code>\n` +
    `Hesap Adı: <code>${(me.firstName || "") + " " + (me.lastName || "")}</code>\n` +
    `Hesaptaki Toplam Grup, Kanal Sayısı: <b>${groupCount}</b>\n`;

  return ctx.reply(info, { parse_mode: "HTML" });
}

  if (data === "logs_menu") {
    const kb = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📜 Son 20 Log", callback_data: "logs_show" },
            { text: "🧹 Temizle (Buffer)", callback_data: "logs_clear" }
          ],
          [{ text: "⬅️ Ana Menü", callback_data: "back_main" }]
        ]
      }
    };
    return ctx.editMessageText("📜 Reklam Botu Log Merkezi", kb).catch(() => {});
  }

  if (data === "logs_show") {
    const last = logBuffer.slice(-20).join("\n");
    return ctx.reply("```" + (last || "Mevcut Log Yok") + "```", {
      parse_mode: "Markdown"
    });
  }

  if (data === "logs_clear") {
    logBuffer.length = 0;
    return ctx.answerCbQuery("Log Buffer Temizlendi.");
  }
});

let loopRunning = false;

async function startLoop(client) {
  if (loopRunning) return;
  loopRunning = true;

  log("🔁 Reklam Mesajı Döngüsü Başlatıldı.");

  while (true) {
    const loopStart = Date.now();
    const cfg = loadConfig();

    try {
      if (cfg.enabled && cfg.sourceChatId && cfg.targetChatIds.length > 0) {
        if (cfg.sendMode === "fixed" && cfg.fixedMessage) {
          for (const target of cfg.targetChatIds) {
            try {
              await client.sendMessage(target, { message: cfg.fixedMessage });
              log("➡ Seçilen Sabit Mesaj Gönderildi:", target);
              incSendStats(target, true, null);
            } catch (e) {
              log("⚠ Seçilen Sabit Mesaj Gönderilemedi:", target, e.message);
              incSendStats(target, false, e.message);
            }
          }

          cfg.lastRunAt = new Date().toISOString();
          saveConfig(cfg);
        }

        else {
          const msgs = await client.getMessages(cfg.sourceChatId, { limit: 1 });
          const msg = msgs[0];

          if (!msg) {
            log("⚠ Seçilen Kaynak Grupta Mesaj Yok.");
          } else {
            for (const target of cfg.targetChatIds) {
              try {
                await client.forwardMessages(target, {
                  messages: [msg.id],
                  fromPeer: cfg.sourceChatId
                });
                log(`➡ Reklam Mesajı İletimi Başarılı → ${target}`);
                incSendStats(target, true, null);
              } catch (e) {
                log(`⚠ Reklam Mesajı İletimi Hatası → ${target} | ${e.message}`);
                try {
                  if (msg.message) {
                    await client.sendMessage(target, { message: msg.message });
                    log(`➡ Reklam Mesajı Kopyalanarak İletildi → ${target}`);
                    incSendStats(target, true, null);
                  } else if (msg.media) {
                    await client.sendFile(target, {
                      file: msg.media,
                      caption: msg.message || ""
                    });
                    log(`➡ Reklam Mesajı İletildi → ${target}`);
                    incSendStats(target, true, null);
                  } else {
                    log(`⚠ Reklam Mesajının Kopyalanması Mümkün Değil → ${target}`);
                    incSendStats(target, false, "Reklam Mesajının Kopyalanması Mümkün Değil (Mesaj Boş Olabilir).");
                  }
                } catch (ee) {
                  log(`❌ Fallback hata → ${target} | ${ee.message}`);
                  incSendStats(target, false, ee.message);
                }
              }
            }

            cfg.lastRunAt = new Date().toISOString();
            saveConfig(cfg);
          }
        }

      } else {
        log("⛔ Pasif Veya Eksik Ayarlar Algılandı. Lütfen Bot Üzerinden Yöneterek Ayarlayınız.");
      }
    } catch (e) {
      log("🔥 Döngü Hatası Yaşandı:", e.message);
    }
    const loopMs = Date.now() - loopStart;
    updateLoopTime(loopMs);
    const freshCfg = loadConfig();
    let waitMs = (freshCfg.intervalMinutes || 1) * 60000;

    if (freshCfg.jitterSeconds) {
      const jitter = (Math.random() * 2 - 1) * freshCfg.jitterSeconds * 1000;
      waitMs = Math.max(1000, waitMs + jitter);
    }

    log("⏳ Reklam Arası Bekleme Süresi (Ms):", Math.round(waitMs));
    await new Promise((r) => setTimeout(r, waitMs));
  }
}
async function main() {
  if (process.argv.includes("init-session")) return initSession();

  log("Reklam Botunuz Başlatılıyor...");

  const client = await getUserClient();
  bot.launch().then(() => log("Reklam Yönetim Botunuz Başlatıldı."));
  
  startLoop(client);

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
main().catch((e) => {
  console.error("Ölümcül Hata Tespit Edildi:", e);
  process.exit(1);
});
