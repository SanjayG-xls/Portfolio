/**
 * Theme Controller (Light / Dark Mode)
 * Ensures instant theme rendering without flash-of-unstyled-content (FOUC)
 */
(function () {
  const STORAGE_KEY = 'sanjay_portfolio_theme';

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to system preference; if undefined, default to dark for engineering aesthetic
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Apply immediately before DOM fully loads to prevent flash
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Expose toggle function globally
  window.toggleTheme = function () {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  };

  // Listen to system changes if user hasn't explicitly set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();

