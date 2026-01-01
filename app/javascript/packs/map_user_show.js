// ======================================================
// users/show ページ用 地図初期化
// ======================================================
console.log("map_user_show.js loaded");

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

async function initUserPostsMap() {
  const mapEl = document.getElementById("user-posts-map");
  if (!mapEl) {
    console.log("#user-posts-map not found");
    return;
  }

  // Google Maps API を読み込む
  if (!window.google || !google.maps || !google.maps.importLibrary) {
    console.log("Google Maps not loaded, loading now...");
    await loadGoogleMaps();
  }

  const { Map } = await google.maps.importLibrary("maps");

  // 新規 map を生成（キャッシュは使わない）
  const map = new Map(mapEl, {
    zoom: 15,
    center: { lat: 35.0, lng: 135.0 },
    mapId: "YOUR_MAP_ID",
  });

  // ユーザーID取得
  const userId = window.location.pathname.split("/").pop();

  try {
    const response = await fetch(`/users/${userId}/posts`);
    const posts = await response.json();

    if (!Array.isArray(posts)) {
      console.error("Posts JSON invalid:", posts);
      return map;
    }

    const bounds = new google.maps.LatLngBounds();

    posts.forEach((post) => {
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

      marker.addListener("click", () => infoWindow.open(map, marker));
      bounds.extend({ lat: post.latitude, lng: post.longitude });
    });

    // 全マーカーを収める
    map.fitBounds(bounds);
    google.maps.event.addListenerOnce(map, "bounds_changed", () => {
      if (map.getZoom() > 15) map.setZoom(15);
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  console.log("User posts map initialized");
  return map;
}

// ----------------------
// Turbo / Turbolinks 対応
// ----------------------
document.addEventListener("turbo:load", () => initUserPostsMap());
document.addEventListener("turbo:render", () => initUserPostsMap());
document.addEventListener("turbolinks:load", () => initUserPostsMap());

// ページロード時の保険
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(() => initUserPostsMap(), 0);
}
