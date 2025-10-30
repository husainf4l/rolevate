// COMPANY PROFILE EDIT MODE - QUICK START

// ============================================
// VIEW MODE (Default)
// ============================================
✓ All fields are disabled (gray background)
✓ "Edit Profile" button visible in header
✓ Fields are read-only

// ============================================
// EDIT MODE (After clicking "Edit Profile")
// ============================================
✓ All fields become editable (white background)
✓ Blue focus ring when typing
✓ "Save Changes" and "Cancel" buttons appear
✓ "Edit Profile" button is replaced

// ============================================
// EDITABLE FIELDS
// ============================================
Contact Information:
  • Email
  • Phone
  • Website

Company Details:
  • Founded
  • Mission
  • Description
  • Industry

// ============================================
// WORKFLOW
// ============================================

1. EDIT PROFILE
   Click "Edit Profile" button
        ↓
   Fields become editable

2. MAKE CHANGES
   Update any field
        ↓
   Changes stored in memory

3. SAVE OR CANCEL
   
   Option A: SAVE CHANGES
   Click "Save Changes"
        ↓
   Changes sent to GraphQL API
        ↓
   Success toast appears
        ↓
   Page exits edit mode
        ↓
   Profile displays updated info
   
   Option B: CANCEL
   Click "Cancel"
        ↓
   Changes discarded
        ↓
   Returns to view mode
        ↓
   Original values restored

// ============================================
// STYLING
// ============================================

EDITABLE STATE:
  Background: white
  Border: gray (2px)
  Focus: blue ring (primary-600)
  Cursor: text input

DISABLED STATE:
  Background: gray (50/50)
  Border: gray (2px)
  Focus: none
  Cursor: not-allowed

// ============================================
// ERROR HANDLING
// ============================================

✓ API errors show in toast notifications
✓ Validation happens on backend
✓ Failed saves keep page in edit mode
✓ User can retry after fixing input

// ============================================
// IMPLEMENTATION DETAILS
// ============================================

File: src/app/dashboard/company-profile/page.tsx
  - Added: isEditMode state
  - Added: editData state
  - Added: isSaving state
  - Added: handleEditMode() function
  - Added: handleSaveProfile() function
  - Added: handleCancelEdit() function
  - Updated: Conditional field rendering
  - Updated: Tab header with button logic

File: src/services/company.service.ts
  - Added: updateCompany() method
  - Uses: UPDATE_COMPANY_MUTATION
  - Returns: Updated company profile

// ============================================
// USAGE EXAMPLE
// ============================================

const handleEditMode = useCallback(() => {
  if (isEditMode) {
    setEditData(null);
    setIsEditMode(false);
  } else {
    setEditData({ ...companyProfile });
    setIsEditMode(true);
  }
}, [isEditMode, companyProfile]);

const handleSaveProfile = useCallback(async () => {
  if (!companyProfile || !editData) return;
  
  try {
    setIsSaving(true);
    const updatedCompany = await companyService.updateCompany(
      companyProfile.id, 
      editData
    );
    setCompanyProfile(updatedCompany);
    setEditData(null);
    setIsEditMode(false);
    toast.success("Company profile updated successfully!");
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsSaving(false);
  }
}, [companyProfile, editData]);

// ============================================
