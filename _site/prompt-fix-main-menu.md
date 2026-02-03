kiểm tra /github-guide/hydrostructai.github.io xem có dùng Google Analytics + JavaScript

check nhúng code GA vào layout 

<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
Từ dữ liệu truy cập thu thập bạn triển khai hiển thị trực tiếp số truy cập lên website dùng API hoặc GA Dashboard để xem, đặt ở menu bên trái trên cùng

Dưới đây là **English prompt** đúng vai trò *agent task*, rõ ràng, có thứ tự kỹ thuật, **đặt tên là Prompt 1** như bạn yêu cầu.

---

## **Prompt 1 — Verify Google Analytics Integration & Display Visit Counter**

````
You are acting as a senior frontend + static-site engineer.

Task: Audit and enhance analytics tracking and visitor display for the repository
`/github-guide/hydrostructai.github.io`.

Step 1 — Analytics Audit
1. Inspect the repository structure and identify whether Google Analytics (GA) is already used.
2. Check all layout-related files (e.g. `_layouts/default.html`, `_includes/head.html`, `_includes/footer.html`) to verify:
   - whether Google Analytics or Google Tag Manager is embedded,
   - whether JavaScript tracking code is present,
   - which GA version is used (Universal Analytics vs GA4).

Step 2 — Google Analytics Injection
If Google Analytics is missing or incomplete:
1. Embed the following GA4 tracking snippet into the global layout so it loads on every page:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
````

2. Ensure the code is placed in a shared layout file (preferably inside `<head>`).
3. Use a placeholder or environment variable for `GA_MEASUREMENT_ID` if the project supports configuration.

Step 3 — Visitor Data Retrieval

1. Based on collected GA data, implement a method to retrieve visit statistics:

   * either via Google Analytics Data API (GA4),
   * or via an embeddable GA dashboard / lightweight API proxy.
2. Focus on a simple metric:

   * total visits or total page views.

Step 4 — Display Visitor Counter on Website

1. Display the visit count directly on the website UI:

   * location: **top of the left-side menu**,
   * visible on all pages.
2. Ensure the UI element:

   * is minimal and non-intrusive,
   * updates dynamically (or at reasonable intervals),
   * degrades gracefully if API data is unavailable.

Step 5 — Code Quality

1. Keep all changes clean and documented.
2. Add comments explaining:

   * where analytics is injected,
   * how visitor data is fetched,
   * how to modify or disable the counter in the future.

Deliverables:

* Confirmation of GA usage status.
* Updated layout files with GA integration.
* Implementation (HTML/CSS/JS) for displaying visitor count.
* Notes on API requirements or limitations (if any).

Goal:
Users can see a live or near-real-time visitor count displayed at the top of the left navigation menu.

```
---

## **Prompt 2 — Add Scrollable Right Sidebar for Older Posts (GitHub Copilot / Gemini 3 Flash)**

```
Act as a senior frontend engineer working directly inside the repository
`hydrostructai.github.io` (GitHub Pages, static site).

Objective:
Make the right-hand sidebar (post list / navigation menu) scrollable so users can
scroll down to view older posts independently from the main content.

Tasks:

1. Inspect the current layout structure:
   - Identify the right-side menu / sidebar component.
   - Locate the relevant layout or include files
     (e.g. `_layouts/default.html`, `_includes/sidebar.html`, or equivalent).

2. Update the sidebar behavior:
   - Keep the sidebar visible while scrolling the main article content.
   - Constrain the sidebar height to the viewport height.
   - Enable an internal vertical scrollbar when content exceeds viewport height.

3. Implement using clean, minimal CSS:
   - Prefer `position: sticky` with `top: 0`.
   - Use `max-height: 100vh` and `overflow-y: auto`.
   - Do NOT break existing layout or typography.

4. Ensure responsiveness:
   - Sidebar scroll should work on desktop and mobile.
   - On small screens, avoid layout overflow or hidden content.

5. If the current theme does not support this natively:
   - Wrap the post list inside a container div.
   - Apply scroll behavior only to that container.

6. Add concise comments explaining:
   - Why the sidebar is scrollable.
   - Where to adjust height or disable the feature if needed.

Deliverables:
- Updated CSS (inline or stylesheet).
- Any required HTML structure changes.
- Optional JavaScript ONLY if strictly necessary.

Goal:
Users can scroll the right-hand post list to access older posts
without affecting the main page scroll.
```

---

### 🔧 **Implementation Hint (for Copilot context awareness)**

Copilot should infer a solution similar to:

```css
.sidebar {
  position: sticky;
  top: 0;
  max-height: 100vh;
  overflow-y: auto;
}
```

Applied **only to the right-side navigation container**, not the entire page.

---


