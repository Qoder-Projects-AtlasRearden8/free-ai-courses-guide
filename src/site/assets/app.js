(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const STORAGE = {
    saved: 'learn-ai-for-free:v1:saved',
    done: 'learn-ai-for-free:v1:done',
    tasks: 'learn-ai-for-free:v1:tasks',
  };
  const liveRegion = document.getElementById('live-region');
  const page = document.body.dataset.page || '';

  function readSet(key) {
    try {
      const value = JSON.parse(window.localStorage.getItem(key) || '[]');
      return new Set(Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []);
    } catch {
      return new Set();
    }
  }

  function writeSet(key, set) {
    try {
      window.localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
      // Progress remains usable for this visit when browser storage is unavailable.
    }
  }

  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 20);
  }

  const saved = readSet(STORAGE.saved);
  const done = readSet(STORAGE.done);
  const planTasks = readSet(STORAGE.tasks);
  let refreshLibraryFilters = () => {};

  document.querySelectorAll('[data-requires-js]').forEach((element) => {
    element.hidden = false;
  });

  function syncResourceButtons() {
    document.querySelectorAll('[data-save-id]').forEach((button) => {
      const active = saved.has(button.dataset.saveId);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      const label = button.querySelector('span:last-of-type');
      if (label) label.textContent = active ? 'Saved' : 'Save';
      button.setAttribute(
        'aria-label',
        active
          ? `Remove ${button.dataset.itemTitle} from saved items`
          : `Save ${button.dataset.itemTitle} for later`,
      );
    });

    document.querySelectorAll('[data-done-id]').forEach((button) => {
      const active = done.has(button.dataset.doneId);
      const activeClass = button.classList.contains('mini-done') ? 'is-done' : 'is-active';
      button.classList.toggle(activeClass, active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute(
        'aria-label',
        active
          ? `Mark ${button.dataset.itemTitle} as not done`
          : `Mark ${button.dataset.itemTitle} as done`,
      );
    });

    document.querySelectorAll('[data-saved-count]').forEach((element) => {
      element.textContent = String(saved.size);
    });
    document.querySelectorAll('[data-done-count]').forEach((element) => {
      element.textContent = String(done.size);
    });
  }

  function syncPathProgress() {
    document.querySelectorAll('[data-path-block]').forEach((block) => {
      const ids = (block.dataset.pathResources || '').split(',').filter(Boolean);
      const completed = ids.filter((id) => done.has(id)).length;
      const count = block.querySelector('[data-path-count]');
      const bar = block.querySelector('[data-path-bar]');
      if (count) count.textContent = `${completed} of ${ids.length} resources done`;
      if (bar) {
        bar.setAttribute('aria-valuemax', String(ids.length));
        bar.setAttribute('aria-valuenow', String(completed));
        bar.setAttribute('aria-valuetext', `${completed} of ${ids.length} resources done`);
        const fill = bar.querySelector('span');
        if (fill) fill.style.width = `${ids.length ? (completed / ids.length) * 100 : 0}%`;
      }
    });
  }

  function syncPlanProgress() {
    const tasks = [...document.querySelectorAll('[data-plan-task]')];
    if (!tasks.length) return;
    const completed = tasks.filter((task) => planTasks.has(task.dataset.planTask)).length;
    const total = tasks.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    const overallCount = document.querySelector('[data-plan-overall-count]');
    const overallPercent = document.querySelector('[data-plan-overall-percent]');
    const overallBar = document.querySelector('[data-plan-overall-bar]');
    if (overallCount) overallCount.textContent = `${completed} of ${total} tasks done`;
    if (overallPercent) overallPercent.textContent = `${percent}%`;
    if (overallBar) {
      overallBar.setAttribute('aria-valuemax', String(total));
      overallBar.setAttribute('aria-valuenow', String(completed));
      overallBar.setAttribute('aria-valuetext', `${percent}% complete`);
      const fill = overallBar.querySelector('span');
      if (fill) fill.style.width = `${percent}%`;
    }

    document.querySelectorAll('[data-phase]').forEach((phase) => {
      const phaseTasks = [...phase.querySelectorAll('[data-plan-task]')];
      const phaseDone = phaseTasks.filter((task) => task.checked).length;
      const phasePercent = phaseTasks.length
        ? Math.round((phaseDone / phaseTasks.length) * 100)
        : 0;
      const count = phase.querySelector('[data-phase-count]');
      const bar = phase.querySelector('[data-phase-bar]');
      if (count) count.textContent = `${phaseDone} of ${phaseTasks.length} tasks`;
      if (bar) {
        bar.setAttribute('aria-valuenow', String(phasePercent));
        bar.setAttribute('aria-valuetext', `${phasePercent}% complete`);
        const fill = bar.querySelector('span');
        if (fill) fill.style.width = `${phasePercent}%`;
      }
    });
  }

  document.addEventListener('click', (event) => {
    const saveButton = event.target.closest('[data-save-id]');
    if (saveButton) {
      const id = saveButton.dataset.saveId;
      const title = saveButton.dataset.itemTitle;
      if (saved.has(id)) {
        saved.delete(id);
        announce(`${title} removed from saved.`);
      } else {
        saved.add(id);
        announce(`${title} saved.`);
      }
      writeSet(STORAGE.saved, saved);
      syncResourceButtons();
      if (page === 'library') refreshLibraryFilters();
      return;
    }

    const doneButton = event.target.closest('[data-done-id]');
    if (doneButton) {
      const id = doneButton.dataset.doneId;
      const title = doneButton.dataset.itemTitle;
      if (done.has(id)) {
        done.delete(id);
        announce(`${title} marked not done.`);
      } else {
        done.add(id);
        announce(`${title} marked done.`);
      }
      writeSet(STORAGE.done, done);
      syncResourceButtons();
      syncPathProgress();
      if (page === 'library') refreshLibraryFilters();
    }
  });

  const navToggle = document.querySelector('.nav-toggle');
  const siteHeader = document.querySelector('.site-header');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && siteHeader && primaryNav) {
    const setNav = (open) => {
      siteHeader.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    navToggle.addEventListener('click', () => {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    primaryNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        navToggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) setNav(false);
    });
  }

  function setupLibrary() {
    const search = document.getElementById('library-search');
    const clearSearch = document.querySelector('[data-clear-search]');
    const typeButtons = [...document.querySelectorAll('[data-type-filter]')];
    const category = document.getElementById('category-filter');
    const level = document.getElementById('level-filter');
    const provider = document.getElementById('provider-filter');
    const freeCertificate = document.getElementById('free-cert-filter');
    const savedFilter = document.getElementById('saved-filter');
    const doneFilter = document.getElementById('done-filter');
    const resultsCount = document.getElementById('results-count');
    const emptyState = document.getElementById('empty-state');
    const clearFilterButtons = [...document.querySelectorAll('[data-clear-filters]')];
    const cards = [...document.querySelectorAll('[data-resource-card]')];
    let type = 'all';
    let savedOnly = false;
    let doneOnly = false;

    const requestedCategory = new URLSearchParams(window.location.search).get('category');
    if (
      requestedCategory &&
      category &&
      [...category.options].some((option) => option.value === requestedCategory)
    ) {
      category.value = requestedCategory;
    }

    function setPressed(button, pressed) {
      button.setAttribute('aria-pressed', String(pressed));
      button.classList.toggle('is-active', pressed);
    }

    function hasActiveFilters() {
      return Boolean(
        (search?.value || '').trim() ||
          type !== 'all' ||
          category?.value ||
          level?.value ||
          provider?.value ||
          freeCertificate?.checked ||
          savedOnly ||
          doneOnly,
      );
    }

    function applyLibraryFilters() {
      const query = (search?.value || '').trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const matches =
          (!query || card.dataset.search.includes(query)) &&
          (type === 'all' || card.dataset.type === type) &&
          (!category?.value || card.dataset.category === category.value) &&
          (!level?.value || card.dataset.level === level.value) &&
          (!provider?.value || card.dataset.provider === provider.value) &&
          (!freeCertificate?.checked || card.dataset.certificate === 'free') &&
          (!savedOnly || saved.has(card.dataset.resourceId)) &&
          (!doneOnly || done.has(card.dataset.resourceId));
        card.hidden = !matches;
        if (matches) visible += 1;
      });

      if (resultsCount) {
        resultsCount.textContent =
          !hasActiveFilters() && visible === cards.length
            ? `Showing all ${cards.length} resources.`
            : `Showing ${visible} of ${cards.length} resources.`;
      }
      if (emptyState) emptyState.hidden = visible !== 0;

      const anyFilters = hasActiveFilters();
      clearFilterButtons.forEach((button) => {
        button.hidden = !anyFilters;
      });
      if (clearSearch) clearSearch.hidden = !query;
      syncResourceButtons();
    }

    refreshLibraryFilters = applyLibraryFilters;

    typeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        type = button.dataset.typeFilter;
        typeButtons.forEach((candidate) => setPressed(candidate, candidate === button));
        applyLibraryFilters();
      });
    });

    search?.addEventListener('input', applyLibraryFilters);
    search?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && search.value) {
        search.value = '';
        applyLibraryFilters();
        announce('Search cleared.');
      }
    });
    clearSearch?.addEventListener('click', () => {
      if (!search) return;
      search.value = '';
      search.focus();
      applyLibraryFilters();
      announce('Search cleared.');
    });

    [category, level, provider, freeCertificate].forEach((control) => {
      control?.addEventListener('change', applyLibraryFilters);
    });

    savedFilter?.addEventListener('click', () => {
      savedOnly = !savedOnly;
      setPressed(savedFilter, savedOnly);
      applyLibraryFilters();
    });
    doneFilter?.addEventListener('click', () => {
      doneOnly = !doneOnly;
      setPressed(doneFilter, doneOnly);
      applyLibraryFilters();
    });

    clearFilterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        type = 'all';
        savedOnly = false;
        doneOnly = false;
        if (search) search.value = '';
        if (category) category.value = '';
        if (level) level.value = '';
        if (provider) provider.value = '';
        if (freeCertificate) freeCertificate.checked = false;
        typeButtons.forEach((candidate) =>
          setPressed(candidate, candidate.dataset.typeFilter === 'all'),
        );
        if (savedFilter) setPressed(savedFilter, false);
        if (doneFilter) setPressed(doneFilter, false);
        applyLibraryFilters();
        announce('All library filters reset.');
      });
    });

    applyLibraryFilters();
  }

  function setupPlan() {
    const taskInputs = [...document.querySelectorAll('[data-plan-task]')];
    if (!taskInputs.length) return;

    taskInputs.forEach((input) => {
      input.checked = planTasks.has(input.dataset.planTask);
    });

    taskInputs.forEach((input) => {
      input.addEventListener('change', () => {
        const id = input.dataset.planTask;
        const label = input.dataset.taskLabel || 'Task';
        if (input.checked) {
          planTasks.add(id);
          announce(`${label} checked.`);
        } else {
          planTasks.delete(id);
          announce(`${label} unchecked.`);
        }
        writeSet(STORAGE.tasks, planTasks);
        syncPlanProgress();
      });
    });

    document.getElementById('print-plan')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('export-plan')?.addEventListener('click', () => {
      const exportData = {
        guide: 'Learn AI for Free',
        exportedAt: new Date().toISOString(),
        planTasks: taskInputs.map((input) => ({
          id: input.dataset.planTask,
          label: input.dataset.taskLabel,
          done: input.checked,
        })),
        savedResources: [...saved],
        doneResources: [...done],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'learn-ai-for-free-progress.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      announce('Progress file downloaded.');
    });

    document.getElementById('reset-plan')?.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Reset all checked plan tasks? Saved resources and done marks will stay.',
      );
      if (!confirmed) return;
      planTasks.clear();
      writeSet(STORAGE.tasks, planTasks);
      taskInputs.forEach((input) => {
        input.checked = false;
      });
      syncPlanProgress();
      announce('Plan progress reset.');
    });

    syncPlanProgress();
  }

  syncResourceButtons();
  syncPathProgress();

  if (page === 'library') setupLibrary();
  if (page === 'plan') setupPlan();
})();
