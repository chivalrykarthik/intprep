# Merge Intervals 📅

## 1. The "Meeting Room Calendar" Analogy

Imagine you are the office manager. Everyone sends you their meeting requests for **Room A**.
- Alice: 9:00 - 10:00
- Bob: 9:30 - 10:30
- Charlie: 11:00 - 12:00

You need to stick a "Do Not Disturb" note on the door. You wouldn't write three separate notes. You'd realize that Alice and Bob's meetings overlap.
- **Alice + Bob** = Continuous busy time from **9:00 to 10:30**.
- **Charlie** is separate.

**This is the Merge Intervals pattern.** It's about taking a set of time ranges (intervals) and smashing the overlapping ones together into simplified, contiguous blocks.

---

## 2. The Core Concept

In coding interviews, we use this to handle data that spans ranges (time, memory blocks, IP ranges).

**The "Brute Force" (Dumb) Way:**
Compare every interval with every other interval to see if they overlap.
- Complexity: **O(N²)**. If you have 1,000 meetings, that's 1,000,000 checks.

**The "Merge Intervals" (Smart) Way:**
1. **SORT** the intervals by their start time. (This is the secret sauce 🥫).
2. Iterate through them once.
3. If the current meeting overlaps with the last on the list, **EXTEND** the end time.
4. If it doesn't overlap, just add it to the list.
- **Boom.** Clean, non-overlapping schedule.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the intervals merge!

```visualizer
{
  "type": "intervals", 
  "data": [[1, 3], [2, 6], [8, 10], [15, 18]],
  "description": "Notice how [1,3] and [2,6] merge because 2 < 3"
}
```

---

## 4. Scenario A: Consolidating Schedules (The Classic)
**Real-Life Scenario:** Your calendar app consolidating all your fragmented "busy" slots into solid blocks to show others when you are unavailable.

**Technical Problem:** Given an array of intervals `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals.

### TypeScript Implementation

```typescript
/**
 * Merges overlapping intervals.
 * 
 * @param intervals - Array of [start, end] pairs.
 * @returns A new array of merged intervals.
 * 
 * @timeComplexity O(N log N) - Sorting takes the most time. The linear scan is only O(N).
 * @spaceComplexity O(N) - To store the output array.
 */
function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;

  // 1. Sort by Start Time (Crucial Step)
  // We use a comparative sort: a[0] - b[0]
  intervals.sort((a, b) => a[0] - b[0]);

  const result: number[][] = [];
  
  // Initialize with the first interval
  let currentInterval = intervals[0];
  result.push(currentInterval);

  for (let i = 1; i < intervals.length; i++) {
    const nextInterval = intervals[i];
    const [currentStart, currentEnd] = currentInterval;
    const [nextStart, nextEnd] = nextInterval;

    if (nextStart <= currentEnd) {
      // OVERLAP DETECTED! Merge them.
      // The new end is the max of both ends.
      // result reference updates automatically since currentInterval is a reference
      currentInterval[1] = Math.max(currentEnd, nextEnd);
    } else {
      // NO OVERLAP. Move to next.
      currentInterval = nextInterval;
      result.push(currentInterval);
    }
  }

  return result;
}

// Example Usage:
const meetingTimes = [[1, 3], [2, 6], [8, 10], [15, 18]];
console.log("Original Intervals:", meetingTimes);
console.log("Merged Intervals:", merge(meetingTimes));
```
### Sample input and output
- **Input**: `[[1,3],[2,6],[8,10],[15,18]]`
- **Output**: `[[1,6],[8,10],[15,18]]`

---

## 5. Scenario B: Insert Interval (The New Booking)
**Real-Life Scenario:** You already have a sorted list of busy times. A VIP client calls and demands a slot from `[5, 7]`. You need to slide this in and re-merge any conflicts it causes.

**Technical Problem:** You are given an array of non-overlapping intervals `intervals` sorted by start time, and a `newInterval`. Insert `newInterval` into `intervals` and merge if necessary.

### TypeScript Implementation

```typescript
/**
 * Inserts a new interval and merges overlaps.
 */
function insert(intervals: number[][], newInterval: number[]): number[][] {
    const result: number[][] = [];
    let i = 0;
    const n = intervals.length;

    // 1. Add all intervals that come strictly BEFORE the new one
    // (Interval ends before new one starts)
    while (i < n && intervals[i][1] < newInterval[0]) {
        result.push(intervals[i]);
        i++;
    }

    // 2. Merge all overlapping intervals
    // (Interval starts before new one ends)
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.push(newInterval);

    // 3. Add the rest
    while (i < n) {
        result.push(intervals[i]);
        i++;
    }

    return result;
}

// Example Usage:
const existingIntervals = [[1, 3], [6, 9]];
const newSlot = [2, 5];
console.log("Existing schedule:", existingIntervals);
console.log("Insert slot:", newSlot);
console.log("Calculated schedule:", insert(existingIntervals, newSlot));
```

---

## 6. Real World Applications 🌍

### 1. 📅 Calendar Apps
Google Calendar, Outlook. When you view "Day View", overlapping events are rendered side-by-side or merged visually. The underlying logic uses interval merging to calculate free blocks.

### 2. 💾 Disk Defragmentation & Memory Management
Operating systems manage free memory blocks. If you free up two adjacent blocks of RAM, the OS merges them into one larger free block using this pattern so it can allocate larger chunks later.

---

## 7. Complexity Analysis 🧠

Why sort first?

### Time Complexity: O(N log N) ⚡
- **Sorting:** JavaScript's `sort()` (usually Timsort or Merge Sort) takes **O(N log N)**.
- **Merging:** We iterate through the list once, which is **O(N)**.
- **Total:** **O(N log N)**. The sorting dominates.

### Space Complexity: O(N) 💾
- We create a new array to store the merged result. In the worst case (no overlaps), this is the same size as input, so **O(N)**.
