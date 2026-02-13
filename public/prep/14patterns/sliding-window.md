# The Sliding Window Pattern 🪟

## 1. The "Netflix & Chill" Analogy

Imagine you are watching **Netflix** on slow internet. The video player doesn't download the *entire* 2-hour movie at once—that would take forever.

Instead, it buffers a **small chunk** (say, 30 seconds) ahead of where you are watching.
- As you watch 1 second of video, it drops 1 second from the past.
- It immediately downloads 1 new second for the future.

**This is a Sliding Window.** You are viewing a massive dataset (the movie) through a small, moving frame (the buffer). You efficiently process the stream without holding the entire universe in memory.

---

## 2. The Core Concept

In coding interviews, we use this to avoid "re-calculating" things we already know.

**The "Brute Force" (Dumb) Way:**
Imagine you want to sum every group of 3 numbers in `[1, 2, 3, 4, 5]`.
- You calculate `1+2+3 = 6`.
- Then you shift and calculate `2+3+4 = 9`.
- **Wait!** You just added `2+3` again. Why? You already did that work!

**The "Sliding Window" (Smart) Way:**
- Calculate `1+2+3 = 6`.
- **Slide Right:** Throw away the `1`. Add the `4`.
- New Sum = `6 - 1 + 4 = 9`.
- **Boom.** You got the answer with just 2 math operations instead of 3.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the window slide!

```visualizer
{
  "type": "sliding-window",
  "data": [1, 2, 3, 4, 5, 2, 8],
  "k": 3
}
```

---

## 4. Scenario A: The "Spotify Playlist" (Fixed Size Window)
**Real-Life Scenario:** You want to find the **loudest** 3-song stretch in a playlist to wake up your neighbors.

**Technical Problem:** Find the maximum sum of any contiguous subarray of size `k`.

### TypeScript Implementation

```typescript
/**
 * Finds the maximum sum of a contiguous subarray of size k.
 * 
 * @param decibels - Array of integers representing song loudness.
 * @param k - The size of the window (number of songs).
 * @returns The maximum loudness sum, or 0 if input is invalid.
 * 
 * @timeComplexity O(n) - We pass through the array once.
 * @spaceComplexity O(1) - We only store a few variables (no extra arrays).
 */
function findLoudestStretch(decibels: number[], k: number): number {
  // Input validation
  if (!decibels || decibels.length < k || k <= 0) {
    console.warn("Invalid input: Array is too short or k is invalid.");
    return 0;
  }

  let currentLoudness = 0;
  let maxLoudness = 0;

  // 1. Initialize the first window
  for (let i = 0; i < k; i++) {
    currentLoudness += decibels[i];
  }
  maxLoudness = currentLoudness;

  // 2. Slide the window across the rest of the array
  for (let i = k; i < decibels.length; i++) {
    const finishedSong = decibels[i - k]; // Element sliding out (left)
    const newSong = decibels[i];          // Element sliding in (right)

    // Optimization: Adjust sum instead of recalculating
    currentLoudness = currentLoudness - finishedSong + newSong;
    
    maxLoudness = Math.max(maxLoudness, currentLoudness);
  }

  return maxLoudness;
}

// Example Usage:
const songs = [80, 90, 80, 100, 110, 80];
const kSongs = 3;
console.log("Playlist:", songs);
console.log(`Loudest ${kSongs}-song stretch sum:`, findLoudestStretch(songs, kSongs));
```
### Sample input and output
- **Input**: `decibels = [80, 90, 80, 100, 110, 80]`, `k = 3`
- **Output**: `290` (subarray `[80, 100, 110]` or `[100, 110, 80]`)

---

## 5. Scenario B: The "Hungry Caterpillar" (Dynamic Size Window)
**Real-Life Scenario:** A hungry caterpillar wants to eat leaves until it is **at least** 70% full. It wants to do this by eating the **fewest** leaves possible (it's lazy).

**Technical Problem:** Find the length of the **smallest** subarray whose sum is greater than or equal to `S`.

### TypeScript Implementation

```typescript
/**
 * Finds the minimal length of a contiguous subarray of which the sum is >= target.
 * 
 * @param targetFullness - The sum we want to reach.
 * @param leaves - Array of nutritional values (integers).
 * @returns The minimal length, or 0 if no such subarray exists.
 * 
 * @timeComplexity O(n) - Each element is added once and removed at most once.
 * @spaceComplexity O(1) - Constant extra space used.
 */
function lazyCaterpillar(targetFullness: number, leaves: number[]): number {
  if (!leaves || leaves.length === 0) return 0;
  
  let minLeavesEaten = Infinity;
  let currentFullness = 0;
  let windowStart = 0;

  // `windowEnd` extends the window to the right (eating)
  for (let windowEnd = 0; windowEnd < leaves.length; windowEnd++) {
    currentFullness += leaves[windowEnd]; 

    // Contract the window from the left as long as valid (spitting out)
    while (currentFullness >= targetFullness) {
      const currentWindowSize = windowEnd - windowStart + 1;
      minLeavesEaten = Math.min(minLeavesEaten, currentWindowSize);
      
      // Remove element at windowStart to try and find a smaller valid window
      currentFullness -= leaves[windowStart];
      windowStart++; 
    }
  }

  return minLeavesEaten === Infinity ? 0 : minLeavesEaten;
}

// Example Usage:
const leaves = [10, 20, 30, 10, 50];
const target = 70;
console.log("Leaves:", leaves);
console.log("Target Fullness:", target);
console.log("Minimum leaves needed:", lazyCaterpillar(target, leaves));
```
### Sample input and output
- **Input**: `targetFullness = 70`, `leaves = [10, 20, 30, 10, 50]`
- **Output**: `3` (subarray `[30, 10, 50]` has sum 90 ≥ 70)

---

## 6. Real World Applications 🌍

### 1. 🚦 TCP Flow Control (The Traffic Cop)
The internet runs on Sliding Windows. When you send data, your computer (Sender) says *"I am sending packets 1, 2, 3"*. It won't send packet 4 until the Receiver confirms it got packet 1. This prevents digital traffic jams.

### 2. 📹 Live Streaming (Twitch/YouTube)
Streaming isn't magic; it's a sliding window. The server pushes video chunks into a buffer window on your device. Your device plays from the start of the window. If your internet lags, the window empties (buffering). If it's fast, the window stays full, sliding smoothly along the timeline.

### 3. 🛡️ API Rate Limiter (The Bouncer)
*"You can only make 5 requests per minute."*
The server keeps a sliding window of timestamps (e.g., `12:00:00` to `12:01:00`).
- User hits API at `12:01:05`.
- Server checks the window `12:00:05` to `12:01:05`.
- If counts > 5, **BLOCKED.**
- Old requests slide out of the window automatically.

### 4. 📈 Stock Trading (Moving Averages)
Traders don't look at raw jagged price lines. They look at **Moving Averages**.
- A "50-Day Moving Average" is literally a sliding window of the last 50 days.
- It smooths out the noise to show the true direction (trend) of the market.

---

## 7. Complexity Analysis 🧠

Why do we care about Sliding Window? Because it turns a slow algorithm into a fast one.

### Time Complexity: O(N) ⚡
- **Brute Force:** To calculate the sum of every subarray of size `K`, you loop `K` times for each of the `N` elements.
    - Complexity: **O(N * K)**. If `K` is large (e.g., N/2), this is basically **O(N²)**. Slow!
- **Sliding Window:** You only loop through the array **once**.
    - You add one element and remove one element at each step (constant work, O(1)).
    - Complexity: **O(N)**. Linear time. Fast!

### Space Complexity: O(1) 💾
- We don't create a new array for every window.
- We just keep a few variables (`currentSum`, `windowStart`, `maxSum`).
- Constant space usage, regardless of how big the input array is.

