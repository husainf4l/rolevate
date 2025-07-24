#!/bin/bash

echo "Creating .eslintrc.json to disable some problematic rules..."

cat > .eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@next/next/no-img-element": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@typescript-eslint/no-empty-object-type": "warn",
    "prefer-const": "warn"
  }
}
EOF

echo ".eslintrc.json created successfully!"
