// posts/indexにて全投稿を表示する機能

// ブートストラップ ローダ <%= javascript_pack_tag 'map', 'data-turbolinks-track': 'reload' %>を読み込む記載
(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
  key: process.env.Maps_API_Key
});

// ライブラリの読み込み
let map;

// 初期位置設定
async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  const {AdvancedMarkerElement} = await google.maps.importLibrary("marker") // 追記

  map = new Map(document.getElementById("map"), {
    center: { lat: 35.681236, lng: 139.767125 },
    zoom: 15,
    mapId: "DEMO_MAP_ID",
    mapTypeControl: false
  });

  // json.jbuilderの指定
  try {
    const response = await fetch("/posts.json");
    if (!response.ok) throw new Error('Network response was not ok');

    const { data: { posts } } = await response.json();
    if (!Array.isArray(posts)) throw new Error("posts is not an array");

    posts.forEach( post => {
      const latitude = post.latitude;
      const longitude = post.longitude;
      const userName = post.user.name;
      const userImage = post.user.image;
      const address = post.address;

      const postTitle = post.title;

      const marker = new google.maps.marker.AdvancedMarkerElement ({
        position: { lat: latitude, lng: longitude },
        map,
        title: postTitle,
      });

      // マーカークリック時の情報
      const contentString = `
        <div class="information container p-0">
          <a href="${post.user.url}" style="text-decoration: none; color: black;">
            <div class="mb-3 d-flex align-posts-center">
              <img class="rounded-circle mr-2" src="${userImage}" width="40" height="40">
              <p class="lead m-0 font-weight-bold">${userName}</p>
            </div>
          </a>
          <div>
            <a href="${post.url}" style="text-decoration: none; color: black;">
              <h1 class="h4 font-weight-bold">${postTitle}</h1>
            </a>
            <p class="text-muted">${address}</p>
          </div>
        </div>
      `;
      
      const infowindow = new google.maps.InfoWindow({
        content: contentString,
        ariaLabel: postTitle,
      });
      
      marker.addListener("click", () => {
          infowindow.open({
          anchor: marker,
          map,
        })
      });

    });
  } catch (error) {
    console.error('Error fetching or processing post images:', error);
  }
}

initMap()
