// ======================================================
// users/show ページにてそのユーザーの投稿マーカー一覧を表示
// ======================================================
console.log("USERS_SHOW_MAP.JS loaded");

// Google Maps ローダー（二重読み込み防止）
async function loadGoogleMaps() {
  if (window.googleMapsLoaderAdded) {
    console.log("Google Maps already loaded");
    return;
  }

  window.googleMapsLoaderAdded = true;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.Maps_API_Key}&callback=__googleMapsInit`;
    script.async = true;
    script.onerror = reject;
    document.head.appendChild(script);
    window.__googleMapsInit = resolve;
  });
}

// ----------------------
// ユーザー投稿マップ初期化
// ----------------------
window.initUserPostsMap = async function () {
  // 既に地図が作られていれば再利用
  if (window.userPostsMap) {
    console.log("User posts map already initialized");
    return window.userPostsMap;
  }

  const mapEl = document.getElementById("user-posts-map");
  if (!mapEl) {
    console.log("#user-posts-map not found on this page");
    return;
  }

  // Google Maps API が読み込まれていなければロード
  if (!window.google || !google.maps || !google.maps.importLibrary) {
    console.log("Google Maps not loaded, loading now...");
    await loadGoogleMaps();
  }

  // importLibrary で Maps を取得
  const { Map } = await google.maps.importLibrary("maps");

  // 地図生成
  const map = new Map(mapEl, {
    zoom: 15,
    center: { lat: 35.0, lng: 135.0 },
    mapId: "YOUR_MAP_ID", // 個別投稿マップと同じ MapStyle
  });

  window.userPostsMap = map;

  // 投稿データ取得
  const userId = window.location.pathname.split("/").pop();
  const response = await fetch(`/users/${userId}/posts`);
  const posts = await response.json();

  if (!Array.isArray(posts)) {
    console.error("Posts JSON is invalid:", posts);
    return map;
  }

  const bounds = new google.maps.LatLngBounds();

  posts.forEach((post) => {
    // updated_at が created_at と異なる場合のみ表示
    let updatedInfo = "";
    if (post.updated_at && post.updated_at !== post.created_at) {
      updatedInfo = `<p class="mb-0">更新日: ${new Date(post.updated_at).toLocaleString()}</p>`;
    }

    const infoWindowContent = `
      <div class="card p-2 mb-1" style="min-width:200px;">
        <h6 class="card-title mb-1 border-bottom pb-1">ID: ${post.id}</h6>
        <h6 class="card-subtitle mb-2">${post.title}</h6>
        <p class="mb-0">投稿日時: ${new Date(post.created_at).toLocaleString()}</p>
        ${updatedInfo}
      </div>
    `;

    const marker = new google.maps.Marker({
      position: { lat: post.latitude, lng: post.longitude },
      map,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    bounds.extend({ lat: post.latitude, lng: post.longitude });
  });

  // 全マーカーを収めつつ最大ズーム 15 に制限
  map.fitBounds(bounds);
  google.maps.event.addListenerOnce(map, "bounds_changed", () => {
    if (map.getZoom() > 15) map.setZoom(15);
  });

  console.log("initUserPostsMap: map initialized successfully");
  return map;
};

// ----------------------
// Turbo / Turbolinks 対応
// ----------------------
document.addEventListener("turbo:load", () => window.initUserPostsMap());
document.addEventListener("turbo:render", () => window.initUserPostsMap());
document.addEventListener("turbolinks:load", () => window.initUserPostsMap());

// ページロード時の保険
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(() => window.initUserPostsMap(), 0);
}
