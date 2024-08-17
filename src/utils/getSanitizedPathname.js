export default function getSanitizedPathname() {
  return window.location.pathname
    .replace(/\/mesocycles\/([a-zA-Z0-9]+)/, '/mesocycles/:mesoId')
    .replace(/\/weeks\/([a-zA-Z0-9]+)/, '/weeks/:weekNum')
    .replace(/\/days\/([a-zA-Z0-9]+)/, '/days/:dayNum');
}
