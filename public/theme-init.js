/* Applies the visitor's saved colour mode before the page is painted (no light/dark flash). Dark is the default. */
(function () {
  try { if (localStorage.getItem('cw-mode') === 'light') { document.documentElement.setAttribute('data-mode', 'light'); var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', '#f4f7fc'); } } catch (e) { /* storage blocked */ }
})();
