// js/modal.js
(function (window, document) {
  "use strict";

  // modal helper
  function create(id, title, bodyHtml) {
    var el = document.getElementById(id);
    if (!el) {
      var wrap = document.createElement("div");
      wrap.innerHTML =
        '<div class="modal fade" id="' +
        id +
        '" tabindex="-1" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title">' +
        title +
        "</h5>" +
        '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>' +
        "</div>" +
        '<div class="modal-body">' +
        bodyHtml +
        "</div>" +
        "</div></div></div>";
      document.body.appendChild(wrap.firstElementChild);
      el = document.getElementById(id);
    } else {
      var t = el.querySelector(".modal-title");
      var b = el.querySelector(".modal-body");
      if (t) t.textContent = title;
      if (b) b.innerHTML = bodyHtml;
    }

    return {
      show: function () {
        if (typeof bootstrap === "undefined") {
          console.error("bootstrap required");
          return;
        }
        var inst = new bootstrap.Modal(el);
        inst.show();
        return inst;
      },
      hide: function () {
        try {
          new bootstrap.Modal(el).hide();
        } catch (e) {}
      },
      element: el,
    };
  }

  window.modalHelper = { create: create };
})(window, document);
