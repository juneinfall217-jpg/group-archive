const items = Array.isArray(window.archiveItems) ? window.archiveItems : [];

const gallery = document.querySelector("#gallery");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const tagSelect = document.querySelector("#tagSelect");
const totalCount = document.querySelector("#totalCount");
const categoryCount = document.querySelector("#categoryCount");
const quickFilters = document.querySelectorAll(".chip");

const viewer = document.querySelector("#viewer");
const viewerImage = document.querySelector("#viewerImage");
const viewerTitle = document.querySelector("#viewerTitle");
const viewerNote = document.querySelector("#viewerNote");
const viewerCategory = document.querySelector("#viewerCategory");
const viewerSource = document.querySelector("#viewerSource");
const viewerDownload = document.querySelector("#viewerDownload");
const closeViewer = document.querySelector("#closeViewer");
const prevImage = document.querySelector("#prevImage");
const nextImage = document.querySelector("#nextImage");

let activeQuickFilter = "all";
let visibleItems = [...items];
let activeIndex = 0;
let renderedCount = 0;

const batchSize = 48;
const loadMoreButton = document.createElement("button");
loadMoreButton.className = "button load-more";
loadMoreButton.type = "button";
loadMoreButton.addEventListener("click", () => renderNextBatch());

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function getTags(item) {
  return Array.isArray(item.tags) ? item.tags : [];
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function placeholderFor(item) {
  const label = encodeURIComponent(item.category || "资料图片");
  return `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23dff3ee'/%3E%3Cstop offset='1' stop-color='%23e5eef6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='480' fill='url(%23g)'/%3E%3Ccircle cx='500' cy='130' r='58' fill='%23ffffff' opacity='.75'/%3E%3Cpath d='M90 358 232 206l92 100 62-70 164 122z' fill='%231f7a68' opacity='.28'/%3E%3Ctext x='50%25' y='82%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='30' font-weight='700' fill='%23172026'%3E${label}%3C/text%3E%3C/svg%3E`;
}

function itemMatchesQuickFilter(item) {
  const tags = getTags(item);
  if (activeQuickFilter === "all") return true;
  if (activeQuickFilter === "featured") return Boolean(item.featured);
  if (activeQuickFilter === "ppt") return tags.includes("适合汇报");
  if (activeQuickFilter === "todo") return tags.includes("待补充说明");
  return true;
}

function applyFilters() {
  const query = normalize(searchInput.value);
  const category = categorySelect.value;
  const tag = tagSelect.value;

  visibleItems = items.filter((item) => {
    const tags = getTags(item);
    const haystack = normalize([item.title, item.category, item.source, item.note, ...tags].join(" "));
    const matchesQuery = !query || haystack.includes(query);
    const matchesCategory = category === "all" || item.category === category;
    const matchesTag = tag === "all" || tags.includes(tag);
    return matchesQuery && matchesCategory && matchesTag && itemMatchesQuickFilter(item);
  });

  renderGallery();
}

function renderGallery() {
  gallery.innerHTML = "";
  renderedCount = 0;
  renderNextBatch();

  emptyState.hidden = visibleItems.length > 0;
}

function renderNextBatch() {
  const start = renderedCount;
  const nextItems = visibleItems.slice(start, start + batchSize);
  const fragment = document.createDocumentFragment();

  nextItems.forEach((item, offset) => {
    const index = start + offset;
    const card = document.createElement("article");
    card.className = "item";

    const tags = getTags(item);
    const safeTitle = escapeHtml(item.title);
    const safeCategory = escapeHtml(item.category || "未分类");
    const safeNote = escapeHtml(item.note || "暂无说明");
    card.innerHTML = `
      <button class="thumb-button" type="button" aria-label="查看 ${safeTitle}">
        <img class="thumb" src="${item.image}" alt="${safeTitle}" loading="lazy" decoding="async" />
      </button>
      <div class="content">
        <div class="meta">
          <span>${safeCategory}</span>
          ${item.featured ? '<span class="badge featured">重点</span>' : '<span class="badge">资料</span>'}
        </div>
        <h3>${safeTitle}</h3>
        <p>${safeNote}</p>
        <div class="tags">
          ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    `;

    const image = card.querySelector("img");
    image.addEventListener("error", () => {
      image.src = placeholderFor(item);
    }, { once: true });

    card.querySelector("button").addEventListener("click", () => openViewer(index));
    fragment.append(card);
  });

  gallery.append(fragment);
  renderedCount += nextItems.length;

  loadMoreButton.textContent = `加载更多（${Math.min(batchSize, visibleItems.length - renderedCount)} / 还剩 ${Math.max(visibleItems.length - renderedCount, 0)} 张）`;
  loadMoreButton.hidden = renderedCount >= visibleItems.length;

  if (!loadMoreButton.hidden && loadMoreButton.parentElement !== gallery.parentElement) {
    gallery.insertAdjacentElement("afterend", loadMoreButton);
  } else if (!loadMoreButton.hidden) {
    gallery.after(loadMoreButton);
  }
}

function openViewer(index) {
  activeIndex = index;
  updateViewer();
  if (!viewer.open) viewer.showModal();
}

function updateViewer() {
  const item = visibleItems[activeIndex];
  if (!item) return;

  viewerImage.src = item.image;
  viewerImage.alt = item.title;
  viewerImage.onerror = () => {
    viewerImage.src = placeholderFor(item);
  };
  viewerTitle.textContent = item.title;
  viewerNote.textContent = item.note || "暂无说明";
  viewerCategory.textContent = item.category || "未分类";
  viewerSource.textContent = item.source ? `来源：${item.source}` : "";
  viewerDownload.href = item.image;
}

function moveViewer(direction) {
  if (!visibleItems.length) return;
  activeIndex = (activeIndex + direction + visibleItems.length) % visibleItems.length;
  updateViewer();
}

function setup() {
  const categories = unique(items.map((item) => item.category));
  const tags = unique(items.flatMap((item) => getTags(item)));

  totalCount.textContent = `${items.length} 张图片`;
  categoryCount.textContent = `${categories.length} 个分类`;
  fillSelect(categorySelect, categories);
  fillSelect(tagSelect, tags);

  [searchInput, categorySelect, tagSelect].forEach((control) => {
    control.addEventListener("input", applyFilters);
  });

  quickFilters.forEach((button) => {
    button.addEventListener("click", () => {
      quickFilters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeQuickFilter = button.dataset.filter;
      applyFilters();
    });
  });

  closeViewer.addEventListener("click", () => viewer.close());
  prevImage.addEventListener("click", () => moveViewer(-1));
  nextImage.addEventListener("click", () => moveViewer(1));
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });
  document.addEventListener("keydown", (event) => {
    if (!viewer.open) return;
    if (event.key === "ArrowLeft") moveViewer(-1);
    if (event.key === "ArrowRight") moveViewer(1);
  });

  renderGallery();
}

setup();
