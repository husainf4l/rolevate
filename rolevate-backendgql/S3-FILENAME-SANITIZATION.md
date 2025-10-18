# S3 Filename Sanitization

## Overview

The AWS S3 service now automatically sanitizes filenames to ensure valid S3 URLs without requiring URL encoding.

## Problem Fixed

### Before (❌ Issue):
```
Original: "CV Sahar Remawe -2025.pdf"
S3 URL: "https://bucket.s3.amazonaws.com/cvs/123/uuid-CV Sahar Remawe -2025.pdf"
Result: Invalid URL with spaces ❌
```

### After (✅ Fixed):
```
Original: "CV Sahar Remawe -2025.pdf"
Sanitized: "CV-Sahar-Remawe-2025.pdf"
S3 URL: "https://bucket.s3.amazonaws.com/cvs/123/uuid-CV-Sahar-Remawe-2025.pdf"
Result: Valid URL without spaces ✅
```

## How It Works

The `sanitizeFilename()` method performs the following transformations:

### 1. **Trim Spaces**
```typescript
"  filename.pdf  " → "filename.pdf"
```

### 2. **Replace Spaces with Hyphens**
```typescript
"my file name.pdf" → "my-file-name.pdf"
"CV Sahar Remawe.pdf" → "CV-Sahar-Remawe.pdf"
```

### 3. **Remove Special Characters**
Only keeps: letters, numbers, dots, hyphens, underscores
```typescript
"file@name#2024!.pdf" → "filename2024.pdf"
"résumé_2024.pdf" → "rsum_2024.pdf"
```

### 4. **Collapse Multiple Hyphens**
```typescript
"file---name.pdf" → "file-name.pdf"
```

### 5. **Remove Leading/Trailing Hyphens**
```typescript
"-filename-.pdf" → "filename.pdf"
```

### 6. **Handle Empty Filenames**
```typescript
"" → "file-1697544600000"
"..." → "file-1697544600000"
```

## Examples

| Original Filename | Sanitized Filename |
|-------------------|-------------------|
| `CV Sahar Remawe -2025.pdf` | `CV-Sahar-Remawe-2025.pdf` |
| `John Doe Resume (Updated).docx` | `John-Doe-Resume-Updated.docx` |
| `My CV - Final Version!!!.pdf` | `My-CV-Final-Version.pdf` |
| `résumé 2024.pdf` | `rsum-2024.pdf` |
| `file   with   spaces.txt` | `file-with-spaces.txt` |
| `@#$%.pdf` | `file-1697544600000.pdf` |

## Applied To

The sanitization is automatically applied to:

### 1. CV Uploads (`uploadCV`)
```typescript
await awsS3Service.uploadCV(buffer, "CV Sahar Remawe -2025.pdf", candidateId);
// Result: cvs/candidate-id/uuid-CV-Sahar-Remawe-2025.pdf
```

### 2. General File Uploads (`uploadFile`)
```typescript
await awsS3Service.uploadFile(buffer, "My Document.pdf", "documents");
// Result: documents/uuid-My-Document.pdf
```

### 3. GraphQL Upload Mutations
```graphql
mutation UploadCV {
  uploadCVToS3(
    base64File: "..."
    filename: "CV Sahar Remawe -2025.pdf"
    mimetype: "application/pdf"
  ) {
    url  # Returns: https://bucket.s3.amazonaws.com/cvs/.../uuid-CV-Sahar-Remawe-2025.pdf
  }
}
```

## Benefits

### ✅ Valid URLs
- No spaces in URLs
- No URL encoding needed
- Works with all browsers and clients

### ✅ Better SEO
- Clean, readable URLs
- Search engine friendly

### ✅ Consistent Naming
- Predictable file naming
- Easy to search and filter

### ✅ No Breaking Changes
- Original filename preserved in S3 metadata
- Transparent to users

## S3 Metadata

The original filename is preserved in S3 metadata:

```typescript
{
  Metadata: {
    originalName: "CV Sahar Remawe -2025.pdf",  // Original preserved
    candidateId: "candidate-123",
    uploadedAt: "2025-10-17T10:00:00.000Z"
  }
}
```

You can retrieve the original name if needed:
```typescript
const metadata = await s3.headObject({ Bucket, Key });
const originalName = metadata.Metadata?.originalName;
```

## Logging

The service logs each sanitization:

```
📝 Sanitized filename: "CV Sahar Remawe -2025.pdf" → "CV-Sahar-Remawe-2025.pdf"
☁️ Uploading CV to S3: cvs/candidate-123/uuid-CV-Sahar-Remawe-2025.pdf
✅ CV uploaded to S3: https://bucket.s3.amazonaws.com/cvs/candidate-123/uuid-CV-Sahar-Remawe-2025.pdf
```

## Testing

### Test Different Filenames

```typescript
const testCases = [
  "CV Sahar Remawe -2025.pdf",
  "John Doe Resume (Updated).docx",
  "My CV - Final Version!!!.pdf",
  "résumé 2024.pdf",
  "file   with   spaces.txt",
];

for (const filename of testCases) {
  const result = await uploadCV(buffer, filename);
  console.log('Original:', filename);
  console.log('Result URL:', result);
  console.log('---');
}
```

### GraphQL Test

```graphql
mutation TestUpload {
  uploadCVToS3(
    base64File: "JVBERi0xLjQK..."
    filename: "CV Sahar Remawe -2025.pdf"
    mimetype: "application/pdf"
  ) {
    url
    key
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "uploadCVToS3": {
      "url": "https://bucket.s3.amazonaws.com/cvs/.../uuid-CV-Sahar-Remawe-2025.pdf",
      "key": "cvs/.../uuid-CV-Sahar-Remawe-2025.pdf"
    }
  }
}
```

## Configuration

No configuration needed! Sanitization is automatic and built-in.

## Best Practices

### For Frontend Developers:

1. **Don't Pre-Sanitize Filenames**
   - Let the backend handle it
   - Send original filenames as-is

2. **Display Original Names to Users**
   - Show "CV Sahar Remawe -2025.pdf" in UI
   - Backend will sanitize automatically

3. **Handle URLs Correctly**
   - Use returned URL from API
   - Don't modify or encode it

### For Backend Developers:

1. **Original Names in Metadata**
   - Always preserved in S3 metadata
   - Can be retrieved if needed

2. **Logging**
   - Check logs to see sanitization
   - Verify URLs are clean

3. **Testing**
   - Test with various filename formats
   - Verify URLs work in browsers

## Security Considerations

### ✅ Prevents Path Traversal
```typescript
"../../etc/passwd" → "..etcpasswd"
```

### ✅ Removes Command Injection Characters
```typescript
"file; rm -rf /.pdf" → "file-rm-rf-.pdf"
```

### ✅ SQL Injection Safe
```typescript
"file'; DROP TABLE--.pdf" → "file-DROP-TABLE--.pdf"
```

## Edge Cases Handled

### Empty or Invalid Filenames
```typescript
"" → "file-1697544600000"
"." → "file-1697544600000"
"..." → "file-1697544600000"
"@#$%" → "file-1697544600000"
```

### Long Filenames
Original functionality preserved - no length truncation

### Unicode Characters
```typescript
"résumé.pdf" → "rsum.pdf"
"файл.pdf" → ".pdf" → "file-1697544600000.pdf"
```

### Multiple Extensions
```typescript
"file.backup.pdf" → "file.backup.pdf" ✅
```

## Troubleshooting

### Issue: URL still has %20 in browser
**Cause:** Browser is URL-encoding the URL
**Solution:** URLs are already clean, no action needed

### Issue: Can't find file with original name
**Cause:** File was sanitized during upload
**Solution:** Use the URL returned from upload API

### Issue: Special characters missing
**Cause:** Special characters are removed for security
**Solution:** This is intentional and correct behavior

## Related Documentation

- [GRAPHQL-FILE-UPLOAD-GUIDE.md](./GRAPHQL-FILE-UPLOAD-GUIDE.md) - File upload guide
- [UPLOAD-SOLUTION-SUMMARY.md](./UPLOAD-SOLUTION-SUMMARY.md) - Upload solution
- [FILE-SIZE-LIMITS.md](./FILE-SIZE-LIMITS.md) - Size limits

---

## Status: ✅ FIXED

Filename sanitization is now automatic for all S3 uploads. No spaces or special characters in URLs!

**Before:**
```
https://bucket.s3.amazonaws.com/cvs/123/uuid-CV Sahar Remawe -2025.pdf ❌
```

**After:**
```
https://bucket.s3.amazonaws.com/cvs/123/uuid-CV-Sahar-Remawe-2025.pdf ✅
```
