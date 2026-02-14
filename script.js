const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('#0a0a0f'); tg.setBackgroundColor('#0a0a0f'); }

const PRODUCTS = {
    currency: [
        { id: 1, name: "1.000.000$", price: 50, oldPrice: 70, badge: "", emoji: "💵" },
        { id: 2, name: "5.000.000$", price: 200, oldPrice: 280, badge: "ХИТ 🔥", emoji: "💰" },
        { id: 3, name: "10.000.000$", price: 350, oldPrice: 500, badge: "ВЫГОДНО 💎", emoji: "💎" },
        { id: 4, name: "50.000.000$", price: 1500, oldPrice: 2100, badge: "VIP 👑", emoji: "👑" },
        { id: 5, name: "100.000.000$", price: 2500, oldPrice: 3500, badge: "MEGA 🚀", emoji: "🚀" },
    ],
    transport: [
        { id: 6, name: "Стандартное авто", price: 100, oldPrice: 140, badge: "", emoji: "🚗" },
        { id: 7, name: "Спорткар", price: 300, oldPrice: 420, badge: "", emoji: "🏎" },
        { id: 8, name: "Суперкар", price: 500, oldPrice: 700, badge: "🔥", emoji: "🏎" },
        { id: 9, name: "Вертолёт", price: 800, oldPrice: 1100, badge: "", emoji: "🚁" },
        { id: 10, name: "Яхта", price: 1200, oldPrice: 1700, badge: "", emoji: "🛥" },
    ],
    realty: [
        { id: 11, name: "Квартира", price: 200, oldPrice: 280, badge: "", emoji: "🏢" },
        { id: 12, name: "Дом", price: 500, oldPrice: 700, badge: "", emoji: "🏠" },
        { id: 13, name: "Вилла", price: 1000, oldPrice: 1400, badge: "ПРЕМИУМ ✨", emoji: "🏡" },
        { id: 14, name: "Пентхаус", price: 1500, oldPrice: 2100, badge: "", emoji: "🏙" },
        { id: 15, name: "Бизнес", price: 2000, oldPrice: 2800, badge: "", emoji: "🏦" },
    ],
    vip: [
        { id: 16, name: "VIP статус", price: 300, oldPrice: 420, badge: "", emoji: "⭐" },
        { id: 17, name: "Premium статус", price: 600, oldPrice: 840, badge: "", emoji: "💫" },
        { id: 18, name: "Elite статус", price: 1000, oldPrice: 1400, badge: "", emoji: "🌟" },
        { id: 19, name: "Полный комплект", price: 3000, oldPrice: 4200, badge: "MAX 💎🔥", emoji: "👑" },
    ],
};

let currentCategory = "currency";
let selectedProduct = null;
let appliedDiscount = 0;

document.addEventListener("DOMContentLoaded", () => {
    const name = tg?.initDataUnsafe?.user?.first_name || "Игрок";
    document.getElementById("userName").textContent = name;
    document.getElementById("userAvatar").textContent = name[0].toUpperCase();
    renderCatalog("currency");
    renderReviews();
    startTimer();
    setInterval(() => {
        document.getElementById("onlineCount").textContent = Math.floor(Math.random() * 31) + 15;
    }, 30000);
});

function renderCatalog(cat) {
    const el = document.getElementById("catalog");
    el.innerHTML = "";
    (PRODUCTS[cat] || []).forEach((p, i) => {
        const d = document.createElement("div");
        d.className = "product-card";
        d.style.animationDelay = i * 0.08 + "s";
        d.innerHTML =
            (p.badge ? '<div class="product-badge">' + p.badge + "</div>" : "") +
            '<div class="product-emoji">' + p.emoji + "</div>" +
            '<div class="product-name">' + p.name + "</div>" +
            '<div class="product-old-price">' + p.oldPrice + "₽</div>" +
            '<div class="product-price">' + p.price + "₽</div>" +
            '<button class="buy-btn" onclick="openOrder(' + p.id + ",'" + cat + "'" + ')">Купить</button>';
        el.appendChild(d);
    });
}

function switchCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.toggle("active", b.dataset.cat === cat));
    renderCatalog(cat);
    if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
}

function openOrder(id, cat) {
    const p = (PRODUCTS[cat] || []).find(x => x.id === id);
    if (!p) return;
    selectedProduct = { ...p, category: cat };
    appliedDiscount = 0;
    document.getElementById("orderProductCard").innerHTML =
        '<div style="font-size:48px;margin-bottom:10px">' + p.emoji + "</div>" +
        '<div style="font-size:18px;font-weight:800">' + p.name + "</div>" +
        '<div style="font-size:14px;color:#64748b;text-decoration:line-through">' + p.oldPrice + "₽</div>" +
        '<div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent">' + p.price + "₽</div>";
    updateTotal();
    document.getElementById("orderPage").classList.remove("hidden");
    ["serverSelect", "nicknameInput", "gameIdInput", "promoInput"].forEach(x => document.getElementById(x).value = "");
    document.getElementById("promoResult").textContent = "";
}

function closeOrderPage() { document.getElementById("orderPage").classList.add("hidden"); }

function updateTotal() {
    if (!selectedProduct) return;
    const fp = Math.round(selectedProduct.price * (100 - appliedDiscount) / 100);
    let h = '<div style="display:flex;justify-content:space-between;font-size:13px;color:#64748b;margin-bottom:8px"><span>Товар</span><span>' + selectedProduct.price + "₽</span></div>";
    if (appliedDiscount > 0) {
        h += '<div style="display:flex;justify-content:space-between;color:#22c55e;font-size:13px;margin-bottom:8px"><span>Скидка ' + appliedDiscount + "%</span><span>-" + (selectedProduct.price - fp) + "₽</span></div>";
    }
    h += '<div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;padding-top:8px;border-top:1px solid rgba(139,92,246,0.15)"><span>Итого</span><span style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent">' + fp + "₽</span></div>";
    document.getElementById("orderTotal").innerHTML = h;
}

function applyPromo() {
    const code = document.getElementById("promoInput").value.trim().toUpperCase();
    const r = document.getElementById("promoResult");
    const promos = { FIRST20: 20, SALE10: 10, VIP30: 30, MEGA50: 50 };
    if (promos[code]) {
        appliedDiscount = promos[code];
        r.textContent = "✅ Скидка " + appliedDiscount + "%";
        r.className = "promo-result success";
    } else {
        appliedDiscount = 0;
        r.textContent = "❌ Промокод не найден";
        r.className = "promo-result error";
    }
    updateTotal();
}

function submitOrder() {
    const s = document.getElementById("serverSelect").value;
    const n = document.getElementById("nicknameInput").value.trim();
    const g = document.getElementById("gameIdInput").value.trim();
    const pr = document.getElementById("promoInput").value.trim().toUpperCase();
    if (!s) { alert("Выберите сервер!"); return; }
    if (!n) { alert("Введите ник!"); return; }
    if (!g) { alert("Введите ID!"); return; }
    const fp = Math.round(selectedProduct.price * (100 - appliedDiscount) / 100);
    const data = { product_name: selectedProduct.name, category: selectedProduct.category, price: selectedProduct.price, server: s, nickname: n, game_id: g, promo_code: pr, final_price: fp };
    if (tg) { tg.sendData(JSON.stringify(data)); } else { console.log(data); alert("Заказ оформлен! (демо)"); }
    closeOrderPage();
}

function showPage(page) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === page));
    document.getElementById("aboutPage").classList.add("hidden");
    document.getElementById("orderPage").classList.add("hidden");
    const main = document.querySelectorAll(".app-header,.categories-scroll,.catalog,.reviews-section,.marquee");
    if (page === "catalog") { main.forEach(e => e.style.display = ""); }
    else if (page === "about") { main.forEach(e => e.style.display = "none"); document.getElementById("aboutPage").classList.remove("hidden"); }
}

function openSupport() {
    if (tg) tg.openTelegramLink("https://t.me/WiteBg");
    else window.open("https://t.me/WiteBg", "_blank");
}

function renderReviews() {
    const reviews = [
        { n: "Александр", t: "10М виртов за 5 минут! Топ 🔥" },
        { n: "Максим", t: "3й раз покупаю, всё супер!" },
        { n: "Дима", t: "VIP + вирты, скидка зашла 💎" },
        { n: "Артём", t: "Лучшие цены! Суперкар моментально!" },
        { n: "Кирилл", t: "Вилла + 50М, всё чётко 24/7" },
    ];
    const el = document.getElementById("reviewsSlider");
    el.innerHTML = "";
    reviews.forEach(r => {
        const d = document.createElement("div");
        d.className = "review-card";
        d.innerHTML = '<div class="review-header"><div class="review-avatar">' + r.n[0] + '</div><div class="review-name">' + r.n + '</div></div><div class="review-stars">⭐⭐⭐⭐⭐</div><div class="review-text">' + r.t + "</div>";
        el.appendChild(d);
    });
}

function startTimer() {
    let s = 10799;
    setInterval(() => {
        s--; if (s < 0) s = 10799;
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
        const el = document.getElementById("timerDisplay");
        if (el) el.textContent = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
    }, 1000);
}