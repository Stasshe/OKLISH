/* dev/heavy.ts
   Heavy content generator for dev/index.html
   - Adds button handlers to generate many DOM nodes, images, iframes, and large tables.
*/

function log(msg: string) {
  const el = document.getElementById('heavy-log');
  if (el) {
    el.textContent = (el.textContent || '') + msg + '\n';
    el.scrollTop = el.scrollHeight;
  }
  console.log('[heavy]', msg);
}

function createButtonListeners() {
  const make = document.getElementById('btn-generate-dom') as HTMLButtonElement | null;
  const addMany = document.getElementById('btn-add-many') as HTMLButtonElement | null;
  const loadImgs = document.getElementById('btn-load-images') as HTMLButtonElement | null;
  const addIframes = document.getElementById('btn-add-iframes') as HTMLButtonElement | null;
  const populateTbl = document.getElementById('btn-populate-table') as HTMLButtonElement | null;
  const clearBtn = document.getElementById('btn-clear') as HTMLButtonElement | null;

  if (make) make.addEventListener('click', () => { log('generate 200 sections'); generateDom(200); });
  if (addMany) addMany.addEventListener('click', () => { log('generate 2000 sections'); generateDom(2000); });
  if (loadImgs) loadImgs.addEventListener('click', () => { log('load 50 images'); loadImages(50); });
  if (addIframes) addIframes.addEventListener('click', () => { log('add 5 iframes'); addIframesFn(5); });
  if (populateTbl) populateTbl.addEventListener('click', () => { log('populate table 2000 rows'); populateTable(2000); });
  if (clearBtn) clearBtn.addEventListener('click', () => { clearAll(); log('cleared'); });
}

function getOutput(): HTMLElement {
  const el = document.getElementById('heavy-output');
  if (!el) throw new Error('heavy-output not found');
  return el as HTMLElement;
}

function generateDom(count = 200) {
  const container = getOutput();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const section = document.createElement('section');
    section.className = 'heavy-section';
    const h = document.createElement('h3');
    h.textContent = `Section ${i + 1}`;
    section.appendChild(h);
    const p = document.createElement('p');
    p.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(6);
    section.appendChild(p);
    const ul = document.createElement('ul');
    for (let j = 0; j < 8; j++) {
      const li = document.createElement('li');
      li.textContent = `Item ${j + 1} of section ${i + 1}`;
      ul.appendChild(li);
    }
    section.appendChild(ul);
    if (i % 10 === 0) {
      const img = document.createElement('img');
      img.alt = `picsum ${i}`;
      img.width = 800;
      img.height = 600;
      img.loading = 'lazy';
      img.src = `https://picsum.photos/seed/heavy-${Date.now()}-${i}/1200/800`;
      section.appendChild(img);
    }
    frag.appendChild(section);
  }
  container.appendChild(frag);
  log(`appended ${count} sections`);
}

function loadImages(count = 50) {
  const container = getOutput();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.alt = `heavy-img-${i}`;
    img.width = 1200;
    img.height = 800;
    img.loading = 'eager';
    img.src = `https://picsum.photos/seed/heavy-img-${Math.floor(Math.random()*1e9)}/1600/1000`;
    frag.appendChild(img);
  }
  container.appendChild(frag);
  log(`loaded ${count} images`);
}

function addIframesFn(count = 3) {
  const container = getOutput();
  for (let i = 0; i < count; i++) {
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '300';
    iframe.style.border = '1px solid #ccc';
    const inner = `<div style="font-family:sans-serif;padding:12px"><h2>Embedded frame ${i+1}</h2>${'<p>Embedded content. </p>'.repeat(200)}</div>`;
    iframe.srcdoc = inner;
    container.appendChild(iframe);
  }
  log(`added ${count} iframes`);
}

function populateTable(rows = 2000) {
  const container = getOutput();
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>#</th><th>Name</th><th>Value</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>Item ${i + 1}</td><td>${Math.random().toFixed(6)}</td>`;
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
  table.appendChild(tbody);
  container.appendChild(table);
  log(`populated table ${rows} rows`);
}

function clearAll() {
  const container = getOutput();
  container.innerHTML = '';
  const logEl = document.getElementById('heavy-log');
  if (logEl) logEl.textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('heavy-output')) return;
  createButtonListeners();
  log('heavy module ready');
});

export {};
