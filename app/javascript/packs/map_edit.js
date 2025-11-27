// ======================================================
// map_edit.js (app/javascript/packs/map_edit.js)
// ======================================================
console.log("EDIT_MAP.JS loaded");

// --- Google Maps ローダーの二重読み込み防止 ---
if (!window.googleMapsLoaderAdded) {
  window.googleMapsLoaderAdded = true;

  (g => {
    var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
    b = b[c] || (b[c] = {});
    var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams;
    var u = () => h || (h = new Promise(async (f, n) => {
      await (a = m.createElement("script"));
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
  })({
    key: process.env.Maps_API_Key
  });
}

// --- importLibrary 読み込み待機---
async function waitForImportLibrary(timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now();
  while (true) {
    if (window.google && google.maps && typeof google.maps.importLibrary === 'function') return;
    if (Date.now() - start > timeoutMs) throw new Error("google.maps.importLibrary not available within timeout");
    await new Promise(r => setTimeout(r, intervalMs));
  }
}

// --- 編集用マップ初期化（クリックでマーカー移動） ---
async function initEditMap() {
  try {
    console.log("initEditMap called");

    const mapEl = document.getElementById("map");
    if (!mapEl) {
      console.log("initEditMap: #map not found");
      return;
    }

    const lat = parseFloat(mapEl.dataset.lat) || 35.6895;
    const lng = parseFloat(mapEl.dataset.lng) || 139.6917;

    await waitForImportLibrary(7000);

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const map = new Map(mapEl, {
      zoom: 15,
      center: { lat, lng },
      mapId: "YOUR_MAP_ID",
    });

    // ドラッグによるマーカー設置を禁止
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat, lng },
      draggable: false
    });

    // hiddenフィールドによる軽度・緯度取得
    const latInput = document.getElementById("post_latitude");
    const lngInput = document.getElementById("post_longitude");

    // マップクリックでマーカー移動（AdvancedMarkerElement は .position を更新）
    map.addListener("click", (event) => {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();

      marker.position = { lat: clickedLat, lng: clickedLng };

      if (latInput) latInput.value = clickedLat;
      if (lngInput) lngInput.value = clickedLng;
    });

    console.log("initEditMap: map ready (click only)");
  } catch (err) {
    console.error("initEditMap error:", err);
  }
}

// Turbo / Turbolinks 対応
document.addEventListener("turbo:load", initEditMap);
document.addEventListener("turbo:render", initEditMap);
document.addEventListener("turbolinks:load", initEditMap);

// ページロード時の保険
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(() => initEditMap(), 0);
}
