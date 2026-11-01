/* Nexora Solutions: all content and interactions. No build step needed. */
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, html = '') => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  n.innerHTML = html;
  return n;
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- DATA ---------- */
const SERVICES = [
  { name: 'Website development', hue: '#3d8bff', scope: 'Responsive websites and web apps with admin consoles and API integrations.',
    items: ['Business websites', 'Portfolio websites', 'E-commerce platforms', 'Landing pages', 'Custom web applications', 'Responsive UI/UX design', 'Website maintenance and support'],
    eg: ['EV Battery Health Dashboard', 'Developer API Observability Console', 'Small Manufacturer Quotation Tool'] },
  { name: 'Mobile app development', hue: '#22d3a0', scope: 'Android, iOS and cross-platform apps, built from MVP to enterprise scale.',
    items: ['Android applications', 'iOS applications', 'Cross-platform apps', 'Startup MVP development', 'Enterprise applications', 'API integration'],
    eg: ['Road-Surface Issue Reporting App', 'Clinic Appointment and Queue Management', 'Local-Language Learning Companion'] },
  { name: 'AI and automation', hue: '#9a6bff', scope: 'Data preparation, model development, calibration, evaluation and inference services.',
    items: ['AI chatbots', 'Customer support bots', 'WhatsApp automation', 'AI-powered business tools', 'Document processing systems', 'AI analytics dashboards', 'Machine learning solutions'],
    eg: ['AI-Based Crop Disease Triage', 'AI Customer Feedback Classifier', 'Telugu Voice Service Assistant'] },
  { name: 'Product design and development', hue: '#ffb020', scope: 'From requirements and architecture to a tested, shippable product.',
    items: ['Software product design', 'MVP development', 'SaaS solutions', 'UI/UX prototyping', 'System architecture design'],
    eg: ['Meeting Action-Item Extractor', 'Recruitment Skills-Matching Portal', 'Retail Demand Forecasting Tool'] },
  { name: 'Intellectual property support', hue: '#2fd4ff', scope: 'Invention disclosures, prior-art search coordination, drawing briefs and docketing support.',
    items: ['Patent drafting assistance', 'Patent illustrations and drawings', 'Technical documentation', 'Innovation documentation', 'Prototype documentation', 'Research support'],
    eg: ['See the patent work reference below'] },
  { name: 'Utility and custom software', hue: '#ff5a6e', scope: 'Tools shaped around how your business already works.',
    items: ['Inventory management systems', 'ERP solutions', 'CRM solutions', 'Educational platforms', 'Healthcare applications', 'Export and logistics systems', 'Custom business automation tools'],
    eg: ['Food Inventory and Expiry Tracker', 'Pharmacy Stock Visibility System', 'Smart Export Documentation Assistant'] }
];

const CAPS = [
  ['Software and product engineering', 'Requirements, architecture, modular implementation, testing and deployment.'],
  ['Web and mobile application development', 'Responsive web apps, Android and cross-platform apps, admin consoles and API integrations.'],
  ['Artificial intelligence and machine learning', 'Data preparation, model development, calibration, evaluation and inference services.'],
  ['Data engineering and analytics', 'Data pipelines, database design, data-quality checks, dashboards and reporting.'],
  ['Internet of Things and embedded systems', 'Sensor selection, firmware, gateways, telemetry, device management and field testing.'],
  ['Cloud deployment and system integration', 'Containerised deployment, CI/CD, monitoring, rollback plans and service integrations.'],
  ['Industrial automation and monitoring', 'Condition monitoring, alerting, PLC/sensor integration and maintenance records.'],
  ['EV and battery technology', 'Telemetry capture, state-of-health estimation, risk scoring and charging schedules.'],
  ['AR/VR and 3D visualisation', '3D assets, web/mobile viewers, AR placement and guided walkthroughs.'],
  ['Technical prototyping and applied research', 'Proofs of concept, benchmarking, feasibility reports and experiment design.'],
  ['Innovation documentation and IP support', 'Invention disclosures, prior-art search coordination, drawing briefs and docketing support.'],
  ['Technology consulting for startups and SMEs', 'Problem validation, technology selection, MVP scoping and build-versus-buy advice.']
];

const PROJECTS = [
  ['AI-Based Crop Disease Triage', 'Tamil Nadu', 'AgriTech', 'Photo-based crop issue screening, confidence-scored classification and a field-agent review queue.'],
  ['Smart Irrigation Scheduling', 'Tamil Nadu', 'ClimateTech', 'Soil-moisture and weather inputs support per-plot irrigation recommendations with manual override.'],
  ['EV Battery Health Dashboard', 'Tamil Nadu', 'Mobility & Energy', 'Battery telemetry, state-of-health trends, threshold alerts and maintenance logging.'],
  ['Construction Plot Visualisation Platform', 'Tamil Nadu', 'PropTech / AR/VR', 'Plot-status layers with linked 3D building concepts, browser viewing and AR placement.'],
  ['Smart Export Documentation Assistant', 'Tamil Nadu', 'TradeTech', 'Product- and destination-specific document checklists, readiness checks and shipment-stage tracking.'],
  ['Clinic Appointment and Queue Management', 'Tamil Nadu', 'HealthTech', 'Appointment booking, live queue status, reminders and daily utilisation reporting.'],
  ['Local-Language Learning Companion', 'Tamil Nadu', 'EdTech', 'Bilingual practice modules, vocabulary/listening exercises and learner progress tracking.'],
  ['Factory Machine Anomaly Monitor', 'Tamil Nadu', 'Industrial IoT', 'Vibration and temperature monitoring with anomaly alerts and machine history.'],
  ['Water-Quality Monitoring Dashboard', 'Tamil Nadu', 'CleanTech', 'Multi-parameter probe readings, threshold alerts, site reports and calibration records.'],
  ['Food Inventory and Expiry Tracker', 'Tamil Nadu', 'RetailTech', 'Batch-level inventory, expiry prompts, reorder planning and stock reports.'],
  ['AI Customer Feedback Classifier', 'Tamil Nadu', 'AI / SaaS', 'Topic and emotion classification with trend dashboards, comment drill-down and export.'],
  ['Solar Plant Performance Monitor', 'Tamil Nadu', 'EnergyTech', 'Expected-versus-actual generation analysis, fault alerts and maintenance records.'],
  ['Warehouse Slotting Optimiser', 'Bengaluru', 'Supply Chain', 'Demand-aware item slotting, picking-path analysis and what-if comparisons.'],
  ['Developer API Observability Console', 'Bengaluru', 'DevTools', 'Latency and error-rate dashboards, incident annotations and configurable alerts.'],
  ['Recruitment Skills-Matching Portal', 'Bengaluru', 'HRTech', 'Skills extraction, explainable match scoring and recruiter review workflow.'],
  ['Retail Demand Forecasting Tool', 'Bengaluru', 'RetailTech', 'SKU-level forecasts, seasonality handling, reorder suggestions and accuracy tracking.'],
  ['Cybersecurity Log Triage Assistant', 'Bengaluru', 'Cybersecurity', 'Event grouping, anomaly scoring and analyst-priority queues with feedback.'],
  ['Meeting Action-Item Extractor', 'Bengaluru', 'Productivity SaaS', 'Meeting summaries and proposed owners/dates for action items with human review.'],
  ['EV Fleet Charging Scheduler', 'Bengaluru', 'Mobility', 'Charging schedules based on vehicle availability, battery state and operational demand.'],
  ['Precision Aquaculture Monitor', 'Andhra Pradesh', 'AgriTech', 'Pond-water sensing, trend alerts and notifications for farm staff.'],
  ['Fisheries Cold-Chain Tracker', 'Andhra Pradesh', 'Logistics', 'Temperature logging linked to shipment records, excursion alerts and traceability reports.'],
  ['Telugu Voice Service Assistant', 'Andhra Pradesh', 'Conversational AI', 'Telugu speech interfaces for routine queries, human escalation and call summaries.'],
  ['Microfinance Document Workflow', 'Andhra Pradesh', 'FinTech Operations', 'Application tracking, document checklist checks, approval steps and audit history.'],
  ['Small Manufacturer Quotation Tool', 'Andhra Pradesh', 'Manufacturing SaaS', 'Bill-of-material costing, quotation generation and revision history.'],
  ['Road-Surface Issue Reporting App', 'Andhra Pradesh', 'CivicTech', 'Photo/location capture, status tracking, priority scoring and map view.'],
  ['Pharmacy Stock Visibility System', 'Multi-region', 'Health Operations', 'Cross-outlet stock reconciliation, low-stock alerts and transfer suggestions.'],
  ['SME Energy-Use Analytics Platform', 'Multi-region', 'Sustainability', 'Meter-based load profiles, peak analysis and efficiency recommendations.']
];

const PROFILES = [
  { name: 'Crop Disease Triage', flow: ['Leaf image capture', 'On-device classifier', 'Sync service', 'Case database', 'Field-agent dashboard'],
    does: 'A field agent photographs a crop problem. The app screens the image and returns likely issue categories with a confidence value. Cases synchronise when connectivity returns and appear in a queue for confirmation by an agronomist.',
    eng: 'Image quality varies with lighting and device. Confidence needs calibration. Locally relevant crops and diseases need labelled examples.',
    eval: 'Precision and recall by disease class on held-out data, share of cases confirmed by agents, and time from report to review.' },
  { name: 'Machine Anomaly Monitor', flow: ['Vibration and temperature sensors', 'Edge gateway', 'Time-series store', 'Anomaly model', 'Alert and history view'],
    does: 'Sensors record machine conditions. A gateway buffers data and a model learns the normal pattern for each machine, raising alerts when readings drift. Maintenance staff record findings so alert rules can be tuned.',
    eng: 'Failure data may be limited at first. Baselines change with load and season. Sensor mounting affects readings.',
    eval: 'Alert precision against maintenance records, time from first abnormal reading to detection, and false alerts per week.' },
  { name: 'Aquaculture Monitor', flow: ['Water probes', 'Low-power node', 'LoRaWAN/GSM link', 'Cloud service', 'Alerts and pond dashboard'],
    does: 'Pond probes measure parameters such as dissolved oxygen, temperature and pH. A service checks thresholds and trends and sends alerts to farm staff.',
    eng: 'Probe fouling and drift need cleaning and calibration. Remote coverage and power must be surveyed.',
    eval: 'Data completeness per probe, calibration drift within tolerance, and alert usefulness to farm staff.' }
];

const STAGES = [
  'Discovery and problem identification', 'Requirements gathering and stakeholder interviews', 'Feasibility study and risk assessment',
  'Scope definition and statement of work', 'Architecture and solution design', 'Prototype or proof of concept',
  'Development and iterative reviews', 'Quality assurance and validation', 'Security and performance testing',
  'Deployment and integration', 'Documentation and client handover', 'Maintenance and continuous improvement'
];
const DELIVERABLES = [
  ['Requirements document', 'Product behaviour, constraints and acceptance criteria', 2, 4],
  ['Architecture diagram', 'Components, data flows and integration points', 5, 5],
  ['Database schema', 'Entities, relationships and data rules', 5, 7],
  ['API documentation', 'Endpoints, payloads, errors and authentication', 5, 7],
  ['Sprint plan', 'Iteration scope, owners and review dates', 7, 7],
  ['Test report', 'Tests run, results, defects and open risks', 8, 9],
  ['Deployment guide', 'Release, configuration and rollback steps', 10, 10],
  ['User manual', 'Tasks for end users and administrators', 11, 11],
  ['Handover checklist', 'Operational, maintenance and support readiness', 11, 12]
];
const PRINCIPLES = [
  ['Discovery first', 'Define the problem, users, constraints and success measures before estimating the build.', 1, 4],
  ['Iterative delivery', 'Build in increments, demonstrate working features and review feedback regularly.', 6, 7],
  ['Evidence-based acceptance', 'Agree acceptance criteria and measurement methods before delivery.', 8, 9],
  ['Documented handover', 'Provide source code, technical documentation, user guidance and a maintenance route.', 11, 12]
];

const INDUSTRIES = [
  ['Agriculture and aquaculture', 'Crop screening, irrigation scheduling, pond-water alerts and traceability', 'AI/ML, IoT, Analytics'],
  ['Energy and utilities', 'Solar monitoring, energy analytics and demand forecasting', 'Analytics, IoT, Monitoring'],
  ['Manufacturing', 'Machine monitoring, quality inspection and quotation tools', 'AI/ML, Embedded, Automation'],
  ['Mobility and EV', 'Battery health, charging schedules and fleet telemetry', 'Battery, IoT, Optimisation'],
  ['Healthcare operations', 'Appointment queues, stock visibility and record workflows', 'Applications, Analytics'],
  ['Logistics and supply chain', 'Cold-chain tracking, warehouse planning and export documents', 'IoT, Software, Data'],
  ['Retail and SMEs', 'Inventory, expiry tracking, demand forecasting and feedback analysis', 'Apps, AI/ML, Data'],
  ['Education', 'Language learning and progress tracking', 'Applications, AI/ML'],
  ['Civic and public services', 'Issue reporting and voice assistants', 'Applications, AI/ML, Cloud'],
  ['Finance operations', 'Document workflows and audit trails', 'Applications, Integration']
];

const IP_FLOW = ['Invention disclosure', 'Confidentiality review', 'Prior-art search', 'Patentability assessment', 'Inventor and applicant verification', 'Filing decision', 'Application submission', 'Docketing and deadline tracking', 'Examination and prosecution', 'Maintenance'];
const PROTECTION = [['Invention idea', 'An early concept that can be documented and reviewed.'], ['Invention disclosure', 'A structured record of the problem, solution, inventors and supporting material.'], ['Patent application filed', 'An application submitted to the relevant patent office.'], ['Published application', 'An application made public by the patent office.'], ['Granted patent', 'A right granted after examination, subject to applicable law and maintenance requirements.']];
const CATALOGUE = {
  'AI, ML and computing': ['Confidence-Calibrated Multimodal Fault Detection', 'Privacy-Aware Federated Learning for Predictive Maintenance', 'Explainable Battery-Degradation Risk Scoring Using Sensor Data', 'Graph-Based Anomaly Detection for IoT Networks', 'Context-Aware Predictive Maintenance Using Multisensor Fusion', 'Adaptive Resource Allocation for Edge AI Workloads', 'Uncertainty-Aware Industrial Defect Classification', 'AI-Assisted Energy Demand Forecasting and Control'],
  'Mechanical engineering': ['Adaptive Tool-Wear Prediction with Automatic Feed-Rate Adjustment', 'Self-Aligning Conveyor Diverter for Mixed-Size Packages', 'Quick-Change Manufacturing Fixture with Embedded Position Verification', 'Modular Heat-Exchanger Cleaning Mechanism', 'Vibration-Responsive Industrial Machine Mount', 'Compact Automated Component Sorting Mechanism'],
  'Chemistry and materials': ['Reusable Adsorbent Composite for Heavy-Metal Removal from Water', 'Bio-Based Polymer Blend with Improved Moisture Barrier', 'Corrosion-Resistant Coating Composition for Coastal Equipment', 'Regenerable Sorbent for Industrial Dye Wastewater', 'Composite Material for Improved Thermal Stability', 'Low-Waste Surface Treatment Process for Industrial Components']
};

const QUALITY = [['Requirement completion', 'Traceability matrix and acceptance records'], ['Code quality', 'Pull-request reviews and static-analysis output'], ['Product usability', 'Usability session notes and task logs'], ['Model performance', 'Evaluation report, error analysis and model card'], ['Security and reliability', 'Security checklist, test results and incident log'], ['Delivery against milestones', 'Sprint plans and release notes'], ['Documentation quality', 'Documentation checklist and handover review'], ['Client acceptance', 'Signed acceptance record']];
const WHY = ['Affordable pricing', 'Startup-friendly solutions', 'Customised development', 'AI-powered innovation', 'End-to-end project support', 'Fast delivery', 'Scalable architecture', 'Technical documentation support'];
const STUDENTS = [['Understand the problem', 'Confirm users, constraints and acceptance criteria first.'], ['Work in small increments', 'Break work into reviewable tasks and show progress often.'], ['Keep engineering records', 'Maintain architecture, API/database notes and test results.'], ['Protect project data', 'Use data only for agreed purposes with proper access controls.'], ['Prepare handover', 'Complete code, setup instructions and maintenance guidance.']];

/* ---------- HERO: Ideas / Technology / Impact ---------- */
const STAGE_COPY = [
  'We frame the idea as a meaningful problem: who it is for, what limits it, and what success looks like.',
  'We select and build technology to fit the need, delivered in increments you can see working.',
  'We evaluate results against measures agreed before delivery, then hand over code and documentation.'
];
let stageIdx = 0, stageTimer;
const stageBtns = [...document.querySelectorAll('.stages button')];
function setStage(i, user) {
  stageIdx = i;
  stageBtns.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
  $('#stageText').textContent = STAGE_COPY[i];
  if (user) clearInterval(stageTimer);
}
stageBtns.forEach((b, i) => {
  b.addEventListener('click', () => setStage(i, true));
  b.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const n = (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3; setStage(n, true); stageBtns[n].focus();
    }
  });
});
setStage(0);
if (!reduce) stageTimer = setInterval(() => setStage((stageIdx + 1) % 3), 5500);

/* hero emblem tilt */
const art = $('#heroArt'), tilt = $('#tilt');
if (!reduce && matchMedia('(hover:hover)').matches) {
  art.addEventListener('pointermove', e => {
    const r = art.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.setProperty('--ry', (x * 18).toFixed(1) + 'deg');
    tilt.style.setProperty('--rx', (-y * 14).toFixed(1) + 'deg');
  });
  art.addEventListener('pointerleave', () => { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
}

/* ---------- SERVICES ---------- */
const svcTabs = $('#svcTabs'), svcPanel = $('#svcPanel'), svcFrame = $('#svcFrame');
let svcElectric = null;
function showService(i) {
  const s = SERVICES[i];
  [...svcTabs.children].forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
  svcPanel.style.setProperty('--hue', s.hue);
  if (svcElectric) svcElectric.update({ color: s.hue });
  svcPanel.innerHTML = `<h3>${esc(s.name)}</h3><p class="scope">${esc(s.scope)}</p>
    <ul class="svc-list">${s.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <p class="examples"><b>Related concepts:</b> ${s.eg.map(esc).join(', ')}</p>`;
}
SERVICES.forEach((s, i) => {
  const b = el('button', { type: 'button', role: 'tab', style: `--hue:${s.hue}` }, `<span class="dot"></span>${esc(s.name)}`);
  b.addEventListener('click', () => showService(i));
  b.addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    const n = (i + (['ArrowDown', 'ArrowRight'].includes(e.key) ? 1 : SERVICES.length - 1)) % SERVICES.length;
    showService(n); svcTabs.children[n].focus();
  });
  svcTabs.append(b);
});
showService(0);
/* electric border around the service panel; the colour follows the selected service */
if (window.ElectricBorder) {
  svcElectric = ElectricBorder.mount(svcFrame, { color: SERVICES[0].hue, borderRadius: 18, speed: 1, chaos: 0.5, spread: 0.6, strands: 3, thickness: 1.5 });
  if (svcElectric) svcFrame.classList.add('electric-on');
}
$('#caps').innerHTML = CAPS.map((c, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><div><strong>${esc(c[0])}</strong><span>${esc(c[1])}</span></div></li>`).join('');

/* ---------- PROJECTS ---------- */
const REGIONS = ['All', 'Tamil Nadu', 'Bengaluru', 'Andhra Pradesh', 'Multi-region'];
const REGION_HUE = { 'Tamil Nadu': '#3d8bff', 'Bengaluru': '#9a6bff', 'Andhra Pradesh': '#22d3a0', 'Multi-region': '#ffb020' };
let region = 'All', view = 'carousel', depthCarousel = null;
const chipBox = $('#regionChips'), grid = $('#projGrid'), search = $('#projSearch'), depthEl = $('#projDepth');
const conceptCard = p => `<div class="concept" style="--hue:${REGION_HUE[p[1]] || '#3d8bff'}">
  <span class="concept-no">${String(PROJECTS.indexOf(p) + 1).padStart(2, '0')}</span>
  <span class="meta">${esc(p[1])} / ${esc(p[2])}</span>
  <h4>${esc(p[0])}</h4>
  <p>${esc(p[3])}</p>
  <span class="concept-foot">Project concept</span>
</div>`;
function renderProjects() {
  const q = search.value.trim().toLowerCase();
  const list = PROJECTS.filter(p => (region === 'All' || p[1] === region) && (!q || p.join(' ').toLowerCase().includes(q)));
  $('#projCount').textContent = `Showing ${list.length} of ${PROJECTS.length} project concepts`;
  grid.innerHTML = list.length
    ? list.map(p => `<article class="proj"><span class="meta">${esc(p[1])} / ${esc(p[2])}</span><h4>${esc(p[0])}</h4><p>${esc(p[3])}</p></article>`).join('')
    : `<p class="empty">No concepts match "${esc(search.value)}". Clear the search or choose another region.</p>`;
  /* depth view needs the carousel script; the grid is also the empty-state and fallback view */
  const useDepth = view === 'carousel' && list.length > 0 && window.DepthCarousel;
  grid.hidden = !!useDepth;
  depthEl.hidden = !useDepth;
  if (useDepth) {
    depthCarousel = depthCarousel || DepthCarousel.create(depthEl, { label: 'Project concepts', cardWidth: 300, cardHeight: 380, falloff: 0.15 });
    depthCarousel.setItems(list.map(conceptCard));
  }
}
REGIONS.forEach(r => {
  const n = r === 'All' ? PROJECTS.length : PROJECTS.filter(p => p[1] === r).length;
  const b = el('button', { type: 'button', 'aria-pressed': r === 'All' }, `${esc(r)} (${n})`);
  b.addEventListener('click', () => { region = r; [...chipBox.children].forEach(c => c.setAttribute('aria-pressed', c === b)); renderProjects(); });
  chipBox.append(b);
});
$('#viewToggle').addEventListener('click', e => {
  const b = e.target.closest('button[data-v]');
  if (!b) return;
  view = b.dataset.v;
  [...$('#viewToggle').children].forEach(c => c.setAttribute('aria-pressed', c === b));
  renderProjects();
});
search.addEventListener('input', renderProjects);
renderProjects();

/* technical profiles */
const profTabs = $('#profTabs'), profile = $('#profile');
function showProfile(i) {
  const p = PROFILES[i];
  [...profTabs.children].forEach((b, k) => b.setAttribute('aria-selected', k === i));
  const nodes = p.flow.map((f, k) => `<li><span class="node" style="--n:${k}">${esc(f)}</span>${k < p.flow.length - 1 ? '<span class="arrow"></span>' : ''}</li>`).join('');
  profile.innerHTML = `<ol class="pipe">${nodes}</ol>
    <div class="pcols"><div><h5>What it does</h5><p>${esc(p.does)}</p></div><div><h5>Engineering considerations</h5><p>${esc(p.eng)}</p></div><div><h5>How we evaluate it</h5><p>${esc(p.eval)}</p></div></div>`;
}
PROFILES.forEach((p, i) => {
  const b = el('button', { type: 'button', role: 'tab' }, esc(p.name));
  b.addEventListener('click', () => showProfile(i));
  profTabs.append(b);
});
showProfile(0);

/* ---------- PROCESS ---------- */
const stageList = $('#stageList'), stageDetail = $('#stageDetail');
function showStage(n) {
  [...stageList.querySelectorAll('button')].forEach((b, k) => k + 1 === n ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'));
  const d = DELIVERABLES.filter(x => n >= x[2] && n <= x[3]);
  const pr = PRINCIPLES.find(x => n >= x[2] && n <= x[3]);
  stageDetail.innerHTML = `<div class="num">${String(n).padStart(2, '0')}</div><h3>${esc(STAGES[n - 1])}</h3>
    ${d.length ? `<ul>${d.map(x => `<li><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></li>`).join('')}</ul>` : '<p class="muted">This stage shapes the work that follows. No standalone document is listed for it.</p>'}
    ${pr ? `<p class="princ"><b>${esc(pr[0])}.</b> ${esc(pr[1])}</p>` : ''}`;
}
STAGES.forEach((s, i) => {
  const li = el('li');
  const b = el('button', { type: 'button' }, `<b>${String(i + 1).padStart(2, '0')}</b><span>${esc(s)}</span>`);
  b.addEventListener('click', () => showStage(i + 1));
  li.append(b); stageList.append(li);
});
showStage(5);
$('#industries').innerHTML = INDUSTRIES.map(i => `<div><dt>${esc(i[0])}</dt><dd>${esc(i[1])}<span class="th">${esc(i[2])}</span></dd></div>`).join('');

/* ---------- PATENT ---------- */
$('#ladder').innerHTML = PROTECTION.map((p, i) => `<li class="${i === 4 ? 'on' : ''}">${esc(p[0])}${i === 4 ? '<small>Patent No. 589844 is at this stage</small>' : ''}</li>`).join('');
/* patent workflow: branched menu + detail card */
const IP_PHASES = [['Assess the invention', 0, 4], ['Verify and file', 4, 7], ['Prosecute and maintain', 7, 10]];
const ipDetail = $('#ipDetail');
function showIpStep(n) {
  const phase = IP_PHASES.find(p => n > p[1] && n <= p[2]);
  const segs = IP_FLOW.map((_, k) => `<i class="${k + 1 < n ? 'done' : k + 1 === n ? 'now' : ''}"></i>`).join('');
  ipDetail.innerHTML = `<div class="num">${String(n).padStart(2, '0')}</div>
    <p class="phase">${esc(phase[0])}</p>
    <h3>${esc(IP_FLOW[n - 1])}</h3>
    <div class="segs" aria-hidden="true">${segs}</div>
    <p class="muted">Step ${n} of ${IP_FLOW.length}</p>`;
}
if (window.BranchedMenu) {
  BranchedMenu.create($('#ipFlow'), {
    label: 'Patent workflow steps',
    items: IP_PHASES.map(p => ({
      label: p[0],
      children: IP_FLOW.slice(p[1], p[2]).map((s, k) => ({ value: p[1] + k + 1, num: p[1] + k + 1, label: s }))
    })),
    defaultOpen: [0, 1, 2],
    defaultActive: 1,
    onSelect: v => showIpStep(v)
  });
  showIpStep(1);
} else {
  $('#ipFlow').innerHTML = `<ol class="flow">${IP_FLOW.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
}
const catTabs = $('#catTabs'), catList = $('#catList');
function showCat(k) {
  [...catTabs.children].forEach(b => b.setAttribute('aria-selected', b.textContent === k));
  catList.innerHTML = CATALOGUE[k].map(t => `<li>${esc(t)}</li>`).join('');
}
Object.keys(CATALOGUE).forEach(k => {
  const b = el('button', { type: 'button', role: 'tab' }, esc(k));
  b.addEventListener('click', () => showCat(k));
  catTabs.append(b);
});
showCat('AI, ML and computing');

/* ---------- QUALITY / WHY ---------- */
$('#quality').innerHTML = QUALITY.map(q => `<tr><td>${esc(q[0])}</td><td>${esc(q[1])}</td></tr>`).join('');
$('#why').innerHTML = WHY.map(w => `<li>${esc(w)}</li>`).join('');
$('#students').innerHTML = STUDENTS.map(s => `<li><b>${esc(s[0])}.</b> ${esc(s[1])}</li>`).join('');

/* ---------- CONTACT ---------- */
const EMAIL = 'nexorasolutionsadmin@gmail.com';
$('#fType').innerHTML = ['Website', 'Mobile app', 'AI or automation', 'Product design and development', 'Patent or documentation support', 'Custom software', 'IoT or embedded system', 'Not sure yet'].map(t => `<option>${t}</option>`).join('');
const toast = $('#toast');
function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 2200); }
async function copyText(text, fallbackEl) {
  try { await navigator.clipboard.writeText(text); say('Copied'); }
  catch { if (fallbackEl) { fallbackEl.focus(); fallbackEl.select(); } say('Press Ctrl+C to copy'); }
}
$('#copyMail').addEventListener('click', () => copyText(EMAIL));
$('#enq').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#fName').value.trim(), mail = $('#fMail').value.trim(), msg = $('#fMsg').value.trim(), type = $('#fType').value;
  const err = $('#fErr');
  if (!name || !/^\S+@\S+\.\S+$/.test(mail) || !msg) {
    err.textContent = !name ? 'Enter your name.' : !/^\S+@\S+\.\S+$/.test(mail) ? 'Enter a valid email address.' : 'Describe your idea in a sentence or two.';
    return;
  }
  err.textContent = '';
  const subject = `Project enquiry: ${type}`;
  const body = `Hello Nexora Solutions,\n\nName: ${name}\nEmail: ${mail}\nNeed: ${type}\n\n${msg}\n`;
  $('#outText').value = `To: ${EMAIL}\nSubject: ${subject}\n\n${body}`;
  $('#mailto').href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  $('#out').hidden = false;
  $('#out').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
});
$('#copyEnq').addEventListener('click', () => copyText($('#outText').value, $('#outText')));

/* mobile menu */
const menuBtn = $('#menuBtn'), nav = $('#nav');
menuBtn.addEventListener('click', () => { const o = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });
nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });

/* ---------- INTRO VIDEO ---------- */
/* Plays assets/intro.mp4 full-screen on load, then reveals the site.
   Ends on: video finished, Skip button, Escape, a load error, or a safety timeout. */
const root = document.documentElement, intro = $('#intro'), vid = $('#introVideo');
let introTimers = [];
function endIntro() {
  if (!root.classList.contains('intro-on') || intro.classList.contains('out')) return;
  introTimers.forEach(clearTimeout); introTimers = [];
  vid.pause();
  intro.classList.add('out');
  setTimeout(() => { root.classList.remove('intro-on'); intro.classList.remove('out'); }, 700);
}
function playIntro() {
  if (reduce) return;
  root.classList.add('intro-on'); intro.classList.remove('out');
  vid.currentTime = 0;
  introTimers.forEach(clearTimeout);
  /* if the video has not started within 6s (slow network / bad file), do not block the site */
  introTimers = [setTimeout(() => { if (vid.paused || vid.currentTime === 0) endIntro(); }, 6000)];
  const p = vid.play();
  if (p && p.catch) p.catch(endIntro);   /* autoplay refused: skip straight to the site */
}
vid.addEventListener('ended', endIntro);
vid.addEventListener('error', endIntro);   /* file missing or unplayable */
$('#skipIntro').addEventListener('click', endIntro);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('intro-on')) endIntro(); });
$('#replay').addEventListener('click', () => { scrollTo({ top: 0 }); playIntro(); });
if (root.classList.contains('intro-on')) playIntro();
