(() => {
  const state = { builds: [], current: null };
  const $ = (id) => document.getElementById(id);

  async function loadBuilds() {
    try {
      const res = await fetch(`builds-index.json?_=${Date.now()}`);
      if (!res.ok) throw new Error(`builds-index.json ${res.status}`);
      state.builds = await res.json();
    } catch {
      state.builds = [];
    }
    renderBuildDropdown();

    if (state.builds.length === 0) {
      $("empty").classList.remove("hidden");
      $("summary").classList.add("hidden");
      $("logs").classList.add("hidden");
      $("notes-section").classList.add("hidden");
      $("items").innerHTML = "";
      return;
    }
    $("empty").classList.add("hidden");

    if (!state.current || !state.builds.find((b) => b.path === state.current)) {
      state.current = state.builds[0].path;
      syncDropdown();
    }
    await loadSession(state.current);
  }

  function renderBuildDropdown() {
    const select = $("build-select");
    select.innerHTML = "";
    state.builds.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.path;
      opt.textContent = b.slug;
      select.appendChild(opt);
    });
    syncDropdown();
    select.onchange = () => {
      state.current = select.value;
      loadSession(state.current);
    };
  }

  function syncDropdown() {
    const select = $("build-select");
    if (state.current) select.value = state.current;
  }

  async function loadSession(relPath) {
    const sessionUrl = `${relPath}/session.json?_=${Date.now()}`;
    const logsUrl = `${relPath}/logs.jsonl?_=${Date.now()}`;
    const notesUrl = `${relPath}/notes.md?_=${Date.now()}`;

    try {
      const [sr, lr, nr] = await Promise.all([
        fetch(sessionUrl),
        fetch(logsUrl),
        fetch(notesUrl),
      ]);

      const session = sr.ok ? await sr.json() : null;
      if (!session) return;

      renderSession(session);

      if (nr.ok) {
        const notes = await nr.text();
        if (notes.trim()) {
          $("notes-section").classList.remove("hidden");
          $("notes-body").textContent = notes;
        } else {
          $("notes-section").classList.add("hidden");
        }
      } else {
        $("notes-section").classList.add("hidden");
      }

      if (lr.ok) {
        renderLogs(renderJsonlLogs(await lr.text()));
      } else {
        $("logs").classList.add("hidden");
      }
    } catch (e) {
      $("summary").classList.add("hidden");
      $("items").innerHTML = `<p class="empty">Failed to load: ${e.message}</p>`;
    }
  }

  function renderJsonlLogs(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    return lines
      .map((l) => {
        try {
          const ev = JSON.parse(l);
          const tag = ev.event ? `[${ev.event}] ` : "";
          return `${ev.ts} | ${String(ev.persona || "").toUpperCase()} | ${tag}${ev.message || ""}`;
        } catch {
          return l;
        }
      })
      .join("\n");
  }

  function renderSession(s) {
    $("summary").classList.remove("hidden");
    $("goal").textContent = s.goal || s.description;
    $("description").textContent = s.goal ? s.description : "";

    const phaseEl = $("phase");
    phaseEl.className = `badge ${s.phase}`;
    phaseEl.textContent = s.phase;

    $("cycle").textContent = `Cycle ${s.buildCycles}/${s.maxCycles}`;

    const counts = countStatuses(s.items);
    $("counts").textContent =
      `${s.items.length} total · ${counts.approved} approved · ${counts.done} done · ` +
      `${counts["in-progress"]} in-progress · ${counts.pending} pending · ` +
      `${counts.revision} revision · ${counts.blocked} blocked`;

    const list = $("items");
    list.innerHTML = "";
    s.items
      .sort((a, b) => a.order - b.order)
      .forEach((item) => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
          <div class="item-head">
            <h3>${esc(item.title)}</h3>
            <span class="badge ${item.status}">${item.status}</span>
          </div>
          <p class="desc">${esc(item.description)}</p>
          ${item.branch ? `<p class="branch">${esc(item.branch)}</p>` : ""}
          ${item.reviewNotes ? `<div class="review-notes">${esc(item.reviewNotes)}</div>` : ""}
        `;
        list.appendChild(div);
      });
  }

  function countStatuses(items) {
    const c = { pending: 0, "in-progress": 0, done: 0, approved: 0, revision: 0, blocked: 0 };
    items.forEach((i) => { c[i.status] = (c[i.status] || 0) + 1; });
    return c;
  }

  function renderLogs(text) {
    $("logs").classList.remove("hidden");
    const lines = text.split(/\r?\n/).filter(Boolean);
    $("logs-body").textContent = lines.slice(-50).join("\n");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  loadBuilds();
  setInterval(loadBuilds, 2000);
})();
