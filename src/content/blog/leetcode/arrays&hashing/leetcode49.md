---
title: "Group Anagrams"
description: "A simple explanation of the Group Anagrams problem and a Go-based counting solution."
pubDate: "Aug 09 2026"
---

## Problem Summary

You are given an array of strings `strs`, and you need to group all anagrams together.

Two strings are anagrams if they have the same characters in the same counts, but arranged in a different order.

You can return the answer in any order.

## Key Idea

A fast and clean way to solve this is to create a signature for each string based on how many times each letter appears.

For every word, build a fixed-size array of length 26 that stores the count of each letter from `a` to `z`.

If two strings have the same character counts, they are anagrams and should go into the same group.

We store groups in a map using that count array as the key.

This gives us an average time complexity of $O(n \cdot k)$, where $n$ is the number of strings and $k$ is the average length of a string, with $O(n \cdot k)$ total space for the map and output.

## Implementation in Go

```go
func groupAnagrams(strs []string) [][]string {
	groups := make(map[[26]int][]string)
	result := make([][]string, 0)

	for _, s := range strs {
		var count [26]int
		for _, ch := range s {
			count[ch-'a']++
		}
		groups[count] = append(groups[count], s)
	}

	for _, group := range groups {
		result = append(result, group)
	}

	return result
}
```

## Why this works

Each string is reduced to a count signature such as `[2, 0, 1, ...]`.

If two strings are anagrams, their letter-frequency arrays will be identical, so they map to the same bucket in the hash map.

Since every string is processed once and then added to its matching group, the algorithm correctly groups all anagrams without needing to compare strings pair by pair.

## Complexity

- Time: $O(n \cdot k)$
- Space: $O(n \cdot k)$

Here, $n$ is the number of strings and $k$ is the average length of each string.

Counting characters for each string takes $O(k)$ time, and the total number of stored strings across all groups is $O(n \cdot k)$ in the worst case.
