# Project Structure

## Folder Organization

### `src/app/pages/`

Contains page-level components (screens/views):

- `login/` - Login page component
- `dashboard/` - Dashboard page component

### `src/app/components/`

Contains reusable UI components:

#### `components/ui/`

- `button/` - Reusable button component with variants
- `card/` - Card container component
- `stat-card/` - Statistics display card component

#### `components/layout/`

- `page-header/` - Common page header with user info and logout

### `src/app/services/`

- `auth.ts` - Authentication service with HTTP-only cookies

### `src/app/interfaces/`

- `auth.interface.ts` - Type definitions for authentication

## Component Usage Examples

### Button Component

```html
<app-button variant="primary" size="md" (clicked)="handleClick()" [loading]="isLoading"> Save Changes </app-button>
```

### Card Component

```html
<app-card title="User Profile" subtitle="Manage your account">
  <p>Card content goes here</p>
  <div slot="footer">Footer content</div>
</app-card>
```

### Stat Card Component

```html
<app-stat-card label="Total Users" value="1,234" color="blue" trend="+12% from last month" trendDirection="up">
  <svg slot="icon" class="w-6 h-6 text-white">...</svg>
</app-stat-card>
```

### Page Header Component

```html
<app-page-header [user]="currentUser" (logout)="handleLogout()"></app-page-header>
```

## Architecture Benefits

1. **Separation of Concerns**: Pages handle business logic, components handle UI
2. **Reusability**: UI components can be used across multiple pages
3. **Maintainability**: Changes to UI components affect all usage automatically
4. **Testability**: Components can be tested in isolation
5. **Scalability**: Easy to add new pages and components
