// ======================================================
// map_edit.js (app/javascript/packs/map_edit.js)
// ======================================================
console.log("EDIT_MAP.JS loaded");

// --- Google Maps ローダーの二重読み込み防止 ---
if (!window.googleMapsLoaderAdded) {
  window.googleMapsLoaderAdded = true;

  const apiKey = process.env.Maps_API_Key || "YOUR_API_KEY"; // 環境変数または仮のキー
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// --- importLibrary が使えるまで待機 ---
async function waitForImportLibrary(timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now();
  while (!(window.google && google.maps && typeof google.maps.importLibrary === "function")) {
    if (Date.now() - start > timeoutMs) throw new Error("google.maps.importLibrary not available");
    await new Promise(r => setTimeout(r, intervalMs));
  }
}

// --- 編集用マップ初期化 ---
async function initEditMap() {
  try {
    console.log("initEditMap called");

    const mapEl = document.getElementById("map");
    if (!mapEl) {
      console.log("initEditMap: #map not found");
      return;
    }

    // 緯度経度フォールバック
    const lat = parseFloat(mapEl.dataset.lat) || 35.6895; // 東京駅
    const lng = parseFloat(mapEl.dataset.lng) || 139.6917;

    // importLibrary 読み込み待機
    await waitForImportLibrary();

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // マップ生成
    const map = new Map(mapEl, {
      zoom: 15,
      center: { lat, lng },
      mapId: mapEl.dataset.mapId || "DEMO_MAP_ID",
      mapTypeControl: false
    });

    // マーカー生成（ドラッグ禁止）
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat, lng },
      draggable: false
    });

    // hidden フィールドに反映
    const latInput = document.getElementById("post_latitude");
    const lngInput = document.getElementById("post_longitude");

    // マップクリックでマーカー移動
    map.addListener("click", (event) => {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();
      marker.position = { lat: clickedLat, lng: clickedLng };
      if (latInput) latInput.value = clickedLat;
      if (lngInput) lngInput.value = clickedLng;
    });

    console.log("initEditMap: map ready (click to move marker)");

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
