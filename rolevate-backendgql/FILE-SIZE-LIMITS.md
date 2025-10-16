# File Size Limits Configuration

## Current Configuration

The server is configured with a **50MB body limit** in Fastify, which allows for:

- **Original file size**: Up to ~37MB
- **Base64 encoded size**: Up to 50MB (after ~33% encoding overhead)

## Configuration Location

### src/main.ts
```typescript
const fastifyAdapter = new FastifyAdapter({
  bodyLimit: 50 * 1024 * 1024, // 50MB limit
});
```

## Base64 Encoding Overhead

Base64 encoding increases file size by approximately **33%**:

| Original File Size | Base64 Encoded Size | Fits in 50MB Limit? |
|-------------------|---------------------|---------------------|
| 1 MB              | ~1.3 MB             | ✅ Yes              |
| 10 MB             | ~13.3 MB            | ✅ Yes              |
| 20 MB             | ~26.6 MB            | ✅ Yes              |
| 30 MB             | ~40 MB              | ✅ Yes              |
| 37 MB             | ~49.2 MB            | ✅ Yes              |
| 40 MB             | ~53.2 MB            | ❌ No (too large)   |
| 50 MB             | ~66.5 MB            | ❌ No (too large)   |

## Recommended File Sizes by Type

### ✅ Ideal for Base64 Upload (< 10MB)
- **PDFs**: Resumes, documents, reports
- **Images**: Profile pictures, logos, screenshots
- **Office Documents**: Word, Excel, PowerPoint (compressed)
- **Certificates**: Educational, professional certifications

### ⚠️ Acceptable but Large (10-30MB)
- **Large PDFs**: Multi-page documents with images
- **High-resolution images**: Photos, graphics
- **Presentations**: With embedded media
- **Compressed videos**: Short clips

### ❌ Too Large for Base64 (> 30MB)
- **Videos**: Use presigned URLs instead
- **Large datasets**: CSV, JSON files
- **High-res media**: RAW images, uncompressed files
- **Archives**: Large ZIP files

## Error Messages

### 413 Request Entity Too Large

```json
{
    "statusCode": 413,
    "message": "Request body is too large",
    "timestamp": "2025-10-16T00:06:14.378Z",
    "path": "/graphql"
}
```

**Solution**: Either:
1. Compress the file before uploading
2. Reduce image quality/resolution
3. Use presigned URLs for large files
4. Increase the body limit (see below)

## Adjusting Limits

### To Allow Larger Files

Edit `src/main.ts`:

```typescript
const fastifyAdapter = new FastifyAdapter({
  bodyLimit: 100 * 1024 * 1024, // 100MB limit (allows ~75MB original files)
});
```

### Recommended Limits by Use Case

| Use Case | Body Limit | Max Original File |
|----------|-----------|-------------------|
| Small files only (CVs, images) | 10 MB | ~7.5 MB |
| Medium files (documents) | 20 MB | ~15 MB |
| **Current (recommended)** | **50 MB** | **~37 MB** |
| Large files | 100 MB | ~75 MB |
| Very large files | 200 MB | ~150 MB |

> ⚠️ **Warning**: Increasing limits beyond 100MB can impact server performance and memory usage.

## Alternative: Presigned URLs for Large Files

For files > 30MB, use presigned URLs instead:

```graphql
mutation GenerateUploadUrl {
  generateUploadUrl(
    filename: "large-video.mp4"
    mimetype: "video/mp4"
    size: 100000000  # 100MB
  ) {
    uploadUrl
    fileUrl
    expiresIn
  }
}
```

### Benefits of Presigned URLs
- ✅ No file size limits (S3 handles it)
- ✅ Faster uploads (direct to S3)
- ✅ No server memory usage
- ✅ Better for large files

### When to Use Each Method

| Method | Best For | File Size |
|--------|----------|-----------|
| **Base64 Encoding** | Small-medium files, simple uploads | < 30MB |
| **Presigned URLs** | Large files, direct S3 uploads | > 30MB |

## Frontend Considerations

### Client-Side Compression

Before base64 encoding, compress images:

```typescript
async function compressImage(file: File, maxSizeMB = 2): Promise<File> {
  // Use browser-image-compression or similar
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}
```

### Check File Size Before Upload

```typescript
const MAX_FILE_SIZE = 37 * 1024 * 1024; // 37MB (before base64)

function validateFileSize(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    alert(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    return false;
  }
  return true;
}
```

## Monitoring

### Server Metrics to Watch
- Memory usage during uploads
- Request processing time
- Failed upload rate
- 413 error frequency

### If You See Issues
1. Check server memory usage
2. Review file sizes being uploaded
3. Consider implementing file compression
4. Move large files to presigned URLs

## Summary

✅ **Current limit**: 50MB body (37MB original files)  
✅ **Best for**: PDFs, images, documents < 30MB  
⚠️ **For larger files**: Use presigned URLs  
🔧 **To adjust**: Modify `bodyLimit` in `src/main.ts`
