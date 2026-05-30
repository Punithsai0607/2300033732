# Afford Medical Campus Notifications Microservice - Stage 1
## System Design Document

---

## Executive Summary

This document describes the design and architecture of **Stage 1** of the Afford Medical Campus Notifications Microservice. The system fetches campus notifications from a centralized evaluation service, applies intelligent priority-based filtering and sorting, and displays the top 10 priority notifications in a user-friendly React interface.

---

## 1. Notification Priority System

### 1.1 Priority Classification

Notifications are classified into three types with the following priority hierarchy:

| Rank | Type | Priority Value | Icon | Color | Description |
|------|------|---|---|---|---|
| 1 | **Placement** | 1 | 🎯 | #FFD700 (Gold) | Campus recruitment drives, placement offers, internship announcements |
| 2 | **Result** | 2 | 📊 | #87CEEB (Sky Blue) | Exam results, assignment grades, academic performance updates |
| 3 | **Event** | 3 | 📅 | #90EE90 (Light Green) | Campus events, workshops, seminars, webinars, deadlines |

### 1.2 Priority Algorithm

```javascript
PRIORITY_MAP = {
  Placement: 1,    // Highest priority
  Result: 2,       // Medium priority
  Event: 3         // Lowest priority
}

getPriorityValue(notificationType) {
  return PRIORITY_MAP[notificationType] || 999;
  // Default to 999 for unknown types (lowest priority)
}
```

The lower the numeric value, the **higher** the priority in the display order.

---

## 2. Sorting Strategy

### 2.1 Two-Level Sorting

Notifications are sorted using a **composite key** approach:

**Level 1: Primary Sort - Priority**
- Sort by notification type priority (ascending, 1 to 3)
- Ensures all Placement notifications appear before Result notifications
- All Result notifications appear before Event notifications

**Level 2: Secondary Sort - Timestamp**
- Within the same priority level, sort by timestamp (descending)
- Most recent notifications appear first
- Ensures users see latest updates within each priority category

### 2.2 Sorting Implementation

```javascript
sortNotificationsByPriority(notifications) {
  return notifications.sort((a, b) => {
    // Primary: Compare priority values
    const priorityA = getPriorityValue(a.type);
    const priorityB = getPriorityValue(b.type);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;  // Lower number = higher priority
    }

    // Secondary: Compare timestamps (descending - latest first)
    const timestampA = new Date(a.timestamp).getTime();
    const timestampB = new Date(b.timestamp).getTime();

    return timestampB - timestampA;  // Descending order
  });
}
```

### 2.3 Sorting Example

**Input (Unsorted):**
```
Event from 2:00 PM
Placement from 1:00 PM
Event from 3:00 PM
Result from 2:30 PM
Placement from 2:00 PM
Result from 1:30 PM
```

**Output (Sorted):**
```
1. Placement from 2:00 PM   (Priority 1, Latest timestamp)
2. Placement from 1:00 PM   (Priority 1, Earlier timestamp)
3. Result from 2:30 PM      (Priority 2, Latest timestamp)
4. Result from 1:30 PM      (Priority 2, Earlier timestamp)
5. Event from 3:00 PM       (Priority 3, Latest timestamp)
6. Event from 2:00 PM       (Priority 3, Earlier timestamp)
```

---

## 3. Top N Selection Algorithm

### 3.1 Top N Notifications

The system displays only the **Top 10 priority notifications** to:
- Prevent information overload
- Focus user attention on most relevant updates
- Improve performance with limited display space

### 3.2 Implementation

```javascript
getTopNNotifications(notifications, n = 10) {
  const sortedNotifications = sortNotificationsByPriority(notifications);
  return sortedNotifications.slice(0, n);  // Return first n items
}

processNotifications(notifications) {
  return getTopNNotifications(notifications, 10);
}
```

---

## 4. Time Complexity Analysis

### 4.1 Operation Analysis

| Operation | Time Complexity | Space Complexity | Notes |
|---|---|---|---|
| Fetch Notifications | O(1) | O(n) | n = number of notifications from API |
| Sort (Merge Sort) | **O(n log n)** | O(n) | JavaScript's sort() uses optimized algorithms |
| Select Top N | **O(n)** | O(n) | Linear scan + slice operation |
| **Total Processing** | **O(n log n)** | O(n) | Sorting dominates overall complexity |

### 4.2 Practical Performance

For typical notification volumes:
- **100 notifications**: < 1ms
- **1,000 notifications**: < 5ms
- **10,000 notifications**: < 50ms
- **100,000 notifications**: < 500ms

JavaScript's native `sort()` is highly optimized and typically uses:
- **Quicksort** for larger arrays
- **Merge Sort** guarantees O(n log n) worst-case
- **Insertion Sort** for small subarrays

---

## 5. Efficient Maintenance of Top N Notifications

### 5.1 Real-Time Update Strategy

When new notifications arrive in subsequent stages, use these approaches:

#### Approach 1: Immediate Re-Sort (Current Stage 1)
```javascript
// Simple approach for Stage 1
const newNotifications = await fetchNotifications();
const topNotifications = processNotifications(newNotifications);
setNotifications(topNotifications);
```

**Pros:** Simple, clean code  
**Cons:** O(n log n) for each fetch  
**Use Case:** Stage 1 initial implementation

#### Approach 2: Incremental Update with Min-Heap (Recommended for Stage 2+)
```javascript
class PriorityQueue {
  constructor(maxSize = 10) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  push(notification) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(notification);
      this.heapifyUp(this.heap.length - 1);
    } else if (this.compare(notification, this.heap[0]) < 0) {
      this.heap[0] = notification;
      this.heapifyDown(0);
    }
  }

  heapifyUp(index) { /* ... */ }
  heapifyDown(index) { /* ... */ }
  compare(a, b) { /* Priority comparison logic */ }
}
```

**Time Complexity:** O(log n) per update  
**Space Complexity:** O(n)  
**Benefit:** Extremely efficient for streaming updates

#### Approach 3: Hybrid Approach (Balanced Performance)
```javascript
// Collect updates in a batch
const batchUpdates = [];

// Add new notification to batch
batchUpdates.push(newNotification);

// Every 30 seconds or when batch size > 5, re-sort
if (batchUpdates.length > 5 || timeSinceLastSort > 30000) {
  const combined = [...currentNotifications, ...batchUpdates];
  const topNotifications = processNotifications(combined);
  setNotifications(topNotifications);
  batchUpdates.length = 0;
}
```

**Pros:** Balanced performance with minimal re-sorting  
**Cons:** Slightly more complex state management  
**Use Case:** Production deployment with moderate update frequency

### 5.2 Priority Queue Implementation Details

```javascript
class MinHeap {
  constructor() {
    this.heap = [];
  }

  compare(a, b) {
    const priorityA = getPriorityValue(a.type);
    const priorityB = getPriorityValue(b.type);

    if (priorityA !== priorityB) return priorityA - priorityB;

    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA; // Reverse for max-heap behavior
  }

  heapifyUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
        [this.heap[index], this.heap[parentIndex]] = 
        [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  heapifyDown(index) {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.heap.length && 
          this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
        smallest = leftChild;
      }

      if (rightChild < this.heap.length && 
          this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = 
        [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}
```

**Time Complexities:**
- Push: O(log n)
- Pop: O(log n)
- Building heap from n items: O(n)

---

## 6. System Architecture

### 6.1 Component Hierarchy

```
App (Root)
├── PriorityNotifications (Main Component)
│   ├── Notification Items (Rendered List)
│   └── State Management
│       ├── notifications: Array
│       ├── loading: Boolean
│       └── error: String
└── notificationService.js (Business Logic)
    ├── fetchNotifications()
    ├── sortNotificationsByPriority()
    ├── getTopNNotifications()
    └── processNotifications()
```

### 6.2 Data Flow

```
App Loads
  ↓
[useEffect] Component Mounted
  ↓
Log: "Component loaded"
  ↓
Call fetchNotifications()
  ├─→ Log: "API request started"
  ├─→ Fetch from endpoint with Bearer token
  ├─→ Log: "API request success"
  └─→ Return notifications
  ↓
Call processNotifications()
  ├─→ Sort by priority
  ├─→ Sort by timestamp (descending)
  └─→ Select top 10
  ↓
Update Component State
  ├─→ setNotifications(processedData)
  ├─→ setLoading(false)
  └─→ setError(null)
  ↓
Render Notification List
```

---

## 7. Logging Strategy

### 7.1 Log Points

| Component | Operation | Level | Message |
|---|---|---|---|
| notificationService.js | API Request Start | INFO | "API request started for fetching notifications" |
| notificationService.js | API Request Success | INFO | "API request success - Retrieved X notifications" |
| notificationService.js | API Request Failure | ERROR | "API request failure: {error message}" |
| PriorityNotifications.jsx | Component Load | INFO | "Component loaded" |
| PriorityNotifications.jsx | Processing Error | ERROR | "Failed to load notifications: {error}" |

### 7.2 Log Format

```javascript
await Log(
  stack,        // "notificationService" or "PriorityNotifications"
  level,        // "info" or "error"
  pkg,          // Function/operation name
  message       // Detailed message
);
```

---

## 8. API Integration

### 8.1 Endpoint Details

- **URL:** `http://4.224.186.213/evaluation-service/notifications`
- **Method:** GET
- **Authentication:** Bearer Token (provided in logger.js)
- **Response Format:** JSON Array of Notification Objects

### 8.2 Expected Response Format

```json
[
  {
    "id": "notification-001",
    "type": "Placement",
    "title": "Goldman Sachs Campus Drive",
    "description": "Off-campus placement drive scheduled for this week",
    "timestamp": "2026-05-30T10:30:00Z"
  },
  {
    "id": "notification-002",
    "type": "Result",
    "title": "Data Structures Exam Results",
    "description": "Results published for DS examination",
    "timestamp": "2026-05-29T15:45:00Z"
  }
]
```

### 8.3 Error Handling

```javascript
// Network error
catch (error) {
  Log(..., "error", ..., `API request failure: ${error.message}`);
}

// HTTP error response
if (!response.ok) {
  throw new Error(`API Error: ${response.status} ${response.statusText}`);
}
```

---

## 9. UI/UX Features

### 9.1 Visual Indicators

- **Color Coding:** Each notification type has a distinct left border color
- **Icons:** Visual emojis for quick type identification
- **Priority Badge:** Shows ranking (#1-#10)
- **Timestamps:** Formatted to user's local timezone

### 9.2 States Handled

| State | Display |
|---|---|
| Loading | "Loading notifications..." |
| Success | Sorted notification list |
| Empty | "No notifications available" |
| Error | Error message with details |

### 9.3 Responsive Design

- Desktop: Full layout with clear spacing
- Tablet: Adjusted font sizes and padding
- Mobile: Optimized for small screens (< 640px)

---

## 10. File Structure

```
affordmed-frontend/
├── src/
│   ├── App.jsx                    # Root component
│   ├── App.css                    # App styling
│   ├── PriorityNotifications.jsx  # Main notifications component
│   ├── PriorityNotifications.css  # Notification styling
│   ├── notificationService.js     # Business logic and API calls
│   ├── logger.js                  # Logging middleware (existing)
│   └── main.jsx                   # Entry point (existing)
├── Notification_System_Design.md  # This document
└── package.json                   # Dependencies
```

---

## 11. Dependencies

- **React:** ^19.2.6 (UI framework)
- **React DOM:** ^19.2.6 (DOM rendering)
- **Native JavaScript:** No additional libraries required

---

## 12. Future Enhancements (Stage 2+)

### 12.1 Real-Time Updates

- WebSocket integration for live notification streaming
- Push notifications to users
- Sound/visual alerts for high-priority items

### 12.2 Filtering & Search

- Filter by notification type
- Search notifications by keywords
- Date range filters

### 12.3 Persistence

- Local storage for notification history
- Database for analytics
- Notification read/unread status

### 12.4 Performance Optimization

- Implement Priority Queue for O(log n) updates
- Virtual scrolling for large lists
- Caching strategies

### 12.5 Advanced Features

- User preference settings for priority
- Custom notification categories
- Integration with calendar systems
- Email/SMS digest notifications

---

## 13. Deployment Checklist

- [ ] All files created and in correct locations
- [ ] API endpoint verified and accessible
- [ ] Bearer token valid and present in logger.js
- [ ] Logging endpoints working correctly
- [ ] React development server running
- [ ] Browser dev tools verify API calls
- [ ] All notification types display correctly
- [ ] Sorting verified with test data
- [ ] Mobile responsiveness tested
- [ ] Error states verified

---

## 14. Testing Strategy

### 14.1 Unit Tests (To be implemented)

```javascript
// Test priority assignment
describe('getPriorityValue', () => {
  it('should return 1 for Placement', () => {
    expect(getPriorityValue('Placement')).toBe(1);
  });
  it('should return 2 for Result', () => {
    expect(getPriorityValue('Result')).toBe(2);
  });
  it('should return 3 for Event', () => {
    expect(getPriorityValue('Event')).toBe(3);
  });
});

// Test sorting
describe('sortNotificationsByPriority', () => {
  it('should sort by priority first, then by timestamp', () => {
    const unsorted = [...];
    const sorted = sortNotificationsByPriority(unsorted);
    // Verify sorted order
  });
});
```

### 14.2 Integration Tests (To be implemented)

- Verify API fetch with real endpoint
- Verify logging middleware captures all operations
- End-to-end rendering of processed notifications

---

## 15. Conclusion

The Afford Medical Campus Notifications Microservice - Stage 1 provides an efficient, scalable foundation for managing and displaying campus notifications. The priority-based sorting ensures users see the most important information first, while the modular architecture enables easy enhancement in future stages.

The O(n log n) time complexity for initial processing is acceptable for typical notification volumes and can be optimized to O(log n) per update using priority queues in subsequent stages.

---

**Document Version:** 1.0  
**Date:** May 30, 2026  
**Status:** Complete - Stage 1
