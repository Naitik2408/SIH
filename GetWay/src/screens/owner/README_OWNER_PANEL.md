# Owner Panel Structure

This directory contains the complete Owner (Admin) panel implementation with a custom bottom navigation bar and three main screens.

## Structure

```
owner/
├── OwnerDashboard.tsx          # Main entry point - renders OwnerTabNavigator
├── subscreens/
│   ├── index.ts                # Export barrel for all subscreens
│   ├── OwnerHome.tsx           # Home screen with dashboard stats
│   ├── OwnerApprovals.tsx      # Approval/rejection management
│   └── OwnerProfile.tsx        # Admin profile and settings
```

## Features

### 1. OwnerHome Screen
- **Top Navigation Bar**: Custom header with GetWay logo, admin badge, notifications, and menu
- **Dashboard Statistics**: 
  - Total Scientists count
  - Active Users count
  - Data Points collected
  - Pending Approvals count
- **Quick Actions**: Easy access buttons for common admin tasks
- **Recent Activities**: Real-time feed of platform events
- **System Health**: Server status, database status, API performance, uptime

### 2. OwnerApprovals Screen
- **Scientist Request Management**: 
  - View all scientist access requests
  - Filter by status (pending, approved, rejected)
  - Detailed view of each request including:
    - Personal information
    - Qualifications and research area
    - Institution details
    - Research purpose
    - Submitted documents
- **Actions**:
  - Approve requests with one click
  - Reject requests with reason (modal dialog)
  - View request submission timestamps
- **Statistics**: Quick overview of pending, approved, and rejected counts

### 3. OwnerProfile Screen
- **Admin Profile Information**: 
  - Avatar with admin badge
  - Personal details and contact info
  - Admin statistics (years, decisions made, etc.)
- **Quick Settings**: Toggle switches for:
  - Push notifications
  - Auto-approve scientists
  - Advanced analytics
  - Maintenance mode
- **Management Sections**:
  - Account Management (personal info, security, permissions)
  - System Configuration (users, data, API, logs)
  - Platform Analytics (reports, insights, performance)
  - Help & Support (documentation, support, feedback)
- **Actions**: Logout and delete account with confirmation dialogs

## Navigation

The owner panel uses a custom bottom tab navigation with three tabs:
- **Home**: Dashboard and overview
- **Approvals**: Scientist request management  
- **Profile**: Admin settings and account management

## Custom Components Used

- **CustomBottomTabBar**: Floating navigation bar with smooth animations
- **Top Navigation**: Custom header for OwnerHome screen
- **Modal Dialogs**: For rejection reasons and confirmations
- **Statistics Cards**: Reusable stat display components
- **Action Buttons**: Styled approve/reject buttons

## Data Flow

1. **OwnerDashboard.tsx** renders **OwnerTabNavigator**
2. **OwnerTabNavigator** manages tab state and renders appropriate screen
3. Each screen is self-contained with its own state management
4. User prop is passed down from main app level
5. onLogout callback bubbles up to main app level

## Usage

```tsx
import OwnerDashboard from './screens/owner/OwnerDashboard';

// In your main app component:
<OwnerDashboard 
  user={currentUser} 
  onLogout={handleLogout} 
/>
```

The owner panel follows the same folder structure pattern as the customer panel, making it easy to maintain and extend.
