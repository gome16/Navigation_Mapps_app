// ======================================================
// users/show ページにて地図を表示する機能
// ======================================================
console.log("map_user_show.js loaded");

// ----------------------
// Google Maps Loader（1回だけ）
// ----------------------
async function loadGoogleMaps() {
  if (window.googleMapsLoaderAdded) {
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


// 地図初期化（毎回 マップ読み込み）
async function initUserPostsMap() {
  const mapEl = document.getElementById("user-posts-map");
  if (!mapEl) {
    return;
  }

  const userId = mapEl.dataset.userId;
  if (!userId) {
    console.error("data-user-id not found");
    return;
  }

  // Google Maps API ロード
  if (!window.google || !google.maps || !google.maps.importLibrary) {
    await loadGoogleMaps();
  }

  const { Map } = await google.maps.importLibrary("maps");

  // 新規 map 生成（キャッシュしない）
  const map = new Map(mapEl, {
    center: { lat: 35.681236, lng: 139.767125 }, // 東京
    zoom: 5,
    mapId: "YOUR_MAP_ID",
  });

  try {
    const response = await fetch(`/users/${userId}/posts`);
    const posts = await response.json();

    if (!Array.isArray(posts)) {
      console.error("Invalid posts JSON:", posts);
      return;
    }

    // 投稿が0件の場合の座標
    if (posts.length === 0) {
      map.setCenter({ lat: 35.681236, lng: 139.767125 });
      map.setZoom(15);
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    posts.forEach((post) => {
      if (!post.latitude || !post.longitude) return;

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

    // マーカーがある場合、マーカーの中心に座標を移動させる
    map.fitBounds(bounds);

    google.maps.event.addListenerOnce(map, "bounds_changed", () => {
      if (map.getZoom() > 15) {
        map.setZoom(15);
      }
    });

  } catch (error) {
    console.error("Error loading user posts:", error);
  }

  console.log("User posts map initialized");
}


// Turbo / Turbolinks　対応
document.addEventListener("turbo:load", initUserPostsMap);
document.addEventListener("turbo:render", initUserPostsMap);
document.addEventListener("turbolinks:load", initUserPostsMap);

// 初回ロード保険
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(initUserPostsMap, 0);
}
