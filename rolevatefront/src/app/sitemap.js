export default function sitemap() {
  const baseUrl = "https://rolevate.com";

  // Core pages
  const routes = [
    "",
    "/jobs",
    "/try-it-now",
    "/schedule-meeting",
    "/privacy-policy",
    "/terms-of-service",
    "/data-deletion",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: route === "" ? 1.0 : 0.8,
  }));

  return routes;
}
