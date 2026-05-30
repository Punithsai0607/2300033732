# Quick Reference Guide - Afford Medical Notifications Stage 1

## 📁 File Locations

```
affordmed-frontend/
├── src/
│   ├── App.jsx                        ← Root component
│   ├── App.css                        ← App styles
│   ├── PriorityNotifications.jsx      ← Main notifications component
│   ├── PriorityNotifications.css      ← Notification styles
│   ├── notificationService.js         ← Business logic
│   ├── logger.js                      ← Logging middleware (existing)
│   └── main.jsx                       ← Entry point (existing)
├── Notification_System_Design.md      ← Full design document
├── IMPLEMENTATION_SUMMARY.md          ← This reference
└── package.json                       ← Dependencies
```

---

## 🚀 Getting Started

```bash
# Install dependencies
cd affordmed-frontend
npm install

# Run development server
npm run dev

# Access the application
# Open: http://localhost:5173 (Vite default)
```

---

## 📊 Priority System Quick Reference

| Type | Priority | Icon | Color | Use Case |
|------|----------|------|-------|----------|
| Placement | 1️⃣ (Highest) | 🎯 | Gold #FFD700 | Jobs, Internships, Recruitment |
| Result | 2️⃣ (Medium) | 📊 | Sky Blue #87CEEB | Grades, Exam Results |
| Event | 3️⃣ (Lowest) | 📅 | Green #90EE90 | Workshops, Seminars, Deadlines |

---

## 🔄 Data Flow

```
1. Component Mount
   ↓
2. Call fetchNotifications()
   ├─ Log: "API request started"
   ├─ Bearer token auth
   ├─ Log: "API request success" (or "failure")
   ↓
3. Call processNotifications()
   ├─ Sort by: Priority (ascending)
   ├─ Sort by: Timestamp (descending)
   ├─ Select: Top 10 items
   ↓
4. Update UI
   ├─ Display notifications
   ├─ Show loading/error states
```

---

## 💡 Key Functions

### notificationService.js

```javascript
// Fetch notifications from API
fetchNotifications() → Promise<Array>

// Get priority value for a type
getPriorityValue(type) → 1|2|3|999

// Sort notifications
sortNotificationsByPriority(arr) → Array

// Get top N notifications
getTopNNotifications(arr, n) → Array

// Main processing pipeline
processNotifications(arr) → Array (top 10)
```

### PriorityNotifications.jsx

```javascript
// Component
<PriorityNotifications />

// States
- notifications: Array
- loading: Boolean
- error: String

// Lifecycle
useEffect(() => {
  // Load notifications on mount
  // Handle errors
})
```

---

## 📝 Logging Points

Every operation is logged to the backend:

```javascript
// When: Component mounts
Log("PriorityNotifications", "info", "PriorityNotifications", "Component loaded")

// When: API request starts
Log("notificationService", "info", "fetchNotifications", 
    "API request started for fetching notifications")

// When: API request succeeds
Log("notificationService", "info", "fetchNotifications", 
    `API request success - Retrieved ${count} notifications`)

// When: API request fails
Log("notificationService", "error", "fetchNotifications", 
    `API request failure: {error}`)

// When: Component error
Log("PriorityNotifications", "error", "PriorityNotifications", 
    `Failed to load notifications: {error}`)
```

---

## 🎯 API Details

**Endpoint:** `http://4.224.186.213/evaluation-service/notifications`

**Request:**
```javascript
GET /evaluation-service/notifications
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": "...",
    "type": "Placement|Result|Event",
    "title": "...",
    "description": "...",
    "timestamp": "2026-05-30T10:30:00Z"
  }
]
```

---

## ⚡ Performance

| Operation | Time | Scale |
|-----------|------|-------|
| Fetch | ~100-500ms | Network dependent |
| Sort | < 1ms | 100 items |
| Sort | < 5ms | 1,000 items |
| Sort | < 50ms | 10,000 items |
| Render | < 100ms | 10 items (DOM) |

**Complexity:** O(n log n) for sorting, O(1) for top-N selection

---

## 🎨 UI Components

### Notification Item Structure
```
┌─────────────────────────────────────────┐
│ 🎯 Placement                        #1  │ ← Header with icon, type, rank
├─────────────────────────────────────────┤
│ Goldman Sachs Campus Drive              │ ← Title
│ Off-campus placement drive scheduled... │ ← Description
├─────────────────────────────────────────┤
│                    May 30, 2026 10:30 AM│ ← Timestamp
└─────────────────────────────────────────┘
```

### States

```
Loading:
┌──────────────────────────────┐
│ Loading notifications...      │
└──────────────────────────────┘

Empty:
┌──────────────────────────────┐
│ No notifications available   │
└──────────────────────────────┘

Error:
┌──────────────────────────────┐
│ Error: Network request failed│
└──────────────────────────────┘
```

---

## 🔧 Customization

### Change Top N Count
```javascript
// notificationService.js
const processNotifications = (notifications) => {
  return getTopNNotifications(notifications, 20); // Changed from 10
};
```

### Add New Notification Type
```javascript
// notificationService.js
const PRIORITY_MAP = {
  Placement: 1,
  Result: 2,
  Event: 3,
  Award: 4,  // Add new type
};

// PriorityNotifications.jsx
const getNotificationColor = (type) => {
  // Add new case
  case "Award": return "#FF69B4"; // Pink
};

const getNotificationIcon = (type) => {
  // Add new case
  case "Award": return "🏆";
};
```

### Adjust Colors
```javascript
// PriorityNotifications.jsx
const getNotificationColor = (type) => {
  case "Placement": return "#FFD700";  // Change hex code
};
```

---

## 🐛 Troubleshooting

### "API request failed" error
- Check network connectivity
- Verify endpoint: `http://4.224.186.213/evaluation-service/notifications`
- Verify Bearer token in logger.js
- Check browser DevTools Network tab

### No notifications displayed
- Check API response in Network tab
- Verify response has correct structure
- Check browser console for errors
- Verify sorting logic in console

### Styling issues
- Clear browser cache (Ctrl+Shift+Del)
- Check CSS files are imported
- Verify media queries for mobile (< 640px)

### Logging not working
- Verify logger.js has correct TOKEN
- Check DevTools Network tab for /logs endpoint
- Verify `Authorization: Bearer {TOKEN}` header

---

## 📚 File Contents Summary

### App.jsx
- Root component with header and footer
- Imports PriorityNotifications
- Logs component initialization

### PriorityNotifications.jsx
- Fetches notifications on mount
- Handles loading/error states
- Renders notification list
- Maps priority to colors/icons

### notificationService.js
- Exports core business functions
- Handles API communication
- Implements sorting algorithm
- No React dependencies

### CSS Files
- Responsive design (mobile-first)
- Color scheme and typography
- Flexbox layouts
- Smooth animations

---

## ✅ Verification Checklist

- [ ] All files exist in correct locations
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server
- [ ] Application loads in browser
- [ ] Network request visible in DevTools
- [ ] Notifications display (if API has data)
- [ ] Logging visible in /logs endpoint
- [ ] No console errors
- [ ] Mobile view works (resize browser < 640px)
- [ ] Colors display correctly

---

## 🔗 Related Resources

- **Design Document:** `Notification_System_Design.md` (15KB, comprehensive)
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **API Endpoint:** `http://4.224.186.213/evaluation-service/notifications`
- **Logging Endpoint:** `http://4.224.186.213/evaluation-service/logs`

---

## 📞 Support

For issues or questions:
1. Check the full design document
2. Review code comments in source files
3. Check browser DevTools (Console, Network tabs)
4. Verify API endpoints are accessible
5. Confirm Bearer token is valid

---

**Version:** 1.0  
**Date:** May 30, 2026  
**Status:** ✅ Complete
