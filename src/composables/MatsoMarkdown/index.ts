/*
 * Matsumoto
 * Copyright (C) 2025 AzureDesu <AzureDesu@protonmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { ref, computed, watch, nextTick, type Ref } from 'vue';
import DOMPurify from 'dompurify';

export function MatsoMarkdown(
  initialMarkdown: string = '',
  containerRef: Ref<HTMLElement | null> = ref(null)
) {
  const markdown: Ref<string> = ref(initialMarkdown);
  const rmark: Ref<HTMLTextAreaElement | null> = ref(null);

  const parseMarkdown = (rawMarkdown: string): string => {
    // ... all your regex logic is unchanged ...
    let processedMarkdown = rawMarkdown;

    // --- FIX 1: Un-escape forward slashes in URLs ---
    processedMarkdown = processedMarkdown.replace(/\\\//g, '/');

    // Check for blacklisted domains
    const blacklist = [
      'anime-list', 'aniplus','ani plus','anime list', 'digimoviez', '20anime', 'animesp',
      'mangadex', '30nama', 'tinymovies', 'dibamovies', 'uptv',
    ];
    blacklist.forEach((site) => {
      const blacklistRegex = new RegExp(site, 'gi');
      processedMarkdown = processedMarkdown.replace(blacklistRegex, '');
    });

    // Headings (h1-h6)
    for (let i = 6; i >= 1; i--) {
      const headerRegex = new RegExp(`^(#{${i}})(.+)$`, 'gm');
      processedMarkdown = processedMarkdown.replace(headerRegex, `<h${i}>$2</h${i}>`);
    }

    // Unordered Lists
    processedMarkdown = processedMarkdown.replace(
      /(?:^\-\s*.+\n?)+/gm,
      (match) => {
        const listItems = match.trim().replace(/^\-\s*(.+)/gm, '<li>$1</li>');
        return `<ul>${listItems}</ul>`;
      }
    );

    // Ordered Lists
    processedMarkdown = processedMarkdown.replace(
      /(\d+\.\s+.+(?:\n\d+\.\s+.+)*)/g,
      function (match) {
        const listItems = match.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        return `<ol>${listItems}</ol>`;
      }
    );

    // Blockquotes
    processedMarkdown = processedMarkdown.replace(/^>(.+)$/gm, '<blockquote>$1</blockquote>');

    // --- INLINE REPLACEMENTS NEXT ---

    processedMarkdown = processedMarkdown.replace(/__(.+?)__/g, '<strong>$1</strong>');
    processedMarkdown = processedMarkdown.replace(/_(.+?)_/g, '<em>$1</em>');
    processedMarkdown = processedMarkdown.replace(/~{3}([^]*?)~{3}/gm, '<center>$1</center>');
    processedMarkdown = processedMarkdown.replace(/~{2}([^]*?)~{2}/gm, '<del>$1</del>');
    processedMarkdown = processedMarkdown.replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank">$1</a>'
    );
    processedMarkdown = processedMarkdown.replace(
      /img(\d+)\((.+?)\)/g,
      '<img class="matsumoto-image" src="$2" width="$1">'
    );
    processedMarkdown = processedMarkdown.replace(/`(.+?)`/g, '<code>$1</code>');

    // --- NEWLINE REPLACEMENT MOVED TO THE END ---
    processedMarkdown = processedMarkdown.replace(/\n/g, '<br>');

    // Spoiler: ~!spoiler!~
    processedMarkdown = processedMarkdown.replace(
      /~!([^]*?)!~/gm,
      `<div><span data-spoiler-toggle='show' class='matsumoto-spoiler'><div data-spoiler-toggle='hide' class='matsumoto-spoiler-close'></div><span class='matsumoto-spoiler-content'>$1</span></span></div>`
    );

    return DOMPurify.sanitize(processedMarkdown, { USE_PROFILES: { html: true } });
  };

  const renderedMarkdown = computed(() => parseMarkdown(markdown.value));

  function insertSyntax(before: string, after: string) {
    if (!rmark.value) return;
    const textarea = rmark.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    markdown.value =
      markdown.value.slice(0, start) +
      before +
      markdown.value.slice(start, end) +
      after +
      markdown.value.slice(end);
    nextTick(() => {
      textarea.setSelectionRange(start + before.length, end + before.length);
      textarea.focus();
    });
  }

  const showSpoiler = (event: MouseEvent) => {
    const element = event.currentTarget as HTMLElement;
    const spoilerContent = element.querySelector<HTMLElement>('.matsumoto-spoiler-content');
    if (!spoilerContent) return;

    if (element.classList.contains('spoiler-closed')) {
      element.classList.remove('spoiler-closed');
      spoilerContent.style.display = 'inline';
      element.classList.add('spoiler-visible');
    } else {
      spoilerContent.style.display = 'inline';
      element.classList.add('spoiler-visible');
    }
  };

  const hideSpoiler = (event: MouseEvent) => {
    event.stopPropagation();
    const closeButton = event.currentTarget as HTMLElement;
    const spoilerElement = closeButton.closest('.matsumoto-spoiler') as HTMLElement;
    if (!spoilerElement) return;

    const spoilerContent = spoilerElement.querySelector<HTMLElement>('.matsumoto-spoiler-content');
    if (!spoilerContent) return;

    spoilerContent.style.display = 'none';
    spoilerElement.classList.remove('spoiler-visible');
    spoilerElement.classList.add('spoiler-closed');
  };

  const attachSpoilerListeners = () => {
    if (!containerRef.value) return;

    const showSpoilers = containerRef.value.querySelectorAll<HTMLElement>('[data-spoiler-toggle="show"]');
    showSpoilers.forEach(spoiler => {
      spoiler.removeEventListener('click', showSpoiler); // Prevent duplicates
      spoiler.addEventListener('click', showSpoiler);
    });

    const hideSpoilers = containerRef.value.querySelectorAll<HTMLElement>('[data-spoiler-toggle="hide"]');
    hideSpoilers.forEach(spoiler => {
      spoiler.removeEventListener('click', hideSpoiler); // Prevent duplicates
      spoiler.addEventListener('click', hideSpoiler);
    });
  };

  watch(renderedMarkdown, () => {
    nextTick(attachSpoilerListeners);
  }, { immediate: true });

  return {
    markdown,
    renderedMarkdown,
    insertSyntax,
    rmark,
  };
}