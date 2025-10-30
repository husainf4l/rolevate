# Company Profile Update Feature

## Overview
A new edit functionality has been added to the company profile page at `/dashboard/company-profile` that allows you to update company information directly.

## Features Added

### 1. **Edit Mode Toggle**
- An "Edit Profile" button appears in the Company Details tab header
- Clicking it switches to edit mode where all fields become editable
- During edit mode, the button changes to "Save Changes" and "Cancel" buttons

### 2. **Editable Fields**
When in edit mode, the following fields can be edited:

**Contact Information:**
- Email
- Phone
- Website

**Company Details:**
- Founded (year or date)
- Mission Statement
- Company Description
- Industry

### 3. **Save & Cancel Functionality**
- **Save Changes**: Saves all edited information to the database via the GraphQL mutation
- **Cancel**: Discards all changes and returns to view mode without saving

### 4. **Visual Feedback**
- Fields change appearance when in edit mode (white background with blue focus ring)
- Disabled fields in view mode show a gray background
- Toast notifications confirm successful updates or show error messages
- Loading state during save

## How to Use

### Accessing the Feature
1. Navigate to `http://localhost:3005/dashboard/company-profile`
2. Ensure you're on the "Company Details" tab

### Editing Company Information
1. Click the **"Edit Profile"** button in the top-right of the Company Details tab
2. All form fields will become editable with white backgrounds
3. Update any of the following fields:
   - Email address
   - Phone number
   - Website URL
   - Founded year/date
   - Mission statement
   - Company description
   - Industry

### Saving Changes
1. After making your edits, click the **"Save Changes"** button
2. The system will validate and save your information
3. A success toast notification will appear
4. The page automatically exits edit mode and shows your updated information

### Canceling Changes
1. If you want to discard changes without saving, click the **"Cancel"** button
2. All fields will revert to their previous values
3. Edit mode is exited without any changes being saved

## Technical Implementation

### Modified Files

#### 1. `/src/app/dashboard/company-profile/page.tsx`
**Changes:**
- Added `isEditMode` state to track edit/view mode
- Added `editData` state to hold temporary edited values
- Added `isSaving` state for save operation feedback
- Added `handleEditMode()` function to toggle edit mode
- Added `handleSaveProfile()` function to save changes
- Added `handleCancelEdit()` function to cancel editing
- Updated UI to show Edit/Save/Cancel buttons conditionally
- Made all form fields dynamically editable based on `isEditMode` state
- Added conditional styling for editable vs disabled fields

**Key UI Changes:**
- Added "Edit Profile" button in the Company Details tab header
- When editing, button changes to "Save Changes" and "Cancel"
- Form fields now have white background and blue focus ring when editable
- Form fields have gray background when in view mode

#### 2. `/src/services/company.service.ts`
**Changes:**
- Added new `updateCompany()` method
- Uses existing `UPDATE_COMPANY_MUTATION` GraphQL mutation
- Accepts company ID and update input object
- Returns updated company profile

**Method Signature:**
```typescript
async updateCompany(companyId: string, input: Partial<CompanyProfile>): Promise<CompanyProfile>
```

**Supported Update Fields:**
- name
- description
- industry
- website
- email
- phone
- founded

## GraphQL Mutation

The feature uses the existing `UpdateCompany` GraphQL mutation:

```graphql
mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
  updateCompany(id: $id, input: $input) {
    id
    name
    description
    industry
    website
    email
    phone
    logo
    size
    founded
    location
  }
}
```

## Error Handling

- Invalid input validation happens on the backend
- Error messages are displayed in toast notifications
- If update fails, the page remains in edit mode so you can fix and retry
- Network errors are caught and displayed to the user

## Features Preserved

All existing functionality remains intact:
- Company logo upload
- Team member management
- Subscription information
- Security/password management
- Invitation code generation

## Testing Checklist

- [ ] Click "Edit Profile" button - all fields become editable
- [ ] Edit email, phone, website fields
- [ ] Edit description and industry
- [ ] Edit mission statement and founded year
- [ ] Click "Save Changes" - changes are saved and page updates
- [ ] Click "Cancel" - changes are discarded, fields revert
- [ ] Check toast notifications appear on success/error
- [ ] Verify fields are disabled/gray when not in edit mode
- [ ] Check page still shows other tabs (Team Members, Subscription, Security)

## Future Enhancements

Possible improvements:
- Add validation rules for email/website format
- Add confirmation dialog before discarding changes
- Add field-level error messages
- Add undo functionality
- Add edit history/changelog
- Add bulk edit for multiple fields
- Add more editable fields (employees, headquarters, etc.)
