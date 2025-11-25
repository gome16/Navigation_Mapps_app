// posts/showにて指定の投稿のマーカーのみ表示する機能

// ブートストラップ ローダ <%= javascript_pack_tag 'map', 'data-turbolinks-track': 'reload' %>を読み込む記載
(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
  key: process.env.Maps_API_Key
});

document.addEventListener("turbolinks:load", async () => {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  // show.html.erb から受け取ったデータ
  const lat = parseFloat(mapEl.dataset.lat);
  const lng = parseFloat(mapEl.dataset.lng);

  // Google Maps 読み込み
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const map = new Map(mapEl, {
    zoom: 15,
    center: { lat, lng },
    mapId: "YOUR_MAP_ID",
  });

  // 投稿単体のマーカー
  const marker = new AdvancedMarkerElement({
    map,
    position: { lat, lng },
  });

  marker.addListener("click", () => {
    info.open(map, marker);
  });
});
