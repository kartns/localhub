# 🧪 API Testing Guide

This guide helps you test the Food Storage API endpoints using curl commands or tools like Postman.

## 🚀 Quick Start

### Interactive API Documentation
**The easiest way to test the API is using the interactive Swagger UI:**

```
http://localhost:3001/api/docs
```

Open this URL in your browser to:
- 📚 View all endpoints with descriptions
- 🧪 Test endpoints directly from the browser
- 📋 See request/response examples
- 🔑 Manage authentication tokens

---

### Base URL
```
http://localhost:3001/api
```

---

## Endpoints

### Authentication Endpoints

#### 1. Register New User
**Create a new user account**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

Expected Response (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "created_at": "2025-12-05 10:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 2. User Login
**Authenticate and receive JWT token**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

Expected Response (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Usage:** The token is automatically stored in an httpOnly cookie. For curl requests, use:
```bash
curl -b "token=YOUR_TOKEN_HERE" http://localhost:3001/api/storages
```

---

#### 3. Get User Profile
**Retrieve current user information (requires authentication)**

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

Expected Response (200 OK):
```json
{
  "id": 1,
  "email": "test@example.com",
  "created_at": "2025-12-05 10:00:00"
}
```

---

### Storage Endpoints

#### 4. Health Check
**Check if server is running**

```bash
curl http://localhost:3001/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Food Storage API is running"
}
```

---

#### 5. Get All Storages
**Retrieve list of all food storages**

```bash
curl http://localhost:3001/api/storages
```

Expected Response:
```json
[
  {
    "id": 1,
    "name": "Community Garden",
    "description": "Local produce storage",
    "address": "123 Main Street",
    "type": "storage",
    "created_at": "2025-12-05 10:30:00",
    "updated_at": "2025-12-05 10:30:00"
  }
]
```

---

#### 6. Get Storage by ID
**Retrieve single storage with all its items**

```bash
curl http://localhost:3001/api/storages/1
```

---

#### 7. Get Public Storage View
**View storage details without authentication**

```bash
curl http://localhost:3001/api/storages/public/1
```

---

#### 8. Create New Storage
**Add a new food storage location (requires authentication)**

```bash
curl -X POST http://localhost:3001/api/storages \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_HERE" \
  -d '{
    "name": "Farmer Market Storage",
    "description": "Fresh vegetables from local farms",
    "address": "456 Oak Avenue, Downtown",
    "type": "market"
  }'
```

---

#### 9. Update Storage
**Modify an existing storage (requires authentication)**

```bash
curl -X PUT http://localhost:3001/api/storages/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_HERE" \
  -d '{
    "name": "Community Garden - Updated",
    "description": "Recently renovated storage facility",
    "address": "123 Main Street, Updated",
    "type": "storage"
  }'
```

---

#### 10. Delete Storage
**Remove a storage and all its items (requires authentication)**

```bash
curl -X DELETE http://localhost:3001/api/storages/1 \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

Expected Response (200 OK):
```json
{
  "message": "Storage deleted"
}
```

---

### Item Endpoints

#### 11. Get Items in Storage
**Retrieve all items in a specific storage**

```bash
curl http://localhost:3001/api/items/storage/1
```

---

#### 12. Create Item with Image Upload
**Add item to storage with image (requires authentication)**

```bash
curl -X POST http://localhost:3001/api/items \
  -H "Cookie: token=YOUR_TOKEN_HERE" \
  -F "storage_id=1" \
  -F "name=Tomatoes" \
  -F "category=Vegetables" \
  -F "quantity=50" \
  -F "unit=kg" \
  -F "image=@path/to/image.jpg"
```

**Note:** Image must be JPG, PNG, or JPEG format (max 10MB)

---

#### 13. Update Item
**Modify an existing item (requires authentication)**

```bash
curl -X PUT http://localhost:3001/api/items/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_HERE" \
  -d '{
    "name": "Tomatoes",
    "category": "Vegetables",
    "quantity": 75,
    "unit": "kg"
  }'
```

---

#### 14. Delete Item
**Remove an item (requires authentication)**

```bash
curl -X DELETE http://localhost:3001/api/items/1 \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

---

### 1. Health Check
---

## Testing with Postman or Swagger UI

### Option 1: Interactive Swagger UI (Recommended)
```
http://localhost:3001/api/docs
```
- Easiest way to test endpoints
- No curl commands needed
- View all documentation
- Test with one click

### Option 2: Postman API Client
1. Open Postman or similar tool
2. Create requests with these settings:

| Method | URL | Headers | Auth |
|--------|-----|---------|------|
| POST | `http://localhost:3001/api/auth/register` | `Content-Type: application/json` | None |
| POST | `http://localhost:3001/api/auth/login` | `Content-Type: application/json` | None |
| GET | `http://localhost:3001/api/auth/me` | - | Bearer Token |
| GET | `http://localhost:3001/api/storages` | - | Bearer Token |
| POST | `http://localhost:3001/api/storages` | `Content-Type: application/json` | Bearer Token |

---

## Testing with curl

### Step 1: Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Save the `token` from the response.

### Step 2: Use Token for Authenticated Requests
```bash
curl -H "Cookie: token=YOUR_TOKEN_HERE" \
  http://localhost:3001/api/storages
```

---

## Error Codes

| Code | Meaning | Cause |
|------|---------|-------|
| 200 | Success | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing/invalid required field |
| 401 | Unauthorized | Not authenticated or token expired |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource/endpoint doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Database or server issue |

---

## Tips for Testing

✅ **Always test register/login first** - Get a token before testing protected endpoints  
✅ **Use Swagger UI** - It's the easiest and most reliable way to test (http://localhost:3001/api/docs)  
✅ **Check both servers are running** - Backend on 3001, Frontend on 3000  
✅ **Include authentication header** - Use Cookie header for curl or Bearer token for Postman  
✅ **Use valid image formats** - JPG, PNG, or JPEG (max 10MB)  
✅ **Be careful with DELETE** - Deletions are permanent  
✅ **Handle rate limits** - Wait if you exceed request limits  
✅ **Check response status codes** - They tell you what happened (200, 201, 400, 401, 404, etc.)

---

## Common Issues

### "Unauthorized" Response
- User not logged in
- Token expired
- Missing authentication header

### "Rate limit exceeded"
- Too many requests in short time
- Wait 15 minutes or use different endpoint tier

### "File upload failed"
- File not JPG/PNG or over 10MB
- Check server logs for details

### "Can't connect to API"
- Backend server not running
- Wrong port (should be 3001)
- Check firewall settings
