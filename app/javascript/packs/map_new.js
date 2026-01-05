// ======================================================
// posts/newにて地図を表示する機能と地図上にマーカーを設置する機能
// ======================================================
console.log("MAP_NEW.JS loaded");

// --- Google Maps ローダー ---
if (!window.googleMapsLoaderAdded) {
  window.googleMapsLoaderAdded = true;

  const apiKey = process.env.Maps_API_Key || "YOUR_API_KEY";
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

// --- 新規投稿マップ初期化 ---
async function initNewPostMap() {
  try {
    const mapEl = document.getElementById("map");
    if (!mapEl) {
      console.log("initNewPostMap: #map not found");
      return;
    }

    await waitForImportLibrary();

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const map = new Map(mapEl, {
      center: { lat: 35.681236, lng: 139.767125 }, // 東京駅
      zoom: 15,
      mapId: "YOUR_ACTUAL_MAP_ID",
      mapTypeControl: false
    });

    let marker = null;

    map.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      if (marker) {
        marker.position = { lat, lng };
      } else {
        marker = new AdvancedMarkerElement({
          position: { lat, lng },
          map: map
        });
      }

      const latInput = document.getElementById("post_latitude");
      const lngInput = document.getElementById("post_longitude");
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;
    });

    console.log("initNewPostMap: map ready");

  } catch (err) {
    console.error("initNewPostMap error:", err);
  }
}

// Turbo / Turbolinks 対応
document.addEventListener("turbo:load", initNewPostMap);
document.addEventListener("turbo:render", initNewPostMap);
document.addEventListener("turbolinks:load", initNewPostMap);

// ページロード保険
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(() => initNewPostMap(), 0);
}
