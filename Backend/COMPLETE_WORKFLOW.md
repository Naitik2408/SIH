# SIH Transportation Analytics - Complete Backend Workflow

## Overview
This document demonstrates the complete end-to-end workflow for the SIH Transportation Analytics API, including user registration, approval processes, and profile management.

## 🔄 Complete End-to-End Workflow

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
    "organizationId": "NATPAC_001",
    "department": "Transportation Research",
    "designation": "Senior Research Scientist"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Registration successful. Pending approval from organization owner.",
    "data": {
        "user": {
            "id": "scientist_id_123",
            "name": "Dr. Rajesh Kumar",
            "email": "rajesh@natpac.gov.in",
            "role": "scientist",
            "organizationId": "NATPAC_001",
            "isApproved": false
        }
    }
}
```

### 2. Scientist Login Attempt (Before Approval)
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
    "message": "Your account is pending approval by the organization owner."
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
    "organizationId": "NATPAC_001",
    "department": "Administration",
    "designation": "Director"
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
            "id": "owner_id_456",
            "name": "Dr. Priya Sharma",
            "email": "priya.owner@natpac.gov.in",
            "role": "owner",
            "organizationId": "NATPAC_001",
            "isApproved": true,
            "lastLogin": "2025-09-21T12:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

### 5. Owner Checks Pending Scientists
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
                "id": "scientist_id_123",
                "name": "Dr. Rajesh Kumar",
                "email": "rajesh@natpac.gov.in",
                "organizationId": "NATPAC_001",
                "department": "Transportation Research",
                "designation": "Senior Research Scientist",
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
POST /api/owner/approve-scientist/scientist_id_123
Authorization: Bearer <owner_token>
```

**Response:**
```json
{
    "status": "success",
    "message": "Scientist approved successfully",
    "data": {
        "scientist": {
            "id": "scientist_id_123",
            "name": "Dr. Rajesh Kumar",
            "email": "rajesh@natpac.gov.in",
            "organizationId": "NATPAC_001",
            "department": "Transportation Research",
            "designation": "Senior Research Scientist",
            "isApproved": true,
            "approvedAt": "2025-09-21T12:15:00.000Z"
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
            "id": "scientist_id_123",
            "name": "Dr. Rajesh Kumar",
            "email": "rajesh@natpac.gov.in",
            "role": "scientist",
            "organizationId": "NATPAC_001",
            "isApproved": true,
            "lastLogin": "2025-09-21T12:20:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

### 8. Scientist Checks Own Profile
```bash
GET /api/users/me
Authorization: Bearer <scientist_token>
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "user": {
            "id": "scientist_id_123",
            "name": "Dr. Rajesh Kumar",
            "email": "rajesh@natpac.gov.in",
            "role": "scientist",
            "phone": "+91-9876543210",
            "organizationId": "NATPAC_001",
            "department": "Transportation Research",
            "designation": "Senior Research Scientist",
            "isApproved": true,
            "isActive": true,
            "isVerified": false,
            "createdAt": "2025-09-21T10:30:00.000Z",
            "lastLogin": "2025-09-21T12:20:00.000Z"
        }
    }
}
```

### 9. Customer Registration & Login
```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "Amit Patel",
    "email": "amit@example.com",
    "password": "customerpass123",
    "phone": "+91-9123456789",
    "role": "customer"
}
```

**Response (Auto-approved):**
```json
{
    "status": "success",
    "message": "Registration successful",
    "data": {
        "user": {
            "id": "customer_id_789",
            "name": "Amit Patel",
            "email": "amit@example.com",
            "role": "customer",
            "isApproved": true
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

### 10. Customer Profile Check
```bash
GET /api/users/me
Authorization: Bearer <customer_token>
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "user": {
            "id": "customer_id_789",
            "name": "Amit Patel",
            "email": "amit@example.com",
            "role": "customer",
            "phone": "+91-9123456789",
            "isActive": true,
            "isVerified": false,
            "createdAt": "2025-09-21T13:00:00.000Z",
            "lastLogin": "2025-09-21T13:00:00.000Z"
        }
    }
}
```

### 11. Owner Checks Organization Scientists
```bash
GET /api/users/organization-scientists
Authorization: Bearer <owner_token>
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "scientists": [
            {
                "id": "scientist_id_123",
                "name": "Dr. Rajesh Kumar",
                "email": "rajesh@natpac.gov.in",
                "department": "Transportation Research",
                "designation": "Senior Research Scientist",
                "isApproved": true,
                "isActive": true,
                "createdAt": "2025-09-21T10:30:00.000Z",
                "lastLogin": "2025-09-21T12:20:00.000Z"
            }
        ],
        "stats": {
            "total": 1,
            "approved": 1,
            "pending": 0,
            "active": 1,
            "recentlyActive": 1
        },
        "organizationId": "NATPAC_001"
    }
}
```

## 📡 Complete API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user (customer/scientist/owner)
- `POST /api/auth/login` - Login with approval checks
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get authenticated user profile
- `GET /api/auth/verify-token` - Verify JWT token

### User Management Routes
- `GET /api/users/me` - Get current user profile (all roles)
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/organization-scientists` - Get organization scientists (owner only)
- `GET /api/users/stats` - Get user statistics (owner only)

### Owner Management Routes
- `POST /api/owner/approve-scientist/:id` - Approve scientist
- `POST /api/owner/disapprove-scientist/:id` - Disapprove scientist
- `GET /api/owner/pending-scientists` - Get pending scientists
- `GET /api/owner/scientists` - Get all organization scientists

## 🔐 Role-Based Access Control

### Customer Access
- ✅ Register and auto-approved login
- ✅ Access `/api/users/me` for profile
- ✅ Update basic profile information
- ❌ Cannot access organization/scientist routes

### Scientist Access
- ✅ Register (requires owner approval)
- ✅ Login only after approval
- ✅ Access `/api/users/me` for profile with organization info
- ✅ Update profile including department/designation
- ❌ Cannot access owner-only routes

### Owner Access  
- ✅ Register and auto-approved login
- ✅ All scientist management functions
- ✅ View organization scientists and statistics
- ✅ Approve/disapprove scientists in their organization
- ❌ Cannot manage other organizations

## 🛡️ Security Features

### JWT Authentication
- Bearer token format: `Authorization: Bearer <token>`
- 7-day token expiration
- Payload includes: `{ id, role, organizationId }`

### Organization Isolation
- Owners can only manage scientists from their organization
- Cross-organization access is prevented
- Organization-based data filtering

### Approval Workflow
- Scientists require owner approval before login
- Customers are auto-approved
- Owners are auto-approved

### Error Handling
- Comprehensive error responses
- Proper HTTP status codes
- Security-conscious error messages

This complete workflow ensures secure, role-based access to the transportation analytics platform! 🚀
