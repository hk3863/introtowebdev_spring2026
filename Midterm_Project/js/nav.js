document.addEventListener('DOMContentLoaded', function () {
  var mobileMenu = document.getElementById('mobile-menu');
  var menu = document.getElementById('menu');

  if (mobileMenu && menu) {
    mobileMenu.addEventListener('click', function () {
      menu.classList.toggle('show');
    });
  }
});
