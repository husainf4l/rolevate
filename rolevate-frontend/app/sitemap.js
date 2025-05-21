export default function sitemap() {
  const baseUrl = "https://rolevate.com";

  // Core pages
  const routes = [
    "",
    "/try-it-now",
    "/schedule-meeting",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly',
    priority: route === "" ? 1.0 : 0.8,
  }));

  return routes;
}
