# SIH Transportation Analytics API - Owner-Scientist Workflow

## Authentication System Overview

This API implements a complete authentication system with role-based access control for customers, scientists, and organization owners.

## Workflow Example

### 1. Scientist Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "Dr. Rajesh Kumar",
    "email": "rajesh@natpac.gov.in",
    "password": "securepass123",
    "phone": "+91-9876543210",
    "role": "scientist",
    "organizationId": "NATPAC_001"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Registration successful. Pending approval from organization owner.",
    "data": {
        "user": {
            "id": "...",
            "name": "Dr. Rajesh Kumar",
            "email": "rajesh@natpac.gov.in",
            "role": "scientist",
            "organizationId": "NATPAC_001",
            "isApproved": false
        }
    }
}
```

### 2. Scientist Login (Before Approval)
```bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "rajesh@natpac.gov.in",
    "password": "securepass123"
}
```

**Response:**
```json
{
    "status": "error",
    "message": "Account pending approval by organization owner."
}
```

### 3. Owner Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "Dr. Priya Sharma",
    "email": "priya.owner@natpac.gov.in",
    "password": "ownerpass123",
    "role": "owner",
    "organizationId": "NATPAC_001"
}
```

### 4. Owner Login
```bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "priya.owner@natpac.gov.in",
    "password": "ownerpass123"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Login successful",
    "data": {
        "user": {
            "id": "...",
            "name": "Dr. Priya Sharma",
            "role": "owner",
            "organizationId": "NATPAC_001",
            "isApproved": true
        },
        "token": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

### 5. Owner Views Pending Scientists
```bash
GET /api/owner/pending-scientists
Authorization: Bearer <owner_token>
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "scientists": [
            {
                "id": "scientist_id_here",
                "name": "Dr. Rajesh Kumar",
                "email": "rajesh@natpac.gov.in",
                "organizationId": "NATPAC_001",
                "department": "Transportation Research",
                "designation": "Senior Scientist",
                "createdAt": "2025-09-21T10:30:00.000Z"
            }
        ],
        "count": 1,
        "organizationId": "NATPAC_001"
    }
}
```

### 6. Owner Approves Scientist
```bash
POST /api/owner/approve-scientist/<scientist_id>
Authorization: Bearer <owner_token>
```

**Response:**
```json
{
    "status": "success",
    "message": "Scientist approved successfully",
    "data": {
        "scientist": {
            "id": "scientist_id_here",
            "name": "Dr. Rajesh Kumar",
            "email": "rajesh@natpac.gov.in",
            "organizationId": "NATPAC_001",
            "isApproved": true,
            "approvedAt": "2025-09-21T11:00:00.000Z"
        }
    }
}
```

### 7. Scientist Login (After Approval)
```bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "rajesh@natpac.gov.in",
    "password": "securepass123"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Login successful",
    "data": {
        "user": {
            "id": "...",
            "name": "Dr. Rajesh Kumar",
            "role": "scientist",
            "organizationId": "NATPAC_001",
            "isApproved": true
        },
        "token": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

## Security Features

### Authentication Middleware
- **JWT Token Verification**: `Authorization: Bearer <token>`
- **User Role Extraction**: Attaches `{ id, role, organizationId }` to `req.user`
- **Error Handling**: Returns 401 for invalid/missing tokens

### Authorization Middleware
- **Role-Based Access**: `authorizeRoles('owner', 'scientist')`
- **Organization Verification**: Owners can only manage their own organization's scientists
- **Approval Status Check**: Scientists must be approved to access certain features

### Organization Isolation
- Owners can only see/manage scientists from their `organizationId`
- Scientists belong to specific organizations via `organizationId`
- Cross-organization access is prevented

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify-token` - Verify token validity

### Owner Routes (Require owner role)
- `POST /api/owner/approve-scientist/:id` - Approve scientist
- `POST /api/owner/disapprove-scientist/:id` - Disapprove scientist
- `GET /api/owner/pending-scientists` - Get pending approvals
- `GET /api/owner/scientists` - Get all organization scientists

## Error Responses

### 401 Unauthorized
```json
{
    "status": "error",
    "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
    "status": "error",
    "message": "Access forbidden. Required roles: owner. Your role: scientist"
}
```

### Organization Mismatch
```json
{
    "status": "error",
    "message": "You can only approve scientists from your organization"
}
```

## Database Schema

### User Model Fields
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `phone` - Optional phone number
- `role` - Enum: ['customer', 'scientist', 'owner']
- `organizationId` - Organization identifier (required for scientists/owners)
- `department` - Department within organization
- `designation` - Job title/position
- `isActive` - Account status
- `isApproved` - Approval status (auto-true for customers/owners, false for scientists)
- `createdAt` - Registration timestamp
