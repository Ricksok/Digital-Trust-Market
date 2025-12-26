# Authentication Routes & Pages

## Routes Created

### `/auth/login`
- **File**: `app/auth/login/page.tsx`
- **Description**: Login page with email/password authentication
- **Features**:
  - Form validation using react-hook-form
  - Error handling
  - Token storage in localStorage
  - Redirect to dashboard on success
  - Link to register page
  - "Remember me" checkbox
  - Forgot password link (placeholder)
  - Web3 wallet connection button (placeholder)

### `/auth/register`
- **File**: `app/auth/register/page.tsx`
- **Description**: Registration page for new users
- **Features**:
  - Form validation
  - Account type selection (Investor/Fundraiser roles)
  - Password confirmation
  - Auto-detection of user type based on role
  - Error handling
  - Token storage and redirect

### `/auth/logout`
- **File**: `app/auth/logout/page.tsx`
- **Description**: Logout page that clears tokens and redirects
- **Features**:
  - Automatic logout on page load
  - Token cleanup
  - Redirect to login

### `/dashboard`
- **File**: `app/dashboard/page.tsx`
- **Description**: Protected dashboard page
- **Features**:
  - Authentication check
  - User information display
  - Quick links to projects, investments, analytics
  - Logout functionality
  - Loading states

## Layout

### `app/auth/layout.tsx`
- Simplified layout for auth pages
- Minimal navigation (just logo/home link)
- No footer

## Components

### `components/Layout.tsx` (Updated)
- Conditionally hides on auth pages
- Shows login/register buttons when not authenticated
- Shows dashboard/logout buttons when authenticated
- Dynamic navigation based on auth state

## Hooks

### `lib/hooks/useAuth.ts`
- Custom hook for authentication state management
- Provides:
  - `user`: Current user object
  - `loading`: Loading state
  - `isAuthenticated`: Boolean auth status
  - `login(email, password)`: Login function
  - `logout()`: Logout function

## API Integration

All auth pages use the `authApi` from `lib/api/auth.ts`:
- `authApi.login(data)`
- `authApi.register(data)`
- `authApi.getCurrentUser()`
- `authApi.logout()`

## Token Management

- Tokens stored in `localStorage`:
  - `token`: JWT access token
  - `refreshToken`: Refresh token (if provided)
- Tokens automatically added to API requests via axios interceptor
- Tokens cleared on logout

## User Roles

Supported roles:
- `INDIVIDUAL_INVESTOR`
- `INSTITUTIONAL_INVESTOR`
- `IMPACT_FUND`
- `SME_STARTUP`
- `SOCIAL_ENTERPRISE`
- `REAL_ESTATE_PROJECT`

User types are auto-determined:
- Investor types → `INVESTOR`
- Fundraiser types → `FUNDRAISER`

## Form Validation

Using `react-hook-form` with validation:
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- Confirm Password: Must match password
- Role: Required selection

## Error Handling

- Display error messages from API responses
- Fallback to generic error messages
- Form-level and field-level validation errors

## Next Steps

1. Implement Web3 wallet connection
2. Add forgot password functionality
3. Add email verification flow
4. Add password reset flow
5. Add social login options
6. Add 2FA/MFA support

