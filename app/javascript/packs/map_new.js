// ======================================================
// posts/new 地図投稿機能
// ======================================================

console.log("MAP_NEW.JS loaded");

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

async function waitForImportLibrary(timeoutMs = 5000, intervalMs = 100) {

  const start = Date.now();

  while (!(window.google && google.maps && typeof google.maps.importLibrary === "function")) {

    if (Date.now() - start > timeoutMs) {
      throw new Error("google.maps.importLibrary not available");
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

}

// ==============================
// グローバル状態
// ==============================

let drawnObjects = [];
let renderedOverlays = [];

let currentMode = "marker";

let tempPath = [];
let tempOverlay = null;

const MAX_OBJECTS = 5;

// ==============================
// モード切替（描画途中自動確定）
// ==============================

window.setMode = function(mode) {

  // --- 描画途中の線/ポリゴンを自動確定 ---
  if ((currentMode === "polyline" || currentMode === "polygon") &&
      tempPath.length >= 2) {

    drawnObjects.push({
      type: currentMode,
      points: tempPath.map(p => ({
        lat: p.lat(),
        lng: p.lng()
      }))
    });

    if (tempOverlay) {
      renderedOverlays.push(tempOverlay);
    }

  }

  tempPath = [];
  tempOverlay = null;

  currentMode = mode;

  console.log("mode changed:", mode);
};

// ==============================
// 描画キャンセル
// ==============================

window.cancelDrawing = function() {

  tempPath = [];

  if (tempOverlay) {
    tempOverlay.setMap(null);
    tempOverlay = null;
  }

  currentMode = "marker";

  console.log("drawing canceled");
};

// ==============================
// 最大数制限
// ==============================

function canAddObject() {

  const tempCount = tempPath.length > 0 ? 1 : 0;

  if ((drawnObjects.length + tempCount) >= MAX_OBJECTS) {
    alert("最大5オブジェクトまでです");
    return false;
  }

  return true;
}

// ==============================
// Undo（描画中優先削除）
// ==============================

window.undoLast = function() {

  // ---- 描画途中があれば優先 ----
  if (tempOverlay) {

    tempOverlay.setMap(null);
    tempOverlay = null;
    tempPath = [];

    console.log("temp drawing removed");
    return;
  }

  // ---- 確定済み削除 ----
  if (drawnObjects.length === 0) return;

  drawnObjects.pop();

  const lastOverlay = renderedOverlays.pop();
  if (lastOverlay) lastOverlay.setMap(null);

  console.log("last object removed");
};

// ==============================
// 線・ポリゴン手動確定（任意）
// ==============================

window.finishShape = function() {

  if (tempPath.length < 2) {
    alert("点が不足しています");
    return;
  }

  drawnObjects.push({
    type: currentMode,
    points: tempPath.map(p => ({
      lat: p.lat(),
      lng: p.lng()
    }))
  });

  if (tempOverlay) {
    renderedOverlays.push(tempOverlay);
  }

  tempPath = [];
  tempOverlay = null;

};

// ==============================
// 新規投稿マップ初期化
// ==============================

async function initNewPostMap() {

  try {

    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    await waitForImportLibrary();

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const map = new Map(mapEl, {
      center: { lat: 35.681236, lng: 139.767125 },
      zoom: 15,
      mapId: "YOUR_ACTUAL_MAP_ID",
      mapTypeControl: false
    });

    console.log("Map initialized");

    // ==============================
    // 地図クリック処理
    // ==============================

    map.addListener("click", (event) => {

      if (!canAddObject()) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // ===== マーカー =====

      if (currentMode === "marker") {

        const marker = new AdvancedMarkerElement({
          position: { lat, lng },
          map: map
        });

        renderedOverlays.push(marker);

        drawnObjects.push({
          type: "marker",
          lat,
          lng
        });

        // 投稿代表座標

        const latInput = document.getElementById("post_latitude");
        const lngInput = document.getElementById("post_longitude");

        if (latInput && !latInput.value) {
          latInput.value = lat;
          lngInput.value = lng;
        }

      }

      // ===== 線・ポリゴン =====

      if (currentMode === "polyline" || currentMode === "polygon") {

        tempPath.push(event.latLng);

        if (tempOverlay) tempOverlay.setMap(null);

        if (currentMode === "polyline") {

          tempOverlay = new google.maps.Polyline({
            path: tempPath,
            map: map
          });

        }

        if (currentMode === "polygon") {

          tempOverlay = new google.maps.Polygon({
            paths: tempPath,
            map: map
          });

        }

      }

      // ===== 円 =====

      if (currentMode === "circle") {

        const circle = new google.maps.Circle({
          center: { lat, lng },
          radius: 300,
          map: map
        });

        renderedOverlays.push(circle);

        drawnObjects.push({
          type: "circle",
          center: { lat, lng },
          radius: 300
        });

      }

    });

    // ==============================
    // フォーム送信時保存
    // ==============================

    const form = document.querySelector("form");

    if (form) {

      form.addEventListener("submit", (e) => {

        const shapesInput = document.getElementById("post_shapes");

        // ---- 描画途中自動確定 ----

        if ((currentMode === "polyline" || currentMode === "polygon") &&
            tempPath.length >= 2) {

          drawnObjects.push({
            type: currentMode,
            points: tempPath.map(p => ({
              lat: p.lat(),
              lng: p.lng()
            }))
          });

        }

        // ---- マーカー必須 ----

        const latInput = document.getElementById("post_latitude");

        if (!latInput || !latInput.value) {
          alert("投稿位置（マーカー）を1つ以上設置してください");
          e.preventDefault();
          return;
        }

        // ---- JSON化保存 ----

        if (shapesInput) {
          shapesInput.value = JSON.stringify(drawnObjects);
        }

        console.log("Saved shapes:", drawnObjects);

      });

    }

    console.log("initNewPostMap ready");

  } catch (err) {

    console.error("initNewPostMap error:", err);

  }

}

// ==============================
// Turbo / Turbolinks 対応
// ==============================

document.addEventListener("turbo:load", initNewPostMap);
document.addEventListener("turbo:render", initNewPostMap);
document.addEventListener("turbolinks:load", initNewPostMap);

// ==============================
// ページロード保険
// ==============================

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(initNewPostMap, 0);
}
