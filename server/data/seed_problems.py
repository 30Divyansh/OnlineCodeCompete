import json
import os

problems = [
    # ==========================================
    # Arrays and Searching (1 - 6)
    # ==========================================
    {
        "id": "kadanes-algorithm",
        "title": "Kadane's Algorithm – Maximum Subarray Sum",
        "category": "Arrays and Searching",
        "difficulty": "Medium",
        "description": "Given an integer array `nums`, find the subarray with the largest sum, and return *its sum*.\n\nA **subarray** is a contiguous non-empty sequence of elements within an array.",
        "inputFormat": "A list of integers `nums`.",
        "outputFormat": "Return an integer representing the maximum subarray sum.",
        "constraints": [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ],
        "functionName": "maxSubArray",
        "starterCode": "def maxSubArray(nums: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
                "expected": 6,
                "explanation": "The subarray [4, -1, 2, 1] has the largest sum 6."
            },
            {
                "input": [[1]],
                "expected": 1,
                "explanation": "The subarray [1] has the largest sum 1."
            },
            {
                "input": [[5, 4, -1, 7, 8]],
                "expected": 23,
                "explanation": "The subarray [5, 4, -1, 7, 8] has the largest sum 23."
            }
        ],
        "hiddenTestCases": [
            {"input": [[-1]], "expected": -1},
            {"input": [[-5, -2, -8, -1, -4]], "expected": -1},
            {"input": [[-2, -1]], "expected": -1},
            {"input": [[1, 2, 3, 4, 5]], "expected": 15},
            {"input": [[10, -3, 2, 1, -4, 8, -2, 5]], "expected": 17}
        ],
        "solutionCode": "def maxSubArray(nums):\n    max_sum = current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum"
    },
    {
        "id": "maximum-product-subarray",
        "title": "Maximum Product Subarray",
        "category": "Arrays and Searching",
        "difficulty": "Medium",
        "description": "Given an integer array `nums`, find a subarray that has the largest product, and return *the product*.\n\nThe test cases are generated so that the answer will fit in a **32-bit** integer.",
        "inputFormat": "A list of integers `nums`.",
        "outputFormat": "Return an integer representing the maximum product of a subarray.",
        "constraints": [
            "1 <= nums.length <= 2 * 10^4",
            "-10 <= nums[i] <= 10"
        ],
        "functionName": "maxProduct",
        "starterCode": "def maxProduct(nums: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[2, 3, -2, 4]],
                "expected": 6,
                "explanation": "[2,3] has the largest product 6."
            },
            {
                "input": [[-2, 0, -1]],
                "expected": 0,
                "explanation": "The result cannot be 2, because [-2,-1] is not a subarray."
            }
        ],
        "hiddenTestCases": [
            {"input": [[-2]], "expected": -2},
            {"input": [[-2, 3, -4]], "expected": 24},
            {"input": [[0, 2]], "expected": 2},
            {"input": [[-1, -2, -3, 0]], "expected": 6},
            {"input": [[2, -5, -2, -4, 3]], "expected": 24}
        ],
        "solutionCode": "def maxProduct(nums):\n    cur_max, cur_min = 1, 1\n    res = max(nums)\n    for n in nums:\n        vals = (n, n * cur_max, n * cur_min)\n        cur_max = max(vals)\n        cur_min = min(vals)\n        res = max(res, cur_max)\n    return res"
    },
    {
        "id": "two-sum",
        "title": "Two Sum",
        "category": "Arrays and Searching",
        "difficulty": "Easy",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.",
        "inputFormat": "A list of integers `nums` and an integer `target`.",
        "outputFormat": "Return a list of two indices `[index1, index2]`.",
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        "functionName": "twoSum",
        "starterCode": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[2, 7, 11, 15], 9],
                "expected": [0, 1],
                "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                "input": [[3, 2, 4], 6],
                "expected": [1, 2],
                "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
            },
            {
                "input": [[3, 3], 6],
                "expected": [0, 1],
                "explanation": "nums[0] + nums[1] == 6."
            }
        ],
        "hiddenTestCases": [
            {"input": [[1, 5, 8, 3], 13], "expected": [1, 2]},
            {"input": [[-3, 4, 3, 90], 0], "expected": [0, 2]},
            {"input": [[0, 4, 3, 0], 0], "expected": [0, 3]},
            {"input": [[-1, -2, -3, -4, -5], -8], "expected": [2, 4]}
        ],
        "solutionCode": "def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i\n    return []"
    },
    {
        "id": "three-sum",
        "title": "Three Sum",
        "category": "Arrays and Searching",
        "difficulty": "Medium",
        "description": "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
        "inputFormat": "A list of integers `nums`.",
        "outputFormat": "Return a list of triplets `[[a, b, c], ...]` sorted in ascending order.",
        "constraints": [
            "3 <= nums.length <= 3000",
            "-10^5 <= nums[i] <= 10^5"
        ],
        "functionName": "threeSum",
        "starterCode": "def threeSum(nums: list[int]) -> list[list[int]]:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[-1, 0, 1, 2, -1, -4]],
                "expected": [[-1, -1, 2], [-1, 0, 1]],
                "explanation": "Distinct triplets that sum to 0 are [-1, 0, 1] and [-1, -1, 2]."
            },
            {
                "input": [[0, 1, 1]],
                "expected": [],
                "explanation": "The only possible triplet does not sum up to 0."
            },
            {
                "input": [[0, 0, 0]],
                "expected": [[0, 0, 0]],
                "explanation": "The only possible triplet sums up to 0."
            }
        ],
        "hiddenTestCases": [
            {"input": [[-2, 0, 1, 1, 2]], "expected": [[-2, 0, 2], [-2, 1, 1]]},
            {"input": [[-1, 0, 1, 0]], "expected": [[-1, 0, 1]]},
            {"input": [[-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6]], "expected": [[-4, -2, 6], [-4, 0, 4], [-4, 1, 3], [-4, 2, 2], [-2, -2, 4], [-2, 0, 2]]}
        ],
        "solutionCode": "def threeSum(nums):\n    res = []\n    nums.sort()\n    for i, a in enumerate(nums):\n        if i > 0 and a == nums[i - 1]:\n            continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            threeSum = a + nums[l] + nums[r]\n            if threeSum > 0:\n                r -= 1\n            elif threeSum < 0:\n                l += 1\n            else:\n                res.append([a, nums[l], nums[r]])\n                l += 1\n                while l < r and nums[l] == nums[l - 1]:\n                    l += 1\n    return res"
    },
    {
        "id": "best-time-to-buy-and-sell-stock",
        "title": "Best Time to Buy and Sell Stock",
        "category": "Arrays and Searching",
        "difficulty": "Easy",
        "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day.\n\nYou want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.\n\nReturn *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return `0`.",
        "inputFormat": "A list of integers `prices`.",
        "outputFormat": "Return an integer representing maximum profit.",
        "constraints": [
            "1 <= prices.length <= 10^5",
            "0 <= prices[i] <= 10^4"
        ],
        "functionName": "maxProfit",
        "starterCode": "def maxProfit(prices: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[7, 1, 5, 3, 6, 4]],
                "expected": 5,
                "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."
            },
            {
                "input": [[7, 6, 4, 3, 1]],
                "expected": 0,
                "explanation": "In this case, no transactions are done and the max profit = 0."
            }
        ],
        "hiddenTestCases": [
            {"input": [[2, 4, 1]], "expected": 2},
            {"input": [[3, 2, 6, 5, 0, 3]], "expected": 4},
            {"input": [[1, 2]], "expected": 1},
            {"input": [[2, 1, 2, 1, 0, 1, 2]], "expected": 2}
        ],
        "solutionCode": "def maxProfit(prices):\n    min_p = float('inf')\n    max_prof = 0\n    for p in prices:\n        if p < min_p:\n            min_p = p\n        elif p - min_p > max_prof:\n            max_prof = p - min_p\n    return max_prof"
    },
    {
        "id": "container-with-most-water",
        "title": "Container With Most Water",
        "category": "Arrays and Searching",
        "difficulty": "Medium",
        "description": "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn *the maximum amount of water a container can store*.",
        "inputFormat": "A list of non-negative integers `height`.",
        "outputFormat": "Return an integer representing max volume.",
        "constraints": [
            "n == height.length",
            "2 <= n <= 10^5",
            "0 <= height[i] <= 10^4"
        ],
        "functionName": "maxArea",
        "starterCode": "def maxArea(height: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[1, 8, 6, 2, 5, 4, 8, 3, 7]],
                "expected": 49,
                "explanation": "The maximum area is obtained between index 1 (height 8) and index 8 (height 7): min(8, 7) * (8 - 1) = 49."
            },
            {
                "input": [[1, 1]],
                "expected": 1,
                "explanation": "The distance is 1 and heights are 1, area = 1."
            }
        ],
        "hiddenTestCases": [
            {"input": [[4, 3, 2, 1, 4]], "expected": 16},
            {"input": [[1, 2, 1]], "expected": 2},
            {"input": [[2, 3, 4, 5, 18, 17, 6]], "expected": 17},
            {"input": [[1, 2, 4, 3]], "expected": 4}
        ],
        "solutionCode": "def maxArea(height):\n    l, r = 0, len(height) - 1\n    res = 0\n    while l < r:\n        res = max(res, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return res"
    },

    # ==========================================
    # Sorting and Searching (7 - 10)
    # ==========================================
    {
        "id": "binary-search",
        "title": "Binary Search",
        "category": "Sorting and Searching",
        "difficulty": "Easy",
        "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
        "inputFormat": "A sorted list of integers `nums` and an integer `target`.",
        "outputFormat": "Return an integer representing index of target or -1.",
        "constraints": [
            "1 <= nums.length <= 10^4",
            "-10^4 < nums[i], target < 10^4",
            "All the integers in nums are unique.",
            "nums is sorted in ascending order."
        ],
        "functionName": "search",
        "starterCode": "def search(nums: list[int], target: int) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[-1, 0, 3, 5, 9, 12], 9],
                "expected": 4,
                "explanation": "9 exists in nums and its index is 4."
            },
            {
                "input": [[-1, 0, 3, 5, 9, 12], 2],
                "expected": -1,
                "explanation": "2 does not exist in nums so return -1."
            }
        ],
        "hiddenTestCases": [
            {"input": [[5], 5], "expected": 0},
            {"input": [[5], -5], "expected": -1},
            {"input": [[2, 5], 5], "expected": 1},
            {"input": [[1, 3, 5, 7, 9, 11, 13], 1], "expected": 0},
            {"input": [[1, 3, 5, 7, 9, 11, 13], 13], "expected": 6}
        ],
        "solutionCode": "def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            l = mid + 1\n        else:\n            r = mid - 1\n    return -1"
    },
    {
        "id": "search-in-rotated-sorted-array",
        "title": "Search in Rotated Sorted Array",
        "category": "Sorting and Searching",
        "difficulty": "Medium",
        "description": "There is an integer array `nums` sorted in ascending order (with distinct values).\n\nPrior to being passed to your function, `nums` is possibly rotated at an unknown pivot index `k` (`1 <= k < nums.length`).\n\nGiven the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must achieve `O(log n)` runtime complexity.",
        "inputFormat": "A rotated sorted list `nums` and an integer `target`.",
        "outputFormat": "Return an integer representing index of target or -1.",
        "constraints": [
            "1 <= nums.length <= 5000",
            "-10^4 <= nums[i] <= 10^4",
            "All values of nums are unique."
        ],
        "functionName": "search",
        "starterCode": "def search(nums: list[int], target: int) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[4, 5, 6, 7, 0, 1, 2], 0],
                "expected": 4,
                "explanation": "0 is found at index 4."
            },
            {
                "input": [[4, 5, 6, 7, 0, 1, 2], 3],
                "expected": -1,
                "explanation": "3 is not in nums."
            },
            {
                "input": [[1], 0],
                "expected": -1,
                "explanation": "0 is not in nums."
            }
        ],
        "hiddenTestCases": [
            {"input": [[1, 3], 3], "expected": 1},
            {"input": [[3, 1], 1], "expected": 1},
            {"input": [[5, 1, 3], 5], "expected": 0},
            {"input": [[4, 5, 6, 7, 8, 1, 2, 3], 8], "expected": 4}
        ],
        "solutionCode": "def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[l] <= nums[mid]:\n            if nums[l] <= target < nums[mid]:\n                r = mid - 1\n            else:\n                l = mid + 1\n        else:\n            if nums[mid] < target <= nums[r]:\n                l = mid + 1\n            else:\n                r = mid - 1\n    return -1"
    },
    {
        "id": "merge-intervals",
        "title": "Merge Intervals",
        "category": "Sorting and Searching",
        "difficulty": "Medium",
        "description": "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "inputFormat": "A list of pairs `intervals`.",
        "outputFormat": "Return a merged list of pairs.",
        "constraints": [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= start_i <= end_i <= 10^4"
        ],
        "functionName": "merge",
        "starterCode": "def merge(intervals: list[list[int]]) -> list[list[int]]:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[[1, 3], [2, 6], [8, 10], [15, 18]]],
                "expected": [[1, 6], [8, 10], [15, 18]],
                "explanation": "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
            },
            {
                "input": [[[1, 4], [4, 5]]],
                "expected": [[1, 5]],
                "explanation": "Intervals [1,4] and [4,5] are considered overlapping."
            }
        ],
        "hiddenTestCases": [
            {"input": [[[1, 4], [0, 4]]], "expected": [[0, 4]]},
            {"input": [[[1, 4], [2, 3]]], "expected": [[1, 4]]},
            {"input": [[[1, 4], [0, 0]]], "expected": [[0, 0], [1, 4]]},
            {"input": [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], "expected": [[1, 10]]}
        ],
        "solutionCode": "def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for interval in intervals:\n        if not merged or merged[-1][1] < interval[0]:\n            merged.append(interval)\n        else:\n            merged[-1][1] = max(merged[-1][1], interval[1])\n    return merged"
    },
    {
        "id": "find-the-median-of-two-sorted-arrays",
        "title": "Find the Median of Two Sorted Arrays",
        "category": "Sorting and Searching",
        "difficulty": "Hard",
        "description": "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return **the median** of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.",
        "inputFormat": "Two sorted lists of integers `nums1` and `nums2`.",
        "outputFormat": "Return a float or integer representing the median.",
        "constraints": [
            "nums1.length == m",
            "nums2.length == n",
            "0 <= m <= 1000",
            "0 <= n <= 1000",
            "1 <= m + n <= 2000"
        ],
        "functionName": "findMedianSortedArrays",
        "starterCode": "def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[1, 3], [2]],
                "expected": 2.0,
                "explanation": "merged array = [1,2,3] and median is 2."
            },
            {
                "input": [[1, 2], [3, 4]],
                "expected": 2.5,
                "explanation": "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
            }
        ],
        "hiddenTestCases": [
            {"input": [[0, 0], [0, 0]], "expected": 0.0},
            {"input": [[], [1]], "expected": 1.0},
            {"input": [[2], []], "expected": 2.0},
            {"input": [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]], "expected": 5.5}
        ],
        "solutionCode": "def findMedianSortedArrays(nums1, nums2):\n    A, B = nums1, nums2\n    total = len(nums1) + len(nums2)\n    half = total // 2\n    if len(B) < len(A):\n        A, B = B, A\n    l, r = 0, len(A) - 1\n    while True:\n        i = (l + r) // 2\n        j = half - i - 2\n        Aleft = A[i] if i >= 0 else float('-infinity')\n        Aright = A[i + 1] if (i + 1) < len(A) else float('infinity')\n        Bleft = B[j] if j >= 0 else float('-infinity')\n        Bright = B[j + 1] if (j + 1) < len(B) else float('infinity')\n        if Aleft <= Bright and Bleft <= Aright:\n            if total % 2:\n                return float(min(Aright, Bright))\n            return (max(Aleft, Bleft) + min(Aright, Bright)) / 2.0\n        elif Aleft > Bright:\n            r = i - 1\n        else:\n            l = i + 1"
    },

    # ==========================================
    # Dynamic Programming (11 - 15)
    # ==========================================
    {
        "id": "0-1-knapsack",
        "title": "0/1 Knapsack",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given weights and values of `n` items, put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack. You cannot break an item, either pick the complete item or don't pick it (0-1 property).",
        "inputFormat": "Capacity integer `W`, list of integers `weights`, list of integers `values`.",
        "outputFormat": "Return an integer representing maximum achievable value.",
        "constraints": [
            "1 <= W <= 1000",
            "1 <= n <= 1000",
            "1 <= weights[i], values[i] <= 1000"
        ],
        "functionName": "knapsack",
        "starterCode": "def knapsack(W: int, weights: list[int], values: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [4, [4, 5, 1], [1, 2, 3]],
                "expected": 3,
                "explanation": "Take item 3 of weight 1 and value 3."
            },
            {
                "input": [3, [4, 5, 6], [1, 2, 3]],
                "expected": 0,
                "explanation": "No item fits into the bag."
            },
            {
                "input": [50, [10, 20, 30], [60, 100, 120]],
                "expected": 220,
                "explanation": "Take items with weight 20 and 30 for max value 100 + 120 = 220."
            }
        ],
        "hiddenTestCases": [
            {"input": [10, [5, 4, 6, 3], [10, 40, 30, 50]], "expected": 90},
            {"input": [1, [1], [10]], "expected": 10},
            {"input": [25, [12, 7, 11, 8, 9], [24, 13, 23, 15, 16]], "expected": 52}
        ],
        "solutionCode": "def knapsack(W, weights, values):\n    dp = [0] * (W + 1)\n    for w, v in zip(weights, values):\n        for j in range(W, w - 1, -1):\n            dp[j] = max(dp[j], dp[j - w] + v)\n    return dp[W]"
    },
    {
        "id": "longest-common-subsequence",
        "title": "Longest Common Subsequence",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return `0`.\n\nA **subsequence** of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.",
        "inputFormat": "Two strings `text1` and `text2`.",
        "outputFormat": "Return an integer representing length of LCS.",
        "constraints": [
            "1 <= text1.length, text2.length <= 1000",
            "text1 and text2 consist of only lowercase English characters."
        ],
        "functionName": "longestCommonSubsequence",
        "starterCode": "def longestCommonSubsequence(text1: str, text2: str) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": ["abcde", "ace"],
                "expected": 3,
                "explanation": "The longest common subsequence is 'ace' and its length is 3."
            },
            {
                "input": ["abc", "abc"],
                "expected": 3,
                "explanation": "The longest common subsequence is 'abc' and its length is 3."
            },
            {
                "input": ["abc", "def"],
                "expected": 0,
                "explanation": "There is no such common subsequence, so the result is 0."
            }
        ],
        "hiddenTestCases": [
            {"input": ["bsbininm", "jmjkbkjkv"], "expected": 1},
            {"input": ["oxcpqrsvwf", "shmtulqpyw"], "expected": 2},
            {"input": ["aggtab", "gxtxamb"], "expected": 4}
        ],
        "solutionCode": "def longestCommonSubsequence(text1, text2):\n    m, n = len(text1), len(text2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if text1[i - 1] == text2[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[m][n]"
    },
    {
        "id": "longest-increasing-subsequence",
        "title": "Longest Increasing Subsequence",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.\n\nA **subsequence** is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements.",
        "inputFormat": "A list of integers `nums`.",
        "outputFormat": "Return an integer representing length of LIS.",
        "constraints": [
            "1 <= nums.length <= 2500",
            "-10^4 <= nums[i] <= 10^4"
        ],
        "functionName": "lengthOfLIS",
        "starterCode": "def lengthOfLIS(nums: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[10, 9, 2, 5, 3, 7, 101, 18]],
                "expected": 4,
                "explanation": "The longest increasing subsequence is [2, 3, 7, 101], therefore the length is 4."
            },
            {
                "input": [[0, 1, 0, 3, 2, 3]],
                "expected": 4,
                "explanation": "The longest increasing subsequence is [0, 1, 2, 3]."
            },
            {
                "input": [[7, 7, 7, 7, 7, 7, 7]],
                "expected": 1,
                "explanation": "All elements are equal, max strictly increasing length is 1."
            }
        ],
        "hiddenTestCases": [
            {"input": [[4, 10, 4, 3, 8, 9]], "expected": 3},
            {"input": [[1, 3, 6, 7, 9, 4, 10, 5, 6]], "expected": 6},
            {"input": [[3, 5, 6, 2, 5, 4, 19, 5, 6, 7, 12]], "expected": 6}
        ],
        "solutionCode": "import bisect\ndef lengthOfLIS(nums):\n    sub = []\n    for x in nums:\n        i = bisect.bisect_left(sub, x)\n        if i == len(sub):\n            sub.append(x)\n        else:\n            sub[i] = x\n    return len(sub)"
    },
    {
        "id": "coin-change",
        "title": "Coin Change",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n\nYou may assume that you have an infinite number of each kind of coin.",
        "inputFormat": "A list of integers `coins` and an integer `amount`.",
        "outputFormat": "Return an integer representing minimum coin count.",
        "constraints": [
            "1 <= coins.length <= 12",
            "1 <= coins[i] <= 2^31 - 1",
            "0 <= amount <= 10^4"
        ],
        "functionName": "coinChange",
        "starterCode": "def coinChange(coins: list[int], amount: int) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[1, 2, 5], 11],
                "expected": 3,
                "explanation": "11 = 5 + 5 + 1 (3 coins)."
            },
            {
                "input": [[2], 3],
                "expected": -1,
                "explanation": "Amount 3 cannot be formed using coins of denomination 2."
            },
            {
                "input": [[1], 0],
                "expected": 0,
                "explanation": "Amount 0 requires 0 coins."
            }
        ],
        "hiddenTestCases": [
            {"input": [[186, 419, 83, 408], 6249], "expected": 20},
            {"input": [[2, 5, 10, 1], 27], "expected": 4},
            {"input": [[2], 1], "expected": -1}
        ],
        "solutionCode": "def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for a in range(c, amount + 1):\n            dp[a] = min(dp[a], dp[a - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1"
    },
    {
        "id": "edit-distance",
        "title": "Edit Distance",
        "category": "Dynamic Programming",
        "difficulty": "Hard",
        "description": "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character",
        "inputFormat": "Two strings `word1` and `word2`.",
        "outputFormat": "Return an integer representing edit distance.",
        "constraints": [
            "0 <= word1.length, word2.length <= 500",
            "word1 and word2 consist of lowercase English letters."
        ],
        "functionName": "minDistance",
        "starterCode": "def minDistance(word1: str, word2: str) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": ["horse", "ros"],
                "expected": 3,
                "explanation": "horse -> rorse (replace 'h' with 'r') -> rose (remove 'r') -> ros (remove 'e')."
            },
            {
                "input": ["intention", "execution"],
                "expected": 5,
                "explanation": "intention -> inention -> enention -> exention -> exection -> execution."
            }
        ],
        "hiddenTestCases": [
            {"input": ["", ""], "expected": 0},
            {"input": ["a", "b"], "expected": 1},
            {"input": ["zoologico", "zoologia"], "expected": 2},
            {"input": ["dinitrophenylhydrazine", "acetylphenylhydrazine"], "expected": 6}
        ],
        "solutionCode": "def minDistance(word1, word2):\n    m, n = len(word1), len(word2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m + 1):\n        dp[i][0] = i\n    for j in range(n + 1):\n        dp[0][j] = j\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if word1[i - 1] == word2[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1]\n            else:\n                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\n    return dp[m][n]"
    },

    # ==========================================
    # Trees and Graphs (16 - 20)
    # ==========================================
    {
        "id": "binary-tree-level-order-traversal",
        "title": "Binary Tree Level Order Traversal",
        "category": "Trees and Graphs",
        "difficulty": "Medium",
        "description": "Given the `root` of a binary tree represented as a list in level-order (where `None` denotes null children), return *the level order traversal of its nodes' values* (i.e., from left to right, level by level).",
        "inputFormat": "A list `tree` representing nodes in level order.",
        "outputFormat": "Return a list of lists of integers `[[level0], [level1], ...]`.",
        "constraints": [
            "The number of nodes in the tree is in the range [0, 2000].",
            "-1000 <= Node.val <= 1000"
        ],
        "functionName": "levelOrder",
        "starterCode": "def levelOrder(tree: list) -> list[list[int]]:\n    # tree is given as a level-order array with None for missing children\n    # e.g., [3, 9, 20, None, None, 15, 7]\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[3, 9, 20, None, None, 15, 7]],
                "expected": [[3], [9, 20], [15, 7]],
                "explanation": "Level 0: [3], Level 1: [9, 20], Level 2: [15, 7]."
            },
            {
                "input": [[1]],
                "expected": [[1]],
                "explanation": "Single root node."
            },
            {
                "input": [[]],
                "expected": [],
                "explanation": "Empty tree returns empty list."
            }
        ],
        "hiddenTestCases": [
            {"input": [[1, 2, None, 3, None, 4]], "expected": [[1], [2], [3], [4]]},
            {"input": [[1, 2, 3, 4, 5]], "expected": [[1], [2, 3], [4, 5]]},
            {"input": [[1, None, 2, None, 3]], "expected": [[1], [2], [3]]}
        ],
        "solutionCode": "from collections import deque\ndef levelOrder(tree):\n    if not tree or tree[0] is None:\n        return []\n    res = []\n    queue = deque([0])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            idx = queue.popleft()\n            if idx < len(tree) and tree[idx] is not None:\n                level.append(tree[idx])\n                l = 2 * idx + 1\n                r = 2 * idx + 2\n                if l < len(tree) and tree[l] is not None:\n                    queue.append(l)\n                if r < len(tree) and tree[r] is not None:\n                    queue.append(r)\n        if level:\n            res.append(level)\n    return res"
    },
    {
        "id": "maximum-depth-of-binary-tree",
        "title": "Maximum Depth of Binary Tree",
        "category": "Trees and Graphs",
        "difficulty": "Easy",
        "description": "Given the `root` of a binary tree represented as an array in level order, return *its maximum depth*.\n\nA binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        "inputFormat": "A list `tree` representing nodes in level-order.",
        "outputFormat": "Return an integer representing maximum depth.",
        "constraints": [
            "The number of nodes in the tree is in the range [0, 10^4].",
            "-100 <= Node.val <= 100"
        ],
        "functionName": "maxDepth",
        "starterCode": "def maxDepth(tree: list) -> int:\n    # tree is given as a list with None for missing nodes\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[3, 9, 20, None, None, 15, 7]],
                "expected": 3,
                "explanation": "The maximum path is 3 -> 20 -> 7, which has depth 3."
            },
            {
                "input": [[1, None, 2]],
                "expected": 2,
                "explanation": "Root 1 has a right child 2, depth is 2."
            }
        ],
        "hiddenTestCases": [
            {"input": [[]], "expected": 0},
            {"input": [[0]], "expected": 1},
            {"input": [[1, 2, 3, 4, 5]], "expected": 3},
            {"input": [[1, 2, None, 4, None, None, None, 8]], "expected": 4}
        ],
        "solutionCode": "def maxDepth(tree):\n    if not tree or tree[0] is None:\n        return 0\n    def getDepth(idx):\n        if idx >= len(tree) or tree[idx] is None:\n            return 0\n        return 1 + max(getDepth(2 * idx + 1), getDepth(2 * idx + 2))\n    return getDepth(0)"
    },
    {
        "id": "lowest-common-ancestor",
        "title": "Lowest Common Ancestor",
        "category": "Trees and Graphs",
        "difficulty": "Medium",
        "description": "Given a binary tree representation and two node values `p` and `q`, find the lowest common ancestor (LCA) node value of the two given nodes in the tree.\n\nAccording to the definition of LCA: 'The lowest common ancestor is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants (where we allow **a node to be a descendant of itself**).'",
        "inputFormat": "A list `tree`, an integer `p`, and an integer `q`.",
        "outputFormat": "Return the integer value of the lowest common ancestor node.",
        "constraints": [
            "The number of nodes in the tree is in the range [2, 10^5].",
            "-10^9 <= Node.val <= 10^9",
            "All Node.val are unique.",
            "p != q",
            "p and q will exist in the tree."
        ],
        "functionName": "lowestCommonAncestor",
        "starterCode": "def lowestCommonAncestor(tree: list, p: int, q: int) -> int:\n    # tree is given as a list with None for missing children\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 5, 1],
                "expected": 3,
                "explanation": "The LCA of nodes 5 and 1 is 3."
            },
            {
                "input": [[3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 5, 4],
                "expected": 5,
                "explanation": "The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself."
            }
        ],
        "hiddenTestCases": [
            {"input": [[1, 2], 1, 2], "expected": 1},
            {"input": [[1, 2, 3], 2, 3], "expected": 1},
            {"input": [[6, 2, 8, 0, 4, 7, 9], 2, 4], "expected": 2}
        ],
        "solutionCode": "def lowestCommonAncestor(tree, p, q):\n    def dfs(idx):\n        if idx >= len(tree) or tree[idx] is None:\n            return None\n        val = tree[idx]\n        if val == p or val == q:\n            return val\n        left = dfs(2 * idx + 1)\n        right = dfs(2 * idx + 2)\n        if left is not None and right is not None:\n            return val\n        return left if left is not None else right\n    return dfs(0)"
    },
    {
        "id": "number-of-islands",
        "title": "Number of Islands",
        "category": "Trees and Graphs",
        "difficulty": "Medium",
        "description": "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return *the number of islands*.\n\nAn **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
        "inputFormat": "A 2D list of strings `grid` where each cell is '1' or '0'.",
        "outputFormat": "Return an integer representing the number of islands.",
        "constraints": [
            "m == grid.length",
            "n == grid[i].length",
            "1 <= m, n <= 300",
            "grid[i][j] is '0' or '1'."
        ],
        "functionName": "numIslands",
        "starterCode": "def numIslands(grid: list[list[str]]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[
                    ["1","1","1","1","0"],
                    ["1","1","0","1","0"],
                    ["1","1","0","0","0"],
                    ["0","0","0","0","0"]
                ]],
                "expected": 1,
                "explanation": "All 1s form a single connected island."
            },
            {
                "input": [[
                    ["1","1","0","0","0"],
                    ["1","1","0","0","0"],
                    ["0","0","1","0","0"],
                    ["0","0","0","1","1"]
                ]],
                "expected": 3,
                "explanation": "There are 3 separate islands."
            }
        ],
        "hiddenTestCases": [
            {"input": [[["1"]]], "expected": 1},
            {"input": [[["0"]]], "expected": 0},
            {"input": [[["1","0","1"],["0","1","0"],["1","0","1"]]], "expected": 5},
            {"input": [[["1","1","1"],["0","1","0"],["1","1","1"]]], "expected": 1}
        ],
        "solutionCode": "def numIslands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':\n            return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                dfs(r, c)\n                count += 1\n    return count"
    },
    {
        "id": "detect-cycle-in-graph",
        "title": "Detect Cycle in a Graph",
        "category": "Trees and Graphs",
        "difficulty": "Medium",
        "description": "Given a directed graph with `numNodes` nodes labeled `0` to `numNodes - 1` and a list of directed `edges` `[u, v]`, return `True` if the graph contains a cycle, or `False` otherwise.",
        "inputFormat": "An integer `numNodes` and a list of edges `edges` where each edge is `[u, v]`.",
        "outputFormat": "Return a boolean `True` or `False`.",
        "constraints": [
            "1 <= numNodes <= 2000",
            "0 <= edges.length <= 5000",
            "0 <= u, v < numNodes"
        ],
        "functionName": "hasCycle",
        "starterCode": "def hasCycle(numNodes: int, edges: list[list[int]]) -> bool:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [4, [[0, 1], [1, 2], [2, 3], [3, 1]]],
                "expected": True,
                "explanation": "Nodes 1 -> 2 -> 3 -> 1 form a cycle."
            },
            {
                "input": [4, [[0, 1], [1, 2], [2, 3]]],
                "expected": False,
                "explanation": "The graph is a linear chain with no cycles."
            }
        ],
        "hiddenTestCases": [
            {"input": [2, [[0, 1], [1, 0]]], "expected": True},
            {"input": [3, [[0, 1], [0, 2]]], "expected": False},
            {"input": [1, []], "expected": False},
            {"input": [4, [[0, 1], [2, 3], [1, 2], [3, 0]]], "expected": True}
        ],
        "solutionCode": "def hasCycle(numNodes, edges):\n    adj = {i: [] for i in range(numNodes)}\n    for u, v in edges:\n        adj[u].append(v)\n    visited = [0] * numNodes # 0: unvisited, 1: visiting, 2: visited\n    def dfs(node):\n        if visited[node] == 1: return True\n        if visited[node] == 2: return False\n        visited[node] = 1\n        for nei in adj[node]:\n            if dfs(nei): return True\n        visited[node] = 2\n        return False\n    for i in range(numNodes):\n        if visited[i] == 0:\n            if dfs(i): return True\n    return False"
    },

    # ==========================================
    # Greedy and Other Algorithms (21 - 25)
    # ==========================================
    {
        "id": "activity-selection",
        "title": "Activity Selection",
        "category": "Greedy and Other Algorithms",
        "difficulty": "Easy",
        "description": "Given `n` activities with their start and finish times in two arrays `start` and `finish`, select the maximum number of activities that can be performed by a single person, assuming that a person can only work on a single activity at a time.",
        "inputFormat": "Two lists of integers `start` and `finish`.",
        "outputFormat": "Return an integer representing maximum number of non-overlapping activities.",
        "constraints": [
            "1 <= start.length == finish.length <= 10^5",
            "0 <= start[i] <= finish[i] <= 10^9"
        ],
        "functionName": "maxActivities",
        "starterCode": "def maxActivities(start: list[int], finish: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[1, 3, 0, 5, 8, 5], [2, 4, 6, 7, 9, 9]],
                "expected": 4,
                "explanation": "A person can pick activities: (1, 2), (3, 4), (5, 7), and (8, 9)."
            },
            {
                "input": [[1, 2, 3], [4, 5, 6]],
                "expected": 1,
                "explanation": "All activities conflict except executing just one."
            }
        ],
        "hiddenTestCases": [
            {"input": [[10, 12, 20], [20, 25, 30]], "expected": 2},
            {"input": [[1], [2]], "expected": 1},
            {"input": [[1, 2, 4], [3, 5, 6]], "expected": 2}
        ],
        "solutionCode": "def maxActivities(start, finish):\n    activities = sorted(zip(start, finish), key=lambda x: x[1])\n    count = 0\n    last_finish = -1\n    for s, f in activities:\n        if s >= last_finish:\n            count += 1\n            last_finish = f\n    return count"
    },
    {
        "id": "job-sequencing",
        "title": "Job Sequencing",
        "category": "Greedy and Other Algorithms",
        "difficulty": "Medium",
        "description": "Given a set of `n` jobs where each job `i` has a deadline and profit associated with it. Each job takes 1 unit of time to complete and only one job can be scheduled at a time. We earn the profit if and only if the job is completed by its deadline.\n\nFind the maximum profit you can earn and total number of jobs completed.",
        "inputFormat": "A list of jobs `[[jobId, deadline, profit], ...]`. ",
        "outputFormat": "Return a list `[jobsCompleted, maxProfit]`.",
        "constraints": [
            "1 <= n <= 10^5",
            "1 <= deadline <= 100",
            "1 <= profit <= 500"
        ],
        "functionName": "jobScheduling",
        "starterCode": "def jobScheduling(jobs: list[list[int]]) -> list[int]:\n    # jobs = [[jobId, deadline, profit], ...]\n    # Return [jobsCompleted, totalProfit]\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[[1, 4, 20], [2, 1, 10], [3, 1, 40], [4, 1, 30]]],
                "expected": [2, 60],
                "explanation": "Schedule job 3 at t=1 (profit 40) and job 1 at t=2 (profit 20), total profit = 60 with 2 jobs."
            },
            {
                "input": [[[1, 2, 100], [2, 1, 19], [3, 2, 27], [4, 1, 25], [5, 3, 15]]],
                "expected": [3, 142],
                "explanation": "Schedule jobs 1, 3, and 5 for profit 100 + 27 + 15 = 142."
            }
        ],
        "hiddenTestCases": [
            {"input": [[[1, 1, 50]]], "expected": [1, 50]},
            {"input": [[[1, 2, 50], [2, 2, 60], [3, 3, 20], [4, 3, 30]]], "expected": [3, 140]}
        ],
        "solutionCode": "def jobScheduling(jobs):\n    jobs.sort(key=lambda x: x[2], reverse=True)\n    max_d = max(j[1] for j in jobs) if jobs else 0\n    slots = [-1] * (max_d + 1)\n    count = 0\n    total_profit = 0\n    for j_id, d, p in jobs:\n        for slot in range(d, 0, -1):\n            if slots[slot] == -1:\n                slots[slot] = j_id\n                count += 1\n                total_profit += p\n                break\n    return [count, total_profit]"
    },
    {
        "id": "minimum-platforms",
        "title": "Minimum Platforms",
        "category": "Greedy and Other Algorithms",
        "difficulty": "Medium",
        "description": "Given arrival and departure times of all trains that reach a railway station, find the minimum number of platforms required for the railway station so that no train is kept waiting.\n\nConsider that all trains arrive and depart on the same day.",
        "inputFormat": "Two lists of integers `arr` and `dep` representing arrival and departure times in military format (e.g. 900 for 9:00).",
        "outputFormat": "Return an integer representing minimum platforms needed.",
        "constraints": [
            "1 <= arr.length == dep.length <= 50000",
            "0000 <= arr[i] <= dep[i] <= 2359"
        ],
        "functionName": "findPlatform",
        "starterCode": "def findPlatform(arr: list[int], dep: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]],
                "expected": 3,
                "explanation": "Between 11:00 and 11:20, 3 trains are simultaneously at the station."
            },
            {
                "input": [[900, 1100, 1235], [1000, 1200, 1240]],
                "expected": 1,
                "explanation": "No intervals overlap, 1 platform is sufficient."
            }
        ],
        "hiddenTestCases": [
            {"input": [[900, 900, 900], [1000, 1000, 1000]], "expected": 3},
            {"input": [[100], [200]], "expected": 1},
            {"input": [[50, 100, 150], [120, 140, 200]], "expected": 2}
        ],
        "solutionCode": "def findPlatform(arr, dep):\n    arr.sort()\n    dep.sort()\n    n = len(arr)\n    plat_needed = 1\n    result = 1\n    i = 1\n    j = 0\n    while i < n and j < n:\n        if arr[i] <= dep[j]:\n            plat_needed += 1\n            i += 1\n        else:\n            plat_needed -= 1\n            j += 1\n        result = max(result, plat_needed)\n    return result"
    },
    {
        "id": "dijkstras-shortest-path",
        "title": "Dijkstra's Shortest Path",
        "category": "Greedy and Other Algorithms",
        "difficulty": "Medium",
        "description": "Given a weighted directed graph with `n` nodes labeled `0` to `n - 1`, a list of directed edges `edges = [[u, v, w], ...]`, and a source node `src`, compute the shortest distance from `src` to all other nodes.\n\nIf a node is unreachable from `src`, its distance should be `-1`.",
        "inputFormat": "Number of nodes `n`, list of weighted edges `edges`, source node `src`.",
        "outputFormat": "Return a list of `n` integers representing shortest distances from `src`.",
        "constraints": [
            "1 <= n <= 1000",
            "0 <= edges.length <= 10000",
            "0 <= u, v < n",
            "1 <= w <= 10^4",
            "0 <= src < n"
        ],
        "functionName": "dijkstra",
        "starterCode": "def dijkstra(n: int, edges: list[list[int]], src: int) -> list[int]:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [4, [[0, 1, 24], [0, 3, 20], [0, 2, 3], [2, 3, 12]], 0],
                "expected": [0, 24, 3, 15],
                "explanation": "Shortest distance from 0: to 0 is 0, to 1 is 24, to 2 is 3, to 3 is 0->2->3 = 3+12=15."
            },
            {
                "input": [3, [[0, 1, 5]], 0],
                "expected": [0, 5, -1],
                "explanation": "Node 2 is unreachable, so distance is -1."
            }
        ],
        "hiddenTestCases": [
            {"input": [1, [], 0], "expected": [0]},
            {"input": [3, [[0, 1, 4], [1, 2, 2], [0, 2, 8]], 0], "expected": [0, 4, 6]},
            {"input": [5, [[0, 1, 9], [0, 2, 6], [0, 3, 5], [0, 4, 3], [2, 1, 2], [2, 3, 4]], 0], "expected": [0, 8, 6, 5, 3]}
        ],
        "solutionCode": "import heapq\ndef dijkstra(n, edges, src):\n    adj = {i: [] for i in range(n)}\n    for u, v, w in edges:\n        adj[u].append((v, w))\n    dist = [-1] * n\n    dist[src] = 0\n    pq = [(0, src)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in adj[u]:\n            if dist[v] == -1 or d + w < dist[v]:\n                dist[v] = d + w\n                heapq.heappush(pq, (dist[v], v))\n    return dist"
    },
    {
        "id": "prims-minimum-spanning-tree",
        "title": "Prim's Minimum Spanning Tree",
        "category": "Greedy and Other Algorithms",
        "difficulty": "Hard",
        "description": "Given a weighted, undirected, and connected graph of `n` vertices labeled `0` to `n - 1` and a list of edges `edges = [[u, v, w], ...]`, calculate the sum of the weights of the edges in the Minimum Spanning Tree (MST) of the graph.",
        "inputFormat": "Number of vertices `n` and undirected weighted edges `edges`.",
        "outputFormat": "Return an integer representing total weight of the MST.",
        "constraints": [
            "2 <= n <= 1000",
            "n - 1 <= edges.length <= 10000",
            "1 <= w <= 10^4"
        ],
        "functionName": "spanningTree",
        "starterCode": "def spanningTree(n: int, edges: list[list[int]]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [3, [[0, 1, 5], [1, 2, 3], [0, 2, 1]]],
                "expected": 4,
                "explanation": "Edges (0, 2) of weight 1 and (1, 2) of weight 3 connect all nodes with total weight 4."
            },
            {
                "input": [2, [[0, 1, 5]]],
                "expected": 5,
                "explanation": "The only edge weight is 5."
            }
        ],
        "hiddenTestCases": [
            {"input": [4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 4], [0, 2, 5]]], "expected": 6},
            {"input": [3, [[0, 1, 2], [1, 2, 2], [0, 2, 2]]], "expected": 4}
        ],
        "solutionCode": "import heapq\ndef spanningTree(n, edges):\n    adj = {i: [] for i in range(n)}\n    for u, v, w in edges:\n        adj[u].append((v, w))\n        adj[v].append((u, w))\n    visited = [False] * n\n    pq = [(0, 0)]\n    mst_weight = 0\n    nodes_visited = 0\n    while pq and nodes_visited < n:\n        w, u = heapq.heappop(pq)\n        if visited[u]: continue\n        visited[u] = True\n        mst_weight += w\n        nodes_visited += 1\n        for v, weight in adj[u]:\n            if not visited[v]:\n                heapq.heappush(pq, (weight, v))\n    return mst_weight"
    },

    # ==========================================
    # Stacks, Queues and Strings (26 - 30)
    # ==========================================
    {
        "id": "next-greater-element",
        "title": "Next Greater Element",
        "category": "Stacks, Queues and Strings",
        "difficulty": "Easy",
        "description": "The **next greater element** of some element `x` in an array is the **first greater** element that is to the right of `x` in the same array.\n\nYou are given two distinct integer arrays `nums1` and `nums2`, where `nums1` is a subset of `nums2`.\n\nFor each `0 <= i < nums1.length`, find the index `j` such that `nums1[i] == nums2[j]` and determine the next greater element of `nums2[j]` in `nums2`. If there is no next greater element, then the answer for this query is `-1`.\n\nReturn an array `ans` of length `nums1.length` such that `ans[i]` is the next greater element.",
        "inputFormat": "Two lists of integers `nums1` and `nums2`.",
        "outputFormat": "Return a list of integers of length `nums1.length`.",
        "constraints": [
            "1 <= nums1.length <= nums2.length <= 1000",
            "0 <= nums1[i], nums2[i] <= 10^4",
            "All integers in nums1 and nums2 are unique.",
            "All elements in nums1 appear in nums2."
        ],
        "functionName": "nextGreaterElement",
        "starterCode": "def nextGreaterElement(nums1: list[int], nums2: list[int]) -> list[int]:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[4, 1, 2], [1, 3, 4, 2]],
                "expected": [-1, 3, -1],
                "explanation": "For 4, no greater element to right (-1). For 1, next greater is 3. For 2, no greater to right (-1)."
            },
            {
                "input": [[2, 4], [1, 2, 3, 4]],
                "expected": [3, -1],
                "explanation": "For 2, next greater is 3. For 4, no greater element to right (-1)."
            }
        ],
        "hiddenTestCases": [
            {"input": [[1, 3, 5, 2, 4], [6, 5, 4, 3, 2, 1, 7]], "expected": [7, 7, 7, 7, 7]},
            {"input": [[1], [1]], "expected": [-1]},
            {"input": [[4, 2], [2, 4, 3]], "expected": [-1, 4]}
        ],
        "solutionCode": "def nextGreaterElement(nums1, nums2):\n    stack = []\n    nge = {}\n    for n in nums2:\n        while stack and stack[-1] < n:\n            nge[stack.pop()] = n\n        stack.append(n)\n    return [nge.get(x, -1) for x in nums1]"
    },
    {
        "id": "valid-parentheses",
        "title": "Valid Parentheses",
        "category": "Stacks, Queues and Strings",
        "difficulty": "Easy",
        "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        "inputFormat": "A string `s`.",
        "outputFormat": "Return boolean `True` or `False`.",
        "constraints": [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        "functionName": "isValid",
        "starterCode": "def isValid(s: str) -> bool:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": ["()"],
                "expected": True,
                "explanation": "Properly opened and closed."
            },
            {
                "input": ["()[]{}"],
                "expected": True,
                "explanation": "All types are properly matched in order."
            },
            {
                "input": ["(]"],
                "expected": False,
                "explanation": "Mismatched closing bracket."
            }
        ],
        "hiddenTestCases": [
            {"input": ["([)]"], "expected": False},
            {"input": ["{[]}"], "expected": True},
            {"input": ["["] , "expected": False},
            {"input": ["]"], "expected": False},
            {"input": ["{()[{}]}"] , "expected": True}
        ],
        "solutionCode": "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top_elem = stack.pop() if stack else '#'\n            if mapping[char] != top_elem:\n                return False\n        else:\n            stack.append(char)\n    return not stack"
    },
    {
        "id": "longest-substring-without-repeating-characters",
        "title": "Longest Substring Without Repeating Characters",
        "category": "Stacks, Queues and Strings",
        "difficulty": "Medium",
        "description": "Given a string `s`, find the length of the **longest substring** without repeating characters.",
        "inputFormat": "A string `s`.",
        "outputFormat": "Return an integer representing length of longest substring.",
        "constraints": [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        "functionName": "lengthOfLongestSubstring",
        "starterCode": "def lengthOfLongestSubstring(s: str) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": ["abcabcbb"],
                "expected": 3,
                "explanation": "The answer is 'abc', with the length of 3."
            },
            {
                "input": ["bbbbb"],
                "expected": 1,
                "explanation": "The answer is 'b', with the length of 1."
            },
            {
                "input": ["pwwkew"],
                "expected": 3,
                "explanation": "The answer is 'wke', with length 3. Notice that 'pwke' is a subsequence and not a substring."
            }
        ],
        "hiddenTestCases": [
            {"input": [""], "expected": 0},
            {"input": [" "], "expected": 1},
            {"input": ["au"], "expected": 2},
            {"input": ["dvdf"], "expected": 3},
            {"input": ["tmmzuxt"], "expected": 5}
        ],
        "solutionCode": "def lengthOfLongestSubstring(s):\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, c in enumerate(s):\n        if c in char_map and char_map[c] >= left:\n            left = char_map[c] + 1\n        char_map[c] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len"
    },
    {
        "id": "trapping-rain-water",
        "title": "Trapping Rain Water",
        "category": "Stacks, Queues and Strings",
        "difficulty": "Hard",
        "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
        "inputFormat": "A list of non-negative integers `height`.",
        "outputFormat": "Return an integer representing units of trapped rain water.",
        "constraints": [
            "n == height.length",
            "1 <= n <= 2 * 10^4",
            "0 <= height[i] <= 10^5"
        ],
        "functionName": "trap",
        "starterCode": "def trap(height: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
                "expected": 6,
                "explanation": "The elevation map traps 6 units of rain water."
            },
            {
                "input": [[4, 2, 0, 3, 2, 5]],
                "expected": 9,
                "explanation": "The elevation map traps 9 units of rain water."
            }
        ],
        "hiddenTestCases": [
            {"input": [[4, 2, 3]], "expected": 1},
            {"input": [[5, 4, 1, 2]], "expected": 1},
            {"input": [[1, 2]], "expected": 0},
            {"input": [[3, 0, 2, 0, 4]], "expected": 7}
        ],
        "solutionCode": "def trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    leftMax, rightMax = height[l], height[r]\n    res = 0\n    while l < r:\n        if leftMax < rightMax:\n            l += 1\n            leftMax = max(leftMax, height[l])\n            res += leftMax - height[l]\n        else:\n            r -= 1\n            rightMax = max(rightMax, height[r])\n            res += rightMax - height[r]\n    return res"
    },
    {
        "id": "largest-rectangle-in-histogram",
        "title": "Largest Rectangle in Histogram",
        "category": "Stacks, Queues and Strings",
        "difficulty": "Hard",
        "description": "Given an array of integers `heights` representing the histogram's bar height where the width of each bar is `1`, return *the area of the largest rectangle in the histogram*.",
        "inputFormat": "A list of non-negative integers `heights`.",
        "outputFormat": "Return an integer representing largest rectangle area.",
        "constraints": [
            "1 <= heights.length <= 10^5",
            "0 <= heights[i] <= 10^4"
        ],
        "functionName": "largestRectangleArea",
        "starterCode": "def largestRectangleArea(heights: list[int]) -> int:\n    # Write your code here\n    pass\n",
        "sampleTestCases": [
            {
                "input": [[2, 1, 5, 6, 2, 3]],
                "expected": 10,
                "explanation": "The largest rectangle is formed between heights 5 and 6, area = min(5,6)*2 = 10."
            },
            {
                "input": [[2, 4]],
                "expected": 4,
                "explanation": "The largest rectangle has area 4."
            }
        ],
        "hiddenTestCases": [
            {"input": [[1]], "expected": 1},
            {"input": [[2, 1, 2]], "expected": 3},
            {"input": [[5, 4, 3, 2, 1]], "expected": 9},
            {"input": [[1, 2, 3, 4, 5]], "expected": 9}
        ],
        "solutionCode": "def largestRectangleArea(heights):\n    stack = []\n    maxArea = 0\n    for i, h in enumerate(heights):\n        start = i\n        while stack and stack[-1][1] > h:\n            index, height = stack.pop()\n            maxArea = max(maxArea, height * (i - index))\n            start = index\n        stack.append((start, h))\n    for i, h in stack:\n        maxArea = max(maxArea, h * (len(heights) - i))\n    return maxArea"
    }
]

out_dir = os.path.dirname(os.path.abspath(__file__))
out_file = os.path.join(out_dir, "problems.json")
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(problems, f, indent=2)

print(f"Successfully generated {len(problems)} algorithmic problems in {out_file}")
