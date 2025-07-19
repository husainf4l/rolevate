# AWS S3 Public Access Configuration Guide

## To make your S3 bucket publicly accessible, you need to:

### 1. Update Block Public Access Settings (AWS Console)

Go to AWS S3 Console → Your Bucket (4wk-garage-media) → Permissions → Block Public Access

- Uncheck "Block all public access"
- Save changes

### 2. Add Bucket Policy (AWS Console)

Go to Bucket → Permissions → Bucket Policy, add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::4wk-garage-media/recordings/*"
    }
  ]
}
```

### 3. CLI Commands (if you have admin permissions)

# Disable block public access

aws s3api put-public-access-block --bucket 4wk-garage-media --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Apply bucket policy

aws s3api put-bucket-policy --bucket 4wk-garage-media --policy file://bucket-policy.json

# Make specific file public

aws s3api put-object-acl --bucket 4wk-garage-media --key recordings/interview_cmczxtdqd000biu9rvb6jcrde_1752897762788_AJ_pYPuVR489V8C.mp4 --acl public-read

### 4. Alternative: Use CloudFront for better performance

Create a CloudFront distribution pointing to your S3 bucket for faster, global access.

### Direct Public URL (after making public):

https://4wk-garage-media.s3.me-central-1.amazonaws.com/recordings/interview_cmczxtdqd000biu9rvb6jcrde_1752897762788_AJ_pYPuVR489V8C.mp4

## Security Note:

Making files public means anyone with the URL can access them.
Consider using CloudFront with signed URLs for better security while maintaining accessibility.
