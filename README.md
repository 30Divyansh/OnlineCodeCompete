# CodeDuel – Dynamic Two-Player Coding Competition Platform ⚔️

**CodeDuel** is a real-time, head-to-head competitive programming platform inspired by LeetCode and HackerRank. It allows two players to enter a duel lobby, independently select problems from a standard problem library, and compete simultaneously once both have chosen the same challenge.

---

## 🚀 Key Features

### 1. Dynamic Question-Selection & Matchmaking System
- **No Hardcoded Sequence:** Players browse the 30 standard algorithmic questions and independently pick a preferred challenge.
- **Mismatch State:** If Player 1 selects *Kadane's Algorithm* and Player 2 selects *Two Sum*, a mismatch alert appears, preventing duel start until both align on the same problem.
- **Match Confirmation:** Once both players choose the exact same problem, a confirmation screen unlocks.
- **Simultaneous Start:** When both competitors confirm readiness, a synchronized 3-second countdown triggers and both enter the live competition workspace together.
- **2-Player Testing & Bot Support:** Includes an **"Open Player 2 Tab"** shortcut for instant local 2-window testing, as well as an optional **CodeDuel Bot (AI Competitor)** mode.

### 2. Standard Algorithmic Problem Library (30 Questions)
Includes 30 standard problems across 6 core categories with descriptions, constraints, I/O formats, sample test cases, and hidden test cases:
- **Arrays and Searching:** Kadane's Algorithm, Maximum Product Subarray, Two Sum, Three Sum, Best Time to Buy and Sell Stock, Container With Most Water.
- **Sorting and Searching:** Binary Search, Search in Rotated Sorted Array, Merge Intervals, Find the Median of Two Sorted Arrays.
- **Dynamic Programming:** 0/1 Knapsack, Longest Common Subsequence, Longest Increasing Subsequence, Coin Change, Edit Distance.
- **Trees and Graphs:** Binary Tree Level Order Traversal, Maximum Depth of Binary Tree, Lowest Common Ancestor, Number of Islands, Detect Cycle in a Graph.
- **Greedy and Other Algorithms:** Activity Selection, Job Sequencing, Minimum Platforms, Dijkstra's Shortest Path, Prim's Minimum Spanning Tree.
- **Stacks, Queues and Strings:** Next Greater Element, Valid Parentheses, Longest Substring Without Repeating Characters, Trapping Rain Water, Largest Rectangle in Histogram.
- **Data-Driven & Admin CRUD:** Administrators can add, edit, or delete problems dynamically via REST API and the Problem Library UI without touching code.

### 3. LeetCode-Inspired 3-Panel Workspace
- **Left Panel:** Problem statement, constraints, examples, explanation, and past duel submissions.
- **Center Panel:** Monaco Code Editor with line numbers, indentation, syntax highlighting, Reset Code, and collapsible Console with **Testcase** (custom input support) and **Result** tabs.
- **Right Panel:** Live Duel Dashboard with synchronized timer, score cards, test cases passed, score progress bar, and real-time opponent activity feed (opponent's code remains completely private).

### 4. Multi-Language Execution & Dynamic Scoring
- **Supported Languages:** **Python 3**, **C++ (G++ 17/20)**, **JavaScript (Node.js)**, and **Java (JDK 21)**.
- **Secure Sandboxed Execution:** High-resolution runtime timing (`time.perf_counter()`), memory tracking (`tracemalloc`), and timeout protection (TLE).
- **Configurable Scoring:** Base points for correctness (100 pts), proportional points for partial test cases passed, execution speed bonuses (up to +20 pts), and memory bonuses (up to +10 pts).
- **Tie-Breaker Logic:** If scores are equal, the competitor with the faster execution time on their correct solution wins.

### 5. Leaderboard, Profiles & Theming
- **Global Leaderboard:** Ranked by rating, win rate, total points, and duels won.
- **User Profiles:** Match history, victory stats, solved problems breakdown, and easy player switcher.
- **Persistent Theming:** Clean dark and light modes with instant toggle and `localStorage` persistence.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router 6, Monaco Editor, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB (with automatic persistent fallback JSON storage engine for zero-configuration instant local runs)
- **Execution Engines:** Python 3, Node.js, OpenJDK 21, G++

---

## 🏁 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/30Divyansh/OnlineCodeCompete.git
cd OnlineCodeCompete

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Run the Application

#### Option A: Single Command (Unified Production Server)
```bash
cd server
node server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

#### Option B: Development Mode (Hot-Reloading)
In terminal 1:
```bash
cd server
node server.js
```
In terminal 2:
```bash
cd client
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎮 How to Test a 1v1 Duel Locally

1. Open **http://localhost:3000** and click **"Create Duel Room"**.
2. Click **"Open Player 2 Tab"** in the room lobby header to open a second player window side-by-side.
3. Test mismatch by picking different problems, then select the same problem to unlock the **Confirmation Screen**.
4. Confirm both players and click **"START COMPETITION"** to begin simultaneous coding!
