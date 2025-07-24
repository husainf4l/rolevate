#!/bin/bash

# Fix common ESLint issues
cd "$(dirname "$0")"

echo "Fixing unescaped quotes and common issues..."

# Function to fix unescaped quotes in JSX
fix_quotes() {
    local file="$1"
    echo "Processing $file..."
    
    # Create temporary file
    local temp_file=$(mktemp)
    
    # Fix common patterns (be careful with regex to not break actual code)
    sed 's/>[[:space:]]*\([^<]*\)'\''s\([^<]*\)</>\1\&apos;s\2</g' "$file" > "$temp_file"
    sed -i 's/>[[:space:]]*\([^<]*\)'\''ll\([^<]*\)</>\1\&apos;ll\2</g' "$temp_file"
    sed -i 's/>[[:space:]]*\([^<]*\)'\''re\([^<]*\)</>\1\&apos;re\2</g' "$temp_file"
    sed -i 's/>[[:space:]]*\([^<]*\)'\''ve\([^<]*\)</>\1\&apos;ve\2</g' "$temp_file"
    sed -i 's/>[[:space:]]*\([^<]*\)'\''d\([^<]*\)</>\1\&apos;d\2</g' "$temp_file"
    sed -i 's/>[[:space:]]*\([^<]*\)'\''t\([^<]*\)</>\1\&apos;t\2</g' "$temp_file"
    
    # Move temp file back
    mv "$temp_file" "$file"
}

# Apply to files that commonly have these issues
for file in \
    "src/app/(website)/privacy-policy/page.tsx" \
    "src/app/(website)/terms-of-service/page.tsx" \
    "src/components/corporate/CorporateFeatures.tsx" \
    "src/components/homepage/SuccessStories.tsx" \
    "src/components/homepage/CVUploadSection.tsx" \
    "src/components/dashboard/JobRecommendations.tsx" \
    "src/app/userdashboard/saved-jobs/page.tsx" \
    "src/app/userdashboard/applications/[jobId]/page.tsx" \
    "src/app/userdashboard/interviews/page.tsx" \
    "src/app/userdashboard/cv/page.tsx" \
    "src/app/dashboard/profile/page.tsx" \
    "src/app/dashboard/candidates/[id]/page.tsx" \
    "src/app/dashboard/jobs/[id]/applications/[applicationId]/page.tsx" \
    "src/components/job/AnonymousApplicationForm.tsx" \
    "src/components/job/JobDetailsStep.tsx" \
    "src/app/room/components/ConnectionManager.tsx"
do
    if [ -f "$file" ]; then
        fix_quotes "$file"
    fi
done

echo "Quote fixing completed!"
