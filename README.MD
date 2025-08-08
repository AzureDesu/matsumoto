# Matsumoto.js

[![npm](https://img.shields.io/npm/v/@azuredesu/matsumoto.svg)](https://www.npmjs.com/package/@azuredesu/matsumoto)
[![license](https://img.shields.io/npm/l/@azuredesu/matsumoto.svg)](LICENSE)

A talkative little helper for Vue 3, inspired by Matsumoto from *Vivy: Fluorite Eye's Song*.

Just as Matsumoto guides Vivy, this composable guides your Markdown text, transforming it into clean, sanitized HTML with support for spoilers and more. It is completely framework-agnostic and can be styled to fit any project.

## Mission Briefing (Installation)

```bash
npm install @azuredesu/matsumoto
```

## Styling

`Matsumoto.js` generates HTML with generic, semantic class names like `.matsumoto-spoiler`.

For a great default look that works out of the box, you can import the optional stylesheet in your application's entry point (e.g., `main.js`):

```js
// In your main.js or similar entry file
import '@azuredesu/matsumoto/style.css';
```

Alternatively, you can ignore this file and write your own CSS targeting the `.matsumoto-*` classes to match your application's design system perfectly.

## How to Deploy Matsumoto (Usage)

Matsumoto's primary function is the `Markdown` composable. You'll need to give him a container `ref` to attach event listeners for spoiler tags.

### In Your Vue Component

```vue
<script setup>
import { ref } from 'vue';
// Deploy Matsumoto into your component
import { Markdown } from '@azuredesu/matsumoto';

// This ref is the container Matsumoto will operate on
const markdownContainer = ref(null);

const initialContent = `
# Mission Log
This is a paragraph.

Matsumoto says: ~!Don't mess with the timeline!~
`;

// Activate the composable
const { markdown, renderedMarkdown } = Markdown(initialContent, markdownContainer);
</script>

<template>
  <div>
    <textarea v-model="markdown" rows="10" cols="50"></textarea>

    <hr>

    <div ref="markdownContainer" v-html="renderedMarkdown"></div>
  </div>
</template>
```

## API Functions

### `Markdown(initialMarkdown, containerRef)`

* **`initialMarkdown` (String):** The initial markdown string.
* **`containerRef` (Ref):** A Vue `ref` attached to the HTML element that will contain the rendered markdown. This is required for spoiler functionality to work.

**Returns:**
* **`markdown` (Ref<String>):** The raw markdown string.
* **`renderedMarkdown` (Computed<String>):** The sanitized HTML output.
* **`insertSyntax` (Function):** Helper to wrap selected text in a textarea.
* **`rmark` (Ref<HTMLTextAreaElement>):** A ref for the textarea for `insertSyntax` to work.