---
title: "Encode and Decode Strings"
description: "A simple explanation of encoding and decoding a list of strings with a Go implementation."
pubDate: "Aug 12 2026"
---

## Problem Summary

Given a list of strings, design an algorithm to encode the list into a single string and decode it back to the original list.

The encoded string may contain any character, so the encoding must preserve the boundaries of each string reliably.

## Key Idea

The key is to prefix each string with its length and a separator.

When encoding, write the length of the string, a `#` separator, and then the string itself.

When decoding, read the length first, then extract exactly that many characters starting after the separator.

This avoids ambiguity even when strings contain digits or separator characters.

## Implementation in Go

```go
import (
    "strconv"
    "strings"
)

type Solution struct{}

func (s *Solution) Encode(strs []string) string {
    var result strings.Builder

    for _, str := range strs {
        result.WriteString(strconv.Itoa(len(str)))
        result.WriteByte('#')
        result.WriteString(str)
    }

    return result.String()
}

func (s *Solution) Decode(encoded string) []string {
    var result []string

    for i := 0; i < len(encoded); {
        j := i

        for encoded[j] != '#' {
            j++
        }

        length, _ := strconv.Atoi(encoded[i:j])
        start := j + 1
        end := start + length

        result = append(result, encoded[start:end])
        i = end
    }

    return result
}
```

## Why this works

By storing each string's length before the content, the decoder knows exactly how many characters belong to the current string.

The separator `#` helps distinguish the length prefix from the payload.

Even if a string contains digits or `#` characters, the decoder still works because it first reads the length and then extracts a fixed number of characters.

## Complexity

- Time: $O(n + m)$
- Space: $O(m)$

Here, $n$ is the number of strings and $m$ is the total number of characters across all strings.

Encoding and decoding both scan the input linearly, and the encoded result uses space proportional to the total characters plus length prefixes.
