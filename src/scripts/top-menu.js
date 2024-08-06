// scripts/top-menu.js
/**
 * Toggles the hamburger menu.
 *
 * @since 1.0.0
 */
function menuToggle() {
  var menu = document.getElementById("top-nav-menu");
  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}
