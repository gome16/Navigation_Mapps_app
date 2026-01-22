// ======================================================
// posts/show ページにてそのユーザーの地図を表示する機能
// ======================================================

console.log("MAP_SHOW.JS loaded");

// --- Google Maps ローダー ---
if (!window.googleMapsLoaderAdded) {
  window.googleMapsLoaderAdded = true;
  (g => {
    let h, a, k, p = "The Google Maps JavaScript API",
      c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
    b = b[c] || (b[c] = {});
    let d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(),
      u = () => h || (h = new Promise(async (f, n) => {
        a = m.createElement("script");
        e.set("libraries", [...r] + "");
        for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => h = n(Error(p + " could not load."));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
    d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
  })({ key: process.env.Maps_API_Key });
}

// --- importLibrary が使えるまで待つ ---
async function waitForImportLibrary(timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now();
  while (true) {
    if (window.google && google.maps && typeof google.maps.importLibrary === "function") return;
    if (Date.now() - start > timeoutMs) throw new Error("google.maps.importLibrary not available within timeout");
    await new Promise(r => setTimeout(r, intervalMs));
  }
}

// --- 初期化 ---
async function initShowMap() {
  try {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const lat = parseFloat(mapEl.dataset.lat) || 35.681236;
    const lng = parseFloat(mapEl.dataset.lng) || 139.767125;
    const title = mapEl.dataset.title || "無題";
    const userName = mapEl.dataset.userName || "名無し";
    const userImage = mapEl.dataset.userImage || "/default_profile.jpg";

    await waitForImportLibrary(7000, 100);
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const map = new Map(mapEl, {
      zoom: 15,
      center: { lat, lng },
      mapId: mapEl.dataset.mapId || "DEMO_MAP_ID",
      mapTypeControl: false
    });

    const marker = new AdvancedMarkerElement({
      map,
      position: { lat, lng },
      title: title
    });

    console.log("initShowMap: map created successfully");
  } catch (err) {
    console.error("initShowMap error:", err);
  }
}

// --- Turbo/Turbolinks 対応 ---
document.addEventListener("turbo:load", initShowMap);
document.addEventListener("turbo:render", initShowMap);
document.addEventListener("turbolinks:load", initShowMap);
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(() => initShowMap(), 0);
}
