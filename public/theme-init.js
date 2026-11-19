/* Applies the visitor's saved colour mode before the page is painted (no light/dark flash). Dark is the default. */
(function () {
  try { if (localStorage.getItem('cw-mode') === 'light') document.documentElement.setAttribute('data-mode', 'light'); } catch (e) { /* storage blocked */ }
})();
