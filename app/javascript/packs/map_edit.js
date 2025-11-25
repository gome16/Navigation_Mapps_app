window.initEditPostMap = function () {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const lat = parseFloat(mapEl.dataset.lat);
  const lng = parseFloat(mapEl.dataset.lng);

  const map = new google.maps.Map(mapEl, {
    zoom: 15,
    center: { lat, lng },
  });

  // 保存済みマーカー
  let marker = new google.maps.Marker({
    position: { lat, lng },
    map: map,
  });

  // hidden_field に初期値
  document.getElementById("post_latitude").value = lat;
  document.getElementById("post_longitude").value = lng;

  // クリックでマーカーを移動
  map.addListener("click", (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();

    marker.setPosition(e.latLng); // 移動
    document.getElementById("post_latitude").value = newLat;
    document.getElementById("post_longitude").value = newLng;
  });
};
