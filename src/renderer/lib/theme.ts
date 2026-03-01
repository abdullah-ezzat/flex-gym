export function toggleTheme() {
  const root = document.documentElement;
  const current = root.dataset.theme;

  if (current === "red") {
    root.dataset.theme = "dark";
  } else {
    root.dataset.theme = "red";
  }
}
