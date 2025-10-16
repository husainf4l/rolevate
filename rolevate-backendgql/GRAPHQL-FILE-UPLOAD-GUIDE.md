# GraphQL File Upload Best Practices

## Overview

This project implements **modern GraphQL file uploads using base64 encoding** for Apollo Server 5 + Fastify + NestJS.

## Why Base64 Instead of Multipart?

### The Problem with Multipart Uploads

Apollo Server removed built-in file upload support starting from version 4:
- ❌ `graphql-upload` package is no longer supported
- ❌ Multipart request spec causes compatibility issues
- ❌ Complex to implement with Fastify
- ❌ Requires additional middleware configuration

### Why Base64 is Better

✅ **Simple**: Just send file as a string  
✅ **Reliable**: Works with all GraphQL implementations  
✅ **Compatible**: No middleware conflicts  
✅ **Industry Standard**: Used by GitHub, Shopify, Stripe APIs  
✅ **Type Safe**: String type in GraphQL schema  
✅ **Framework Agnostic**: Works with Apollo, Mercurius, etc.

## How It Works

### 1. Client Side (Frontend)

```typescript
// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/png;base64, prefix
      const base64Content = base64.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
  });
}

// Upload mutation
const UPLOAD_FILE = gql`
  mutation UploadFile($base64File: String!, $filename: String!, $mimetype: String!, $folder: String) {
    uploadFileToS3(
      base64File: $base64File
      filename: $filename
      mimetype: $mimetype
      folder: $folder
    ) {
      url
      key
      bucket
    }
  }
`;

// Usage
const [uploadFile] = useMutation(UPLOAD_FILE);

const handleFileUpload = async (file: File) => {
  const base64 = await fileToBase64(file);
  
  const { data } = await uploadFile({
    variables: {
      base64File: base64,
      filename: file.name,
      mimetype: file.type,
      folder: 'uploads',
    },
  });
  
  console.log('Uploaded:', data.uploadFileToS3.url);
};
```

### 2. React Example

```tsx
import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const UPLOAD_FILE = gql`
  mutation UploadFile($base64File: String!, $filename: String!, $mimetype: String!) {
    uploadFileToS3(
      base64File: $base64File
      filename: $filename
      mimetype: $mimetype
    ) {
      url
    }
  }
`;

export function FileUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploadFile] = useMutation(UPLOAD_FILE);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const { data } = await uploadFile({
          variables: {
            base64File: base64,
            filename: file.name,
            mimetype: file.type,
          },
        });
        
        alert(`Uploaded! URL: ${data.uploadFileToS3.url}`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} disabled={uploading} />
      {uploading && <span>Uploading...</span>}
    </div>
  );
}
```

### 3. Angular Example

```typescript
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const UPLOAD_FILE = gql`
  mutation UploadFile($base64File: String!, $filename: String!, $mimetype: String!) {
    uploadFileToS3(
      base64File: $base64File
      filename: $filename
      mimetype: $mimetype
    ) {
      url
      key
      bucket
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private apollo: Apollo) {}

  async uploadFile(file: File): Promise<string> {
    const base64 = await this.fileToBase64(file);
    
    const result = await this.apollo.mutate({
      mutation: UPLOAD_FILE,
      variables: {
        base64File: base64,
        filename: file.name,
        mimetype: file.type,
      },
    }).toPromise();

    return result.data.uploadFileToS3.url;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }
}
```

### 4. Vue.js Example

```vue
<template>
  <div>
    <input type="file" @change="handleFileUpload" :disabled="uploading" />
    <p v-if="uploading">Uploading...</p>
    <p v-if="uploadedUrl">Uploaded: {{ uploadedUrl }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const UPLOAD_FILE = gql`
  mutation UploadFile($base64File: String!, $filename: String!, $mimetype: String!) {
    uploadFileToS3(
      base64File: $base64File
      filename: $filename
      mimetype: $mimetype
    ) {
      url
    }
  }
`;

const uploading = ref(false);
const uploadedUrl = ref('');
const { mutate: uploadFile } = useMutation(UPLOAD_FILE);

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  try {
    const base64 = await fileToBase64(file);
    
    const result = await uploadFile({
      base64File: base64,
      filename: file.name,
      mimetype: file.type,
    });
    
    uploadedUrl.value = result?.data?.uploadFileToS3?.url || '';
  } finally {
    uploading.value = false;
  }
};
</script>
```

## GraphQL Schema

```graphql
type Mutation {
  """Upload a file to S3 using base64 encoding"""
  uploadFileToS3(
    base64File: String!
    filename: String!
    mimetype: String!
    folder: String
  ): S3UploadResponse!

  """Upload a CV/resume to S3"""
  uploadCVToS3(
    base64File: String!
    filename: String!
    mimetype: String!
    candidateId: String
  ): S3UploadResponse!
}

type S3UploadResponse {
  url: String!
  key: String!
  bucket: String
}
```

## File Size Limits

### Base64 Encoding Overhead

Base64 encoding increases file size by ~33%. Consider this when setting limits:

- Original file: 10MB
- Base64 encoded: ~13.3MB

### Recommended Limits

```typescript
// In your GraphQL configuration
{
  bodyLimit: 20 * 1024 * 1024, // 20MB (allows ~15MB files)
}
```

### For Large Files

For files > 20MB, consider:
1. **Presigned URLs**: Client uploads directly to S3
2. **Chunked Upload**: Split file into smaller chunks
3. **Resume Service**: Separate microservice for large files

## Testing

```bash
# Start the server
npm run start:dev

# Run upload tests
npx ts-node test-graphql-upload-base64.ts
```

## Comparison: Base64 vs Multipart

| Feature | Base64 Encoding | Multipart Upload |
|---------|-----------------|------------------|
| Simplicity | ✅ Very Simple | ❌ Complex |
| Apollo Server 5 Support | ✅ Native | ❌ Removed |
| Fastify Compatibility | ✅ Perfect | ⚠️ Requires Plugin |
| File Size Overhead | ⚠️ +33% | ✅ None |
| Browser Support | ✅ Universal | ✅ Universal |
| Type Safety | ✅ String | ⚠️ Custom Scalar |
| Error Handling | ✅ Standard GraphQL | ⚠️ Complex |
| Industry Adoption | ✅ GitHub, Shopify | ⚠️ Declining |

## Advantages

### For Small-Medium Files (< 20MB)
✅ **Perfect Solution**
- Resume/CV uploads
- Profile pictures
- Documents (PDF, DOCX)
- Images
- Small videos

### Benefits
- No middleware configuration needed
- Works with all GraphQL servers
- Simple to implement
- Easy to test
- Type-safe
- Standard GraphQL errors

## When to Use Alternatives

### Presigned URLs (Recommended for Large Files)

For files > 20MB:

```graphql
type Mutation {
  """Generate a presigned URL for direct S3 upload"""
  generateUploadUrl(
    filename: String!
    mimetype: String!
    size: Int!
  ): PresignedUploadUrl!
}

type PresignedUploadUrl {
  uploadUrl: String!
  fileUrl: String!
  expiresIn: Int!
}
```

Client uploads directly to S3 using the presigned URL, bypassing the GraphQL server.

## Migration from Multipart

If you were using `graphql-upload`:

### Before (Multipart - Deprecated)
```typescript
@Mutation(() => Boolean)
async uploadFile(
  @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload
) {
  const { createReadStream, filename } = await file;
  // ...
}
```

### After (Base64 - Current Best Practice)
```typescript
@Mutation(() => S3UploadResponse)
async uploadFileToS3(
  @Args('base64File') base64File: string,
  @Args('filename') filename: string,
  @Args('mimetype') mimetype: string,
) {
  const buffer = Buffer.from(base64File, 'base64');
  // ...
}
```

## Security Considerations

1. **File Type Validation**: Always validate `mimetype` on the server
2. **File Size Limits**: Set appropriate GraphQL body limits
3. **Virus Scanning**: Consider scanning uploaded files
4. **Rate Limiting**: Prevent abuse with rate limits
5. **Authentication**: Require auth for upload mutations

## Performance Tips

1. **Compression**: Compress images before base64 encoding
2. **Progressive Upload**: Show upload progress with chunks
3. **Lazy Loading**: Don't load entire file into memory
4. **CDN**: Use CloudFront or similar for file delivery
5. **Caching**: Cache presigned URLs when possible

## Conclusion

Base64 encoding is the **modern best practice** for GraphQL file uploads with Apollo Server 5, Fastify, and NestJS. It's:

- ✅ Simple and reliable
- ✅ Framework agnostic  
- ✅ Industry standard
- ✅ Easy to test and debug
- ✅ Fully type-safe

For large files (> 20MB), use presigned URLs instead.
