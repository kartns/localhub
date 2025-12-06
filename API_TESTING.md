# 🧪 API Testing Guide

This guide helps you test the Food Storage API endpoints using curl commands or tools like Postman.

## Quick Reference

### Base URL
```
http://localhost:3001/api
```

---

## Endpoints

### 1. Health Check
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

### 2. Get All Storages
**Retrieve list of all food storages with item counts**

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
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main Street",
    "type": "storage",
    "item_count": 5,
    "created_at": "2025-12-05 10:30:00",
    "updated_at": "2025-12-05 10:30:00"
  }
]
```

---

### 3. Get Storage by ID
**Retrieve single storage with all its items**

```bash
curl http://localhost:3001/api/storages/1
```

Expected Response:
```json
{
  "id": 1,
  "name": "Community Garden",
  "description": "Local produce storage",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main Street",
  "type": "storage",
  "created_at": "2025-12-05 10:30:00",
  "updated_at": "2025-12-05 10:30:00",
  "items": [
    {
      "id": 1,
      "storage_id": 1,
      "name": "Tomatoes",
      "category": "Vegetables",
      "quantity": 50,
      "unit": "kg",
      "expiration_date": "2025-12-10",
      "added_at": "2025-12-05 10:35:00",
      "updated_at": "2025-12-05 10:35:00"
    }
  ]
}
```

---

### 4. Create New Storage
**Add a new food storage location**

```bash
curl -X POST http://localhost:3001/api/storages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Farmer Market Storage",
    "description": "Fresh vegetables from local farms",
    "address": "456 Oak Avenue, Downtown",
    "latitude": 40.7580,
    "longitude": -73.9855,
    "type": "market"
  }'
```

Expected Response (201 Created):
```json
{
  "id": 2,
  "name": "Farmer Market Storage",
  "description": "Fresh vegetables from local farms",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "address": "456 Oak Avenue, Downtown",
  "type": "market",
  "created_at": "2025-12-05 11:00:00",
  "updated_at": "2025-12-05 11:00:00"
}
```

**Request Body Fields:**
- `name` (required, string): Name of the storage
- `description` (optional, string): Details about the storage
- `address` (optional, string): Physical address
- `latitude` (optional, number): GPS latitude
- `longitude` (optional, number): GPS longitude
- `type` (optional, string): Type - "storage", "farm", "market", or "warehouse"

---

### 5. Update Storage
**Modify an existing storage**

```bash
curl -X PUT http://localhost:3001/api/storages/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Community Garden - Updated",
    "description": "Recently renovated storage facility",
    "address": "123 Main Street, Updated",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "type": "storage"
  }'
```

Expected Response (200 OK):
```json
{
  "id": 1,
  "name": "Community Garden - Updated",
  "description": "Recently renovated storage facility",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main Street, Updated",
  "type": "storage",
  "created_at": "2025-12-05 10:30:00",
  "updated_at": "2025-12-05 11:05:00"
}
```

---

### 6. Delete Storage
**Remove a storage and all its items**

```bash
curl -X DELETE http://localhost:3001/api/storages/1
```

Expected Response (200 OK):
```json
{
  "message": "Storage deleted"
}
```

---

## Testing with Postman

1. Open Postman or similar API testing tool
2. Create requests with these settings:

| Method | URL | Headers | Body |
|--------|-----|---------|------|
| GET | `http://localhost:3001/api/storages` | - | - |
| POST | `http://localhost:3001/api/storages` | `Content-Type: application/json` | JSON object |
| PUT | `http://localhost:3001/api/storages/1` | `Content-Type: application/json` | JSON object |
| DELETE | `http://localhost:3001/api/storages/1` | - | - |

---

## Testing with PowerShell

Save a file named `test-api.ps1`:

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3001/api/health"

# Get all storages
Invoke-WebRequest -Uri "http://localhost:3001/api/storages" | ConvertTo-Json

# Create storage
$body = @{
    name = "Test Storage"
    description = "For testing"
    address = "123 Test St"
    latitude = 40.7128
    longitude = -74.0060
    type = "storage"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/storages" `
    -Method Post `
    -Headers @{'Content-Type'='application/json'} `
    -Body $body
```

Run it:
```bash
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET/PUT/DELETE successful |
| 201 | Created | POST successful |
| 400 | Bad Request | Missing required field |
| 404 | Not Found | Storage ID doesn't exist |
| 500 | Server Error | Database or server issue |

---

## Sample Test Data

```json
{
  "storages": [
    {
      "name": "Downtown Community Garden",
      "description": "Organic vegetables and herbs",
      "address": "123 Main Street, Downtown",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "type": "storage"
    },
    {
      "name": "Riverside Farm",
      "description": "Fresh produce from local farms",
      "address": "456 River Road, Countryside",
      "latitude": 40.8200,
      "longitude": -74.0300,
      "type": "farm"
    },
    {
      "name": "Central Market",
      "description": "Farmers market with multiple vendors",
      "address": "789 Market Plaza, Downtown",
      "latitude": 40.7580,
      "longitude": -73.9855,
      "type": "market"
    }
  ]
}
```

---

## Tips

✅ Always include `Content-Type: application/json` header for POST/PUT requests  
✅ Use proper JSON formatting in request bodies  
✅ Check that both servers (backend and frontend) are running  
✅ Database changes are permanent - be careful with DELETE requests  
✅ Latitude/Longitude should be valid GPS coordinates  

Happy testing! 🧪
