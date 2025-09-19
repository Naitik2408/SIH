# Subscreens Folder Structure

This folder contains all the subscreens (child screens) for the customer section of the GetWay app.

## Organization

Each subscreen category has its own folder for better organization and maintainability:

### `/notifications`
- **CustomerNotifications.tsx** - Main notifications screen
- Future: Notification settings, notification details, etc.

### `/profile`
- Future: Profile settings, edit profile, privacy settings, etc.

### `/trips`
- Future: Trip details, trip history, route planning, etc.

### `/posts`
- Future: Post details, create post, edit post, etc.

### `/survey`
- Future: Survey forms, survey results, feedback forms, etc.

## Import Pattern

Use the index file for cleaner imports:

```typescript
// Instead of:
import CustomerNotifications from './subscreens/notifications/CustomerNotifications';

// Use:
import { CustomerNotifications } from './subscreens';
```

## Adding New Subscreens

1. Create the appropriate folder under `/subscreens`
2. Add your component file(s)
3. Export the component in `/subscreens/index.ts`
4. Import using the clean import pattern

This structure keeps the main customer screens folder clean while organizing related subscreens together.
