// ======================================================
// map_show.js (put this in app/javascript/packs/map_show.js)
// ======================================================
console.log("MAP_SHOW.JS loaded");

// --- Google Maps ローダーの二重読み込み防止 ---
if (!window.googleMapsLoaderAdded) {
  window.googleMapsLoaderAdded = true;

  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: process.env.Maps_API_Key
  });
}

// --- ヘルパ：importLibrary が使えるようになるまで待つ（最大 timeout） ---
async function waitForImportLibrary(timeoutMs = 5000, intervalMs = 100) {
  const start = Date.now();
  while (true) {
    if (window.google && google.maps && typeof google.maps.importLibrary === 'function') {
      return;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("google.maps.importLibrary not available within timeout");
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
}

async function initShowMap() {
  try {
    console.log("initShowMap called");
    const mapEl = document.getElementById("map");
    if (!mapEl) {
      console.log("initShowMap: #map not found on this page");
      return;
    }

    // data属性から座標を読み取る
    const lat = parseFloat(mapEl.dataset.lat);
    const lng = parseFloat(mapEl.dataset.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.error("initShowMap: invalid lat/lng", mapEl.dataset);
      return;
    }

    // importLibrary が利用可能になるまで待つ
    await waitForImportLibrary(7000, 100);

    // ライブラリ取得
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // 地図生成（既に map が存在する可能性に備え、上書きしない実装）
    // ここではローカル変数にして破棄されると困る場合は window.showMap = map;
    const map = new Map(mapEl, {
      zoom: 15,
      center: { lat, lng },
      mapId: "YOUR_MAP_ID",
    });

    // マーカー
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat, lng },
    });

    console.log("initShowMap: map created successfully");
  } catch (err) {
    console.error("initShowMap error:", err);
  }
}

// Turbo / Turbolinks どちらでも拾えるように複数イベントを登録
document.addEventListener("turbo:load", initShowMap);
document.addEventListener("turbo:render", initShowMap);
document.addEventListener("turbolinks:load", initShowMap);

// 直接呼ぶ保険（ページがフルロードで来た場合）
if (document.readyState === "complete" || document.readyState === "interactive") {
  // 少し遅延して呼ぶ（Turbo の初期処理を邪魔しないため）
  setTimeout(() => initShowMap(), 0);
}
