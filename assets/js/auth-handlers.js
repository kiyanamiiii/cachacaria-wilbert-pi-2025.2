// js/auth-handlers.js
(function (document, window) {
  "use strict";

  // auth handlers
  function textOf(el) {
    return el ? String(el.value || "").trim() : "";
  }
  function setFeedback(el, msg) {
    if (!el) return;
    el.textContent = msg;
  }

  document.addEventListener("DOMContentLoaded", function () {
    // login
    var loginForm = document.getElementById("login-form");
    var loginFeedback = document.getElementById("login-feedback");
    if (loginForm) {
      loginForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        setFeedback(loginFeedback, "");

        var email = textOf(document.getElementById("loginEmail"));
        var password = textOf(document.getElementById("loginPassword"));
        if (!email || !password) {
          setFeedback(loginFeedback, "preencha todos os campos.");
          return;
        }

        var modal = window.modalHelper.create(
          "auth-modal",
          "Login successful",
          "you will be redirected to the home page."
        );
        modal.show();

        setTimeout(function () {
          try {
            modal.hide();
          } catch (e) {}
          window.location.href = "index.html";
        }, 900);
      });
    }

    // register
    var registerForm = document.getElementById("register-form");
    var registerFeedback = document.getElementById("register-feedback");
    if (registerForm) {
      registerForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        setFeedback(registerFeedback, "");

        var email = textOf(document.getElementById("regEmail"));
        var password = textOf(document.getElementById("regPassword"));
        var phone = textOf(document.getElementById("regPhone"));
        if (!email || !password || !phone) {
          setFeedback(registerFeedback, "preencha todos os campos.");
          return;
        }

        var modal = window.modalHelper.create(
          "auth-modal",
          "registration successful",
          "account created. redirecting to login."
        );
        modal.show();

        setTimeout(function () {
          try {
            modal.hide();
          } catch (e) {}
          window.location.href = "login.html";
        }, 900);
      });
    }
  });
})(document, window);
