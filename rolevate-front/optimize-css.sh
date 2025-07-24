#!/bin/bash

# CSS Optimization Script
# This script helps optimize CSS loading by separating critical and non-critical styles

echo "Optimizing CSS for better Core Web Vitals..."

# Create optimized CSS structure
mkdir -p src/styles/components
mkdir -p src/styles/critical

# Move critical styles to separate files
echo "/* Critical above-the-fold styles for hero section */" > src/styles/critical/hero.css
echo "/* Critical layout styles */" > src/styles/critical/layout.css

# Create non-critical CSS files
echo "/* Non-critical component styles */" > src/styles/components/components.css
echo "/* Non-critical utility styles */" > src/styles/components/utilities.css

echo "CSS optimization structure created!"
echo "Remember to:"
echo "1. Move hero section styles to critical/hero.css"
echo "2. Move layout styles to critical/layout.css"
echo "3. Keep component styles in components/ folder"
echo "4. Load critical CSS inline and defer non-critical CSS"
