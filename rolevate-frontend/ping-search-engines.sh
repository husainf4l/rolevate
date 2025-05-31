#!/bin/bash

# This script will ping search engines to notify them about your sitemap
# Make sure to run this script after deploying changes to your site

# Your sitemap URL
SITEMAP_URL="https://rolevate.com/sitemap.xml"

# Note: Google no longer supports sitemap pings as of June 2023
# Instead, submit your sitemap through Google Search Console
echo "Note: Google no longer supports sitemap pings."
echo "Please submit your sitemap through Google Search Console:"
echo "https://search.google.com/search-console"
echo ""

# Ping Bing
echo "Pinging Bing..."
curl "https://www.bing.com/ping?sitemap=$SITEMAP_URL"
echo ""

# Ping Yandex
echo "Pinging Yandex..."
curl "https://webmaster.yandex.com/ping?sitemap=$SITEMAP_URL"
echo ""

echo "Pinging complete. Sitemap notifications sent to search engines."
