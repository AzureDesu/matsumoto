# Matsumoto

[![npm](https://img.shields.io/npm/v/@azuredesu/matsumoto.svg)](https://www.npmjs.com/package/@azuredesu/matsumoto)
[![license](https://img.shields.io/npm/l/@azuredesu/matsumoto.svg)](LICENSE)
[![typescript](https://img.shields.io/badge/written%20in-TypeScript-blue.svg)](https://www.typescriptlang.org/)

Your talkative little helper for Vue 3. A collection of tree-shakeable, TypeScript-first composables designed to guide your application's complex tasks into simple, elegant solutions.

Inspired by Matsumoto from *Vivy: Fluorite Eye's Song*.

## Features

-   **Tree-shakeable**: Only import the functions you need, keeping your bundle size small.
-   **TypeScript First**: Written entirely in TypeScript for a better developer experience.
-   **Markdown Parser**: Includes the `useMatso` composable for parsing and sanitizing Markdown.
-   **Custom Syntax**: Supports custom syntax like spoilers (`~!secret!~`) out of the box.
-   **Unstyled by Default**: Provides a separate, optional stylesheet to keep your project lean.

## Installation

```bash
npm install @azuredesu/matsumoto
```

---

## Usage

### 1. `MatsoMarkdown` Composable

This is the core composable for rendering Markdown. Import it into your Vue component and provide a `ref` to the container element where the HTML will be rendered.

```vue
<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { MatsoMarkdown } from '@azuredesu/matsumoto';

// This ref must be attached to the container element
const markdownContainer: Ref<HTMLElement | null> = ref(null);

const initialContent = `
# Mission Log
This is a test to make sure everything works.

- List item 1
- List item 2

Here is a spoiler: ~!It's working!~
`;

// Activate the composable
const { markdown, renderedMarkdown } = MatsoMarkdown(initialContent, markdownContainer);
</script>

<template>
  <div>
    <h2>Raw Markdown Input:</h2>
    <textarea v-model="markdown" rows="10" style="width: 100%;"></textarea>
    
    <hr>
    
    <h2>Rendered HTML Output:</h2>
    <div ref="markdownContainer" v-html="renderedMarkdown"></div>
  </div>
</template>
```

### 2. Styling

`Matsumoto` is unstyled by default. To use the provided default theme, import the stylesheet in your application's entry point (e.g., `main.ts`):

```typescript
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';

// Import Matsumoto's styles
import '@azuredesu/matsumoto/matsumoto.css';

createApp(App).mount('#app');
```

---

## API

### `MatsoMarkdown(initialMarkdown?, containerRef?)`

A composable for parsing and rendering Markdown.

-   **`initialMarkdown`**: `string` (Optional) - The initial markdown string to render.
-   **`containerRef`**: `Ref<HTMLElement | null>` (Optional) - A ref to the container element, required for interactive features like spoilers.

**Returns an object with:**
-   **`markdown`**: `Ref<string>` - A reactive ref of the raw markdown string.
-   **`renderedMarkdown`**: `Computed<string>` - A computed property that returns the sanitized HTML.
-   **`insertSyntax`**: `(before: string, after: string) => void` - A helper function to wrap selected text in a textarea.
-   **`rmark`**: `Ref<HTMLTextAreaElement | null>` - A ref to be attached to a textarea for the `insertSyntax` helper to work.

---

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the **GPL-3.0-or-later**. See the [LICENSE](LICENSE) file for details.