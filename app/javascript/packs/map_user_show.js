window.initUserPostsMap = async function () {
  const mapEl = document.getElementById("user-posts-map");
  if (!mapEl) return;

  const map = new google.maps.Map(mapEl, {
    zoom: 4,
    center: { lat: 35.0, lng: 135.0 },
  });

  const userId = window.location.pathname.split("/").pop();
  const response = await fetch(`/users/${userId}/posts`);
  const posts = await response.json();

  if (!Array.isArray(posts)) {
    console.error("Posts JSON is invalid:", posts);
    return;
  }

  const bounds = new google.maps.LatLngBounds();

  posts.forEach((post) => {
    const marker = new google.maps.Marker({
      position: { lat: post.latitude, lng: post.longitude },
      map,
    });

    // --- InfoWindow
    const infoWindow = new google.maps.InfoWindow({
      content: `<div>${post.title}</div>`,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    bounds.extend({ lat: post.latitude, lng: post.longitude });
  });

  map.fitBounds(bounds);
};
