// Markdown.js

import { ref, computed, watch, nextTick } from 'vue';
import DOMPurify from 'dompurify';

export function Markdown(initialMarkdown = '', containerRef = ref(null)) {
  const markdown = ref(initialMarkdown);
  const rmark = ref(null); // Ref for the textarea element

  // ... (Your blacklist and parseMarkdown function are unchanged)
  

  const parseMarkdown = (rawMarkdown) => {
    // Sanitize and process markdown
    let processedMarkdown = rawMarkdown;

     // --- FIX 1: Un-escape forward slashes in URLs ---
    // This replaces all occurrences of `\/` with `/`.
    // It should be one of the first steps to ensure all subsequent regexes work with clean URLs.
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

    // ... (All other regex replacements for bold, italic, center, etc.)
    processedMarkdown = processedMarkdown.replace(/\n/g, '<br>');
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
      '<img class="rounded-sm" src="$2" width="$1">'
    );
    for (let i = 6; i >= 1; i--) {
      const headerRegex = new RegExp(`^(#{${i}})(.+)$`, 'gm');
      processedMarkdown = processedMarkdown.replace(headerRegex, `<h${i}>$2</h${i}>`);
    }
    processedMarkdown = processedMarkdown.replace(/^>(.+)$/gm, '<blockquote>$1</blockquote>');
    processedMarkdown = processedMarkdown.replace(/`(.+?)`/g, '<code>$1</code>');
    

    /* this section is bugged is makeing ul for every li */
    // processedMarkdown = processedMarkdown.replace(/^\- (.+)$/gm, '<li>$1</li>');
    // processedMarkdown = processedMarkdown.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    // processedMarkdown = processedMarkdown.replace(
    //   /(\d+\.\s+.+(?:\n\d+\.\s+.+)*)/g,
    //   function (match) {
    //     const listItems = match.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    //     return `<ol>${listItems}</ol>`;
    //   }
    // );
    /*  fixed version for ul and li */
    processedMarkdown = processedMarkdown.replace(
      /(?:^\-\s*.+\n?)+/gm,
      (match) => {
        const listItems = match.trim().replace(/^\-\s*(.+)/gm, '<li>$1</li>');
        return `<ul>${listItems}</ul>`;
      }
    );

    processedMarkdown = processedMarkdown.replace(
      /(\d+\.\s+.+(?:\n\d+\.\s+.+)*)/g,
      function (match) {
        const listItems = match.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        return `<ol>${listItems}</ol>`;
      }
    );

    // Spoiler: ~!spoiler!~
    // Use data attributes that DOMPurify will preserve
    processedMarkdown = processedMarkdown.replace(
      /~!([^]*?)!~/gm,
      `<div><span data-spoiler-toggle='show' class='markdown-spoiler before:bg-background before:text-primary text-sm'><div data-spoiler-toggle='hide' class='hide-spoiler bg-accent-50-active leading-none  markdown-close-button'></div><span class='bg-background rounded-sm'>$1</span></span></div>`
    );

    // Sanitize the final HTML to prevent XSS attacks
    return DOMPurify.sanitize(processedMarkdown, { USE_PROFILES: { html: true } });
  };

  const renderedMarkdown = computed(() => parseMarkdown(markdown.value));

  function insertSyntax(before, after) {
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
  
  // New functions for handling spoiler events
  const showSpoiler = (event) => {
    const element = event.currentTarget;
    const spoilerContent = element.querySelector('span');
    if (element.classList.contains('spoiler-closed')) {
      element.classList.remove('spoiler-closed');
      spoilerContent.style.display = 'inline';
      element.classList.add('spoiler-visible');
    } else {
      spoilerContent.style.display = 'inline';
      element.classList.add('spoiler-visible');
    }
  };

  const hideSpoiler = (event) => {
    event.stopPropagation();
    const spoilerElement = event.currentTarget.parentElement;
    const spoilerContent = spoilerElement.querySelector('span');
    spoilerContent.style.display = 'none';
    spoilerElement.classList.remove('spoiler-visible');
    spoilerElement.classList.add('spoiler-closed');
  };
  const attachSpoilerListeners = () => {
    if (!containerRef.value) {
      // disabled because when we editing in the profile we don't want to see this contastnly pop up
      // console.error('Container ref is null or undefined!');
      return;
    }
    
    // console.log('Attaching spoiler listeners to:', containerRef.value);

    // Detach any existing listeners to prevent duplication
    const spoilers = containerRef.value.querySelectorAll('[data-spoiler-toggle]');
    spoilers.forEach(el => {
      el.removeEventListener('click', showSpoiler);
      el.removeEventListener('click', hideSpoiler);
    });

    const showSpoilers = containerRef.value.querySelectorAll('[data-spoiler-toggle="show"]');
    showSpoilers.forEach(spoiler => {
      spoiler.addEventListener('click', showSpoiler);
    });

    const hideSpoilers = containerRef.value.querySelectorAll('[data-spoiler-toggle="hide"]');
    hideSpoilers.forEach(spoiler => {
      spoiler.addEventListener('click', hideSpoiler);
    });
};

  // The core of the new approach: watch for changes and attach listeners
  watch(renderedMarkdown, (newValue) => {
    nextTick(attachSpoilerListeners);
  }, { immediate: true }); // 'immediate: true' will run the watcher on initial setup

  return {
    markdown,
    renderedMarkdown,
    insertSyntax,
    rmark,
  };
}