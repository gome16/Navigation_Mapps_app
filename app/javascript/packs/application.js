// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import "channels"

// bootstrap導入
import 'bootstrap'
import '@fortawesome/fontawesome-free/js/all'
import jQuery from 'jquery'
window.jQuery = window.$ = jQuery

Rails.start()
Turbolinks.start()
ActiveStorage.start()


// 一覧投稿から投稿詳細画面へのリンク
document.addEventListener("turbolinks:load", () => {
  document.querySelectorAll("tr.post-row").forEach((row) => {
    row.addEventListener("click", () => {
      const href = row.dataset.href;
      if (href) {
        window.location.href = href;
      }
    });
  });
});
