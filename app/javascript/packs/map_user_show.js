// ======================================================
// users_show_map.js
// users/show ページにてそのユーザーの投稿マーカー一覧を表示
// ======================================================
console.log("USERS_SHOW_MAP.JS loaded");

// ----------------------
// 共通 Google Maps ローダー
// ----------------------
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

  const map = new Map(mapEl, {
    zoom: 4,
    center: { lat: 35.0, lng: 135.0 }, // 日本中心
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
    let updatedInfo = "";
    if (post.updated_at && post.updated_at !== post.created_at) {
      updatedInfo = `<p>更新日: ${new Date(post.updated_at).toLocaleString()}</p>`;
    }

    const infoWindowContent = `
      <div class="container">
        <h5 class="mb-1 border-bottom">${post.id}</h5>
        <h5 class="mb-3">${post.title}</h5>
        <p class= mb-0>投稿日時: ${new Date(post.created_at).toLocaleString()}</p>
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

  map.fitBounds(bounds);

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
