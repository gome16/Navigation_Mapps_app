// ======================================================
// posts/show 複数オブジェクト表示（安定版）
// ======================================================

console.log("MAP_SHOW.JS loaded");

// ==============================
// Google Maps ローダー
// ==============================

if (!window.googleMapsLoaderAdded) {

  window.googleMapsLoaderAdded = true;

  const apiKey = process.env.Maps_API_Key || "YOUR_API_KEY";

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// ==============================
// importLibrary 待機
// ==============================

async function waitForImportLibrary(timeoutMs = 7000, intervalMs = 100) {

  const start = Date.now();

  while (!(window.google && google.maps && typeof google.maps.importLibrary === "function")) {

    if (Date.now() - start > timeoutMs) {
      throw new Error("google.maps.importLibrary not available");
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }
}

// ==============================
// 初期化
// ==============================

async function initShowMap() {

  try {

    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    // ------------------
    // dataset 読み込み
    // ------------------

    const lat = Number(mapEl.dataset.lat) || 35.681236;
    const lng = Number(mapEl.dataset.lng) || 139.767125;

    // shapes 安全取得
    let shapes = [];

    try {
      const raw = mapEl.dataset.shapes;

      if (raw && raw.length > 0) {
        shapes = JSON.parse(raw);
      }

    } catch (e) {
      console.error("shapes JSON parse error:", e);
      shapes = [];
    }

    // ------------------
    // Google Maps 読み込み
    // ------------------

    await waitForImportLibrary();

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // ------------------
    // Map 初期化
    // ------------------

    const map = new Map(mapEl, {
      center: { lat, lng },
      zoom: 15,
      mapId: mapEl.dataset.mapId || "DEMO_MAP_ID",
      mapTypeControl: false
    });

    console.log("Map initialized");

    const bounds = new google.maps.LatLngBounds();

    // ==============================
    // shapes 描画
    // ==============================

    if (Array.isArray(shapes) && shapes.length > 0) {

      shapes.forEach(obj => {

        // ===== Marker =====

        if (obj.type === "marker") {

          const position = {
            lat: Number(obj.lat),
            lng: Number(obj.lng)
          };

          new AdvancedMarkerElement({
            map,
            position
          });

          bounds.extend(position);
        }

        // ===== Polyline =====

        if (obj.type === "polyline" && Array.isArray(obj.points)) {

          const path = obj.points.map(p => ({
            lat: Number(p.lat),
            lng: Number(p.lng)
          }));

          new google.maps.Polyline({
            path,
            map
          });

          path.forEach(p => bounds.extend(p));
        }

        // ===== Polygon =====

        if (obj.type === "polygon" && Array.isArray(obj.points)) {

          const path = obj.points.map(p => ({
            lat: Number(p.lat),
            lng: Number(p.lng)
          }));

          new google.maps.Polygon({
            paths: path,
            map
          });

          path.forEach(p => bounds.extend(p));
        }

        // ===== Circle =====

        if (obj.type === "circle" && obj.center) {

          const center = {
            lat: Number(obj.center.lat),
            lng: Number(obj.center.lng)
          };

          new google.maps.Circle({
            center,
            radius: Number(obj.radius),
            map
          });

          bounds.extend(center);
        }

      });

      // ------------------
      // 自動ズーム
      // ------------------

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }

    } else {

      // ==============================
      // shapes無し（旧投稿フォールバック）
      // ==============================

      const position = { lat, lng };

      new AdvancedMarkerElement({
        map,
        position
      });

      map.setCenter(position);
    }

    console.log("initShowMap completed");

  } catch (err) {

    console.error("initShowMap error:", err);

  }
}

// ==============================
// Turbo / Turbolinks 対応
// ==============================

document.addEventListener("turbo:load", initShowMap);
document.addEventListener("turbo:render", initShowMap);
document.addEventListener("turbolinks:load", initShowMap);

// ==============================
// 初回ロード保険
// ==============================

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(initShowMap, 0);
}
