const EXAMPLES = {
  diagram1: {
    specPath: '../specs/diagram1.spec.json',
    stylePath: '../specs/diagram1.style.css',
    title: 'Diagram 1: Multi-track vital signs'
  },
  diagram2: {
    specPath: '../specs/diagram2.spec.json',
    stylePath: '../specs/diagram2.style.css',
    title: 'Diagram 2: 24h pulse and respiration'
  },
  diagram3: {
    specPath: '../specs/diagram3.spec.json',
    stylePath: '../specs/diagram3.style.css',
    title: 'Diagram 3: Monthly long-term trend'
  }
};

export function getExampleConfigs() {
  return EXAMPLES;
}

export async function loadSpec(name) {
  const example = EXAMPLES[name];
  if (!example) {
    throw new Error(`Unknown example: ${name}`);
  }
  const response = await fetch(example.specPath);
  if (!response.ok) {
    throw new Error(`Failed to load spec ${example.specPath}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export function applyExampleStyle(name) {
  const example = EXAMPLES[name];
  if (!example) {
    throw new Error(`Unknown example: ${name}`);
  }

  const existing = document.getElementById('diagram-style-link');
  if (existing) {
    existing.remove();
  }

  const link = document.createElement('link');
  link.id = 'diagram-style-link';
  link.rel = 'stylesheet';
  link.href = example.stylePath;
  document.head.appendChild(link);
}

export async function initExample(name) {
  applyExampleStyle(name);
  return loadSpec(name);
}

export async function validateExamples() {
  const names = Object.keys(EXAMPLES);
  const results = await Promise.allSettled(names.map((name) => loadSpec(name)));
  const summary = { ok: [], failed: [] };

  results.forEach((result, index) => {
    const name = names[index];
    if (result.status === 'fulfilled') {
      summary.ok.push(name);
      console.info(`[example-validation] ${name}: ok`);
    } else {
      summary.failed.push({ name, reason: result.reason });
      console.error(`[example-validation] ${name}: failed`, result.reason);
    }
  });

  return summary;
}
