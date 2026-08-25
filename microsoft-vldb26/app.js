const data = window.BOOTH_DATA;
const paperGrid = document.querySelector("#paper-grid");
const communityGrid = document.querySelector("#community-grid");
const jobList = document.querySelector("#job-list");
const jobSearch = document.querySelector("#job-search");
const locationFilter = document.querySelector("#location-filter");
const jobCount = document.querySelector("#job-count");
const loadMore = document.querySelector("#load-more");
let visibleJobs = 10;

function renderPapers(filter = "all") {
  const papers = filter === "all" ? data.papers : data.papers.filter(paper => paper.type === filter);
  paperGrid.innerHTML = papers.map((paper, index) => `
    <article class="paper-card ${paper.type}">
      <div class="meta"><span class="tag">${paper.type}</span><span class="index">${String(index + 1).padStart(2, "0")}</span></div>
      <h3>${paper.title}</h3>
      <p>${paper.authors}</p>
    </article>
  `).join("");
}

function renderCommunity(type = "workshops") {
  communityGrid.innerHTML = data[type].map(item => `
    <article class="workshop-card">
      <span class="date">${item.date}</span>
      <a href="${item.url}" target="_blank" rel="noreferrer" aria-label="Open ${item.title}">↗</a>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="organizers">${item.organizers.map(name => `<span>${name}</span>`).join("")}</div>
    </article>
  `).join("");
}

function countryFor(job) {
  const location = job.locations[0] || "Other";
  const parts = location.split(",").map(part => part.trim());
  return parts.at(-1) || "Other";
}

function populateLocations() {
  const countries = [...new Set(data.jobs.map(countryFor))].sort();
  locationFilter.innerHTML += countries.map(country => `<option value="${country}">${country}</option>`).join("");
}

function filteredJobs() {
  const query = jobSearch.value.trim().toLowerCase();
  const country = locationFilter.value;
  return data.jobs.filter(job => {
    const haystack = `${job.title} ${job.locations.join(" ")} ${job.jobId}`.toLowerCase();
    return (!query || haystack.includes(query)) && (country === "all" || countryFor(job) === country);
  });
}

function renderJobs() {
  const jobs = filteredJobs();
  jobCount.textContent = jobs.length;
  jobList.innerHTML = jobs.slice(0, visibleJobs).map(job => `
    <a class="job-row" href="${job.url}" target="_blank" rel="noreferrer">
      <span class="job-id">#${job.jobId}</span>
      <h3>${job.title}</h3>
      <p>${job.locations.join(" · ")}</p>
      <span class="arrow">↗</span>
    </a>
  `).join("");
  if (!jobs.length) jobList.innerHTML = `<p class="data-note">No roles match those filters.</p>`;
  loadMore.hidden = jobs.length <= visibleJobs;
}

document.querySelectorAll("[data-paper-filter]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active").classList.remove("active");
    button.classList.add("active");
    renderPapers(button.dataset.paperFilter);
  });
});

document.querySelectorAll("[data-community-filter]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".community-tab.active").classList.remove("active");
    button.classList.add("active");
    renderCommunity(button.dataset.communityFilter);
  });
});

[jobSearch, locationFilter].forEach(control => control.addEventListener("input", () => {
  visibleJobs = 10;
  renderJobs();
}));
loadMore.addEventListener("click", () => {
  visibleJobs += 10;
  renderJobs();
});

renderPapers();
renderCommunity();
populateLocations();
renderJobs();
document.querySelector("#paper-stat").textContent = data.papers.length;
document.querySelector("#job-stat").textContent = data.jobs.length;
