# 📁 CV File Upload Implementation - Jobs API Update

## 🚀 **IMPLEMENTATION COMPLETE**

The Rolevate Jobs API now supports **CV file upload functionality** with the following features:

### ✅ **Completed Features**

1. **File Upload Handling**

   - Multer integration for file uploads
   - Support for PDF, DOC, and DOCX files
   - 5MB file size limit
   - Automatic file validation

2. **File Storage System**

   - Files stored in `/uploads/cvs/` directory
   - Unique filename generation: `cv_{timestamp}.{ext}`
   - Organized file structure for easy management

3. **CV Serving Endpoint**

   - **`GET /api/jobs/uploads/:phoneNumber/:timestamp`**
   - Direct file access for HR managers and system processing
   - Proper content-type headers for PDF files

4. **N8N Webhook Integration**

   - CV sent as **binary data (base64)** to N8N webhook
   - Complete file metadata included (filename, mimetype, size)
   - Enhanced webhook payload with CV data for processing

5. **Database Integration**
   - Unique candidate creation for each application
   - Proper CV URL storage in database
   - Maintains application history and analytics

---

## 🔧 **Technical Implementation**

### **Updated API Endpoint**

**`POST /api/jobs/:id/apply`** (Updated)

**Request Format**: `multipart/form-data`

```javascript
const formData = new FormData();
formData.append('cv', cvFile); // File object
formData.append('jobId', '04cf6f79-0000-4a04-bb3b-6733cd6b7361');
formData.append('firstName', 'Ahmad');
formData.append('lastName', 'Al-Rashid');
formData.append('email', 'ahmad.test@example.com');
formData.append('phoneNumber', '+962791234567');
formData.append('coverLetter', 'I am very interested...');

const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
  method: 'POST',
  body: formData, // No Content-Type header needed
});
```

### **New CV Serving Endpoint**

**`GET /api/jobs/uploads/:phoneNumber/:timestamp`**

```javascript
// Access uploaded CV file
const cvUrl = `/api/jobs/uploads/+962791234567/1749599529977`;
const cvResponse = await fetch(
  `${API_BASE_URL}/jobs/uploads/+962791234567/1749599529977`,
);
const cvBlob = await cvResponse.blob();
```

---

## 📋 **Frontend Integration Examples**

### **1. React CV Upload Component**

```jsx
import React, { useState } from 'react';

const JobApplicationForm = ({ jobId, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    coverLetter: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Validate file type
    if (
      file &&
      ![
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.type)
    ) {
      setErrors({ cv: 'Only PDF, DOC, and DOCX files are allowed' });
      return;
    }

    // Validate file size (5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors({ cv: 'File size must be less than 5MB' });
      return;
    }

    setCvFile(file);
    setErrors({ ...errors, cv: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const applicationFormData = new FormData();

      // Add all form fields
      applicationFormData.append('cv', cvFile);
      applicationFormData.append('jobId', jobId);
      applicationFormData.append('firstName', formData.firstName);
      applicationFormData.append('lastName', formData.lastName);
      applicationFormData.append('email', formData.email);
      applicationFormData.append('phoneNumber', formData.phoneNumber);
      applicationFormData.append('coverLetter', formData.coverLetter);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/jobs/${jobId}/apply`,
        {
          method: 'POST',
          body: applicationFormData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }

      const result = await response.json();
      onSuccess(result);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        coverLetter: '',
      });
      setCvFile(null);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-application-form">
      <div className="form-group">
        <label htmlFor="firstName">First Name *</label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name *</label>
        <input
          type="text"
          id="lastName"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number *</label>
        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          placeholder="+962791234567"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="cv">CV/Resume * (PDF, DOC, DOCX - Max 5MB)</label>
        <input
          type="file"
          id="cv"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          required
        />
        {errors.cv && <span className="error">{errors.cv}</span>}
        {cvFile && (
          <div className="file-info">
            Selected: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)}{' '}
            MB)
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="coverLetter">Cover Letter</label>
        <textarea
          id="coverLetter"
          value={formData.coverLetter}
          onChange={(e) =>
            setFormData({ ...formData, coverLetter: e.target.value })
          }
          rows={4}
          placeholder="Tell us why you're interested in this position..."
        />
      </div>

      {errors.submit && <div className="error">{errors.submit}</div>}

      <button type="submit" disabled={loading || !cvFile}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
};

export default JobApplicationForm;
```

### **2. Vue.js Implementation**

```vue
<template>
  <form @submit.prevent="submitApplication" class="job-application-form">
    <!-- Form fields same as React example -->

    <div class="form-group">
      <label for="cv">CV/Resume * (PDF, DOC, DOCX - Max 5MB)</label>
      <input
        type="file"
        id="cv"
        ref="cvInput"
        accept=".pdf,.doc,.docx"
        @change="handleFileChange"
        required
      />
      <div v-if="errors.cv" class="error">{{ errors.cv }}</div>
      <div v-if="cvFile" class="file-info">
        Selected: {{ cvFile.name }} ({{
          (cvFile.size / 1024 / 1024).toFixed(2)
        }}
        MB)
      </div>
    </div>

    <button type="submit" :disabled="loading || !cvFile">
      {{ loading ? 'Submitting...' : 'Submit Application' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        coverLetter: '',
      },
      cvFile: null,
      loading: false,
      errors: {},
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];

      if (
        file &&
        ![
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(file.type)
      ) {
        this.errors = {
          ...this.errors,
          cv: 'Only PDF, DOC, and DOCX files are allowed',
        };
        return;
      }

      if (file && file.size > 5 * 1024 * 1024) {
        this.errors = { ...this.errors, cv: 'File size must be less than 5MB' };
        return;
      }

      this.cvFile = file;
      this.$delete(this.errors, 'cv');
    },

    async submitApplication() {
      this.loading = true;
      this.errors = {};

      try {
        const applicationFormData = new FormData();

        applicationFormData.append('cv', this.cvFile);
        applicationFormData.append('jobId', this.jobId);
        applicationFormData.append('firstName', this.formData.firstName);
        applicationFormData.append('lastName', this.formData.lastName);
        applicationFormData.append('email', this.formData.email);
        applicationFormData.append('phoneNumber', this.formData.phoneNumber);
        applicationFormData.append('coverLetter', this.formData.coverLetter);

        const response = await fetch(
          `${process.env.VUE_APP_API_URL}/jobs/${this.jobId}/apply`,
          {
            method: 'POST',
            body: applicationFormData,
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to submit application');
        }

        const result = await response.json();
        this.$emit('success', result);

        // Reset form
        this.formData = {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          coverLetter: '',
        };
        this.cvFile = null;
        this.$refs.cvInput.value = '';
      } catch (error) {
        this.errors = { submit: error.message };
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

---

## 🔗 **N8N Webhook Integration**

The updated webhook payload now includes CV binary data:

```json
{
  "applicationId": "2a6a7a0f-609e-4c18-b3b0-28d2a30d12d2",
  "jobTitle": "Cybersecurity Analyst",
  "companyName": "MENA Commercial Bank",
  "candidate": {
    "name": "Mark Wilson",
    "email": "mark.wilson@example.com",
    "phoneNumber": "+962791234569"
  },
  "cvUrl": "/api/jobs/uploads/+962791234569/1749599529977",
  "cvData": {
    "filename": "test-sample.pdf",
    "mimetype": "application/pdf",
    "size": 13264,
    "data": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg==" // base64 encoded CV data
  },
  "coverLetter": "I would like to apply for this cybersecurity position...",
  "appliedAt": "2025-06-11T01:52:09.977Z",
  "jobId": "04cf6f79-0000-4a04-bb3b-6733cd6b7361"
}
```

**N8N Processing Options:**

- **Parse CV Content**: Use the binary data to extract text and analyze skills
- **Store CV**: Save the file to cloud storage (AWS S3, Google Drive, etc.)
- **Email Notifications**: Send CV as attachment to HR managers
- **AI Processing**: Analyze CV content for candidate scoring

---

## 📊 **File Management Features**

### **Supported File Types**

- ✅ **PDF** (.pdf)
- ✅ **Microsoft Word** (.doc, .docx)

### **File Validation**

- ✅ **Size Limit**: 5MB maximum
- ✅ **Type Validation**: MIME type checking
- ✅ **Security**: File content validation

### **Storage Organization**

```
uploads/
└── cvs/
    ├── cv_1749599420748.pdf
    ├── cv_1749599529977.pdf
    └── cv_1749599591234.pdf
```

### **Access URLs**

```
GET /api/jobs/uploads/{phoneNumber}/{timestamp}
```

**Examples:**

- `/api/jobs/uploads/+962791234567/1749599529977`
- `/api/jobs/uploads/+962791234568/1749599420748`

---

## ✅ **Testing Results**

✅ **CV Upload**: Working correctly with proper file validation  
✅ **File Storage**: Files saved with unique naming and proper content  
✅ **CV Serving**: Direct access via API endpoint with correct headers  
✅ **N8N Integration**: Binary data successfully sent to webhook  
✅ **Database Storage**: CV URLs properly stored and accessible  
✅ **Error Handling**: Proper validation and error messages

---

## 🚀 **Ready for Production**

The CV file upload functionality is **fully implemented and tested**. The system now provides:

1. **Complete File Upload Pipeline**
2. **Secure File Storage and Serving**
3. **Enhanced N8N Integration with Binary Data**
4. **Frontend-Ready API with Comprehensive Examples**
5. **Production-Ready Error Handling and Validation**

**Next Steps**: Integrate the frontend examples into your React/Vue.js application and start accepting CV uploads from candidates!
