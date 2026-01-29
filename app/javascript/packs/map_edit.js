// ======================================================
// posts/editにて地図を表示する機能と地図上にマーカーをの位置を変更する機能
// ======================================================
console.log("EDIT_MAP.JS loaded");

// --------------------
// Loader
// --------------------

if (!window.googleMapsLoaderAdded) {
  window.googleMapsLoaderAdded = true;

  const apiKey = process.env.Maps_API_Key || "YOUR_API_KEY";
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=drawing`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// --------------------
// wait importLibrary
// --------------------

async function waitForImportLibrary(timeoutMs = 7000) {
  const start = Date.now();
  while (!(window.google && google.maps && google.maps.importLibrary)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("google.maps.importLibrary not available");
    }
    await new Promise(r => setTimeout(r, 100));
  }
}

// --------------------
// Init
// --------------------

async function initEditMap() {

  try {

    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const lat = Number(mapEl.dataset.lat) || 35.6895;
    const lng = Number(mapEl.dataset.lng) || 139.6917;

    const shapes = JSON.parse(mapEl.dataset.shapes || "[]");

    const shapesInput = document.getElementById("post_shapes");

    await waitForImportLibrary();

    const { Map } = await google.maps.importLibrary("maps");
    const { DrawingManager } = await google.maps.importLibrary("drawing");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const map = new Map(mapEl, {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: false
    });

    const drawnObjects = [];

    // --------------------
    // 既存 shapes 復元
    // --------------------

    shapes.forEach(obj => {

      let instance;

      if (obj.type === "marker") {

        instance = new AdvancedMarkerElement({
          map,
          position: { lat: obj.lat, lng: obj.lng }
        });

      }

      if (obj.type === "polyline") {

        instance = new google.maps.Polyline({
          map,
          path: obj.points
        });

      }

      if (obj.type === "polygon") {

        instance = new google.maps.Polygon({
          map,
          paths: obj.points
        });

      }

      if (instance) {
        instance.__type = obj.type;
        drawnObjects.push(instance);
      }

    });

    // --------------------
    // Drawing Tool
    // --------------------

    const drawingManager = new DrawingManager({
      map,
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: [
          "marker",
          "polyline",
          "polygon",
          "circle"
        ]
      }
    });

    drawingManager.addListener("overlaycomplete", e => {

      const overlay = e.overlay;
      overlay.__type = e.type;

      drawnObjects.push(overlay);
      saveShapes();
    });

    // --------------------
    // 右クリックで削除
    // --------------------

    map.addListener("rightclick", e => {

      const clicked = drawnObjects.find(o => {

        if (o.position) {
          return (
            Math.abs(o.position.lat() - e.latLng.lat()) < 0.0001 &&
            Math.abs(o.position.lng() - e.latLng.lng()) < 0.0001
          );
        }

        return false;
      });

      if (clicked) {
        clicked.setMap(null);
        const index = drawnObjects.indexOf(clicked);
        drawnObjects.splice(index, 1);
        saveShapes();
      }

    });

    // --------------------
    // 保存処理
    // --------------------

    function saveShapes() {

      const result = drawnObjects.map(obj => {

        if (obj.__type === "marker") {

          return {
            type: "marker",
            lat: obj.position.lat(),
            lng: obj.position.lng()
          };
        }

        if (obj.__type === "polyline") {

          return {
            type: "polyline",
            points: obj.getPath().getArray().map(p => ({
              lat: p.lat(),
              lng: p.lng()
            }))
          };
        }

        if (obj.__type === "polygon") {

          return {
            type: "polygon",
            points: obj.getPath().getArray().map(p => ({
              lat: p.lat(),
              lng: p.lng()
            }))
          };
        }

      });

      shapesInput.value = JSON.stringify(result);
    }

    // 初期保存
    saveShapes();

    console.log("Edit map ready");

  } catch (err) {
    console.error(err);
  }
}

// Turbo対応

document.addEventListener("turbo:load", initEditMap);
document.addEventListener("turbolinks:load", initEditMap);
