// Popup script for Lab Test Extractor

let extractedText = '';

const extractBtn = document.getElementById('extractBtn');
const copyBtn = document.getElementById('copyBtn');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');

// Extraction function that runs in the page context
function extractFromPage() {
  const results = [];

  const getCellText = (cell) => (cell?.innerText || cell?.textContent || '').trim();
  const getResultValue = (cell) => {
    if (!cell) return '';
    const input = cell.querySelector('input');
    if (input) return (input.value || '').trim();
    const select = cell.querySelector('select');
    if (select) return (select.value || '').trim();
    return getCellText(cell);
  };

  const isWithinNormal = (result, refRange) => {
    if (!result || !refRange) return false;
    const value = parseFloat(result);
    if (Number.isNaN(value)) return false;

    const range = (refRange || '').trim();

    if (range.startsWith('<')) {
      const limit = parseFloat(range.slice(1).trim());
      return !Number.isNaN(limit) && value < limit;
    }

    if (range.startsWith('>')) {
      const limit = parseFloat(range.slice(1).trim());
      return !Number.isNaN(limit) && value > limit;
    }

    const match = range.match(/([0-9.]+)\s*[-–]\s*([0-9.]+)/);
    if (match) {
      const min = parseFloat(match[1]);
      const max = parseFloat(match[2]);
      if (Number.isNaN(min) || Number.isNaN(max)) return false;
      return value >= min && value <= max;
    }

    return false;
  };

  // Find the correct table by locating a header row containing "Test Name" and "LIS Result"
  const tables = Array.from(document.querySelectorAll('table'));
  let found = null;

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const headerCells = Array.from(rows[r].querySelectorAll('th, td'));
      if (headerCells.length === 0) continue;

      const headerTexts = headerCells.map((c) => getCellText(c));
      const testNameIndex = headerTexts.findIndex((t) => t === 'Test Name');
      const lisResultIndex = headerTexts.findIndex((t) => t === 'LIS Result');
      const referenceRangeIndex = headerTexts.findIndex((t) => t === 'Reference Range');

      if (testNameIndex >= 0 && lisResultIndex >= 0) {
        found = {
          table,
          headerRowIndex: r,
          testNameIndex,
          lisResultIndex,
          referenceRangeIndex,
        };
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    return results;
  }

  const tableRows = Array.from(found.table.querySelectorAll('tr')).slice(found.headerRowIndex + 1);

  for (const row of tableRows) {
    const cells = row.querySelectorAll('td');
    if (!cells || cells.length === 0) continue;

    const testName = getCellText(cells[found.testNameIndex]);
    const lisResultRaw = getResultValue(cells[found.lisResultIndex]);
    const referenceRange = found.referenceRangeIndex >= 0 ? getCellText(cells[found.referenceRangeIndex]) : '';

    if (!testName || testName === 'Test Name') continue;
    if (!lisResultRaw || lisResultRaw === 'LIS Result') continue;

    const normal = isWithinNormal(lisResultRaw, referenceRange);
    results.push({
      testName,
      result: lisResultRaw,
      displayValue: normal ? 'WNL' : lisResultRaw,
    });
  }

  return results;
}

// Extract data from page
extractBtn.addEventListener('click', async () => {
  statusDiv.innerHTML = '<p>Extracting data...</p>';
  extractBtn.disabled = true;
  outputDiv.textContent = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('dharaka.hmh.mv')) {
      statusDiv.innerHTML = '<p style="color: #f44336;">Please navigate to dharaka.hmh.mv</p>';
      extractBtn.disabled = false;
      return;
    }

    // Inject and execute the extraction script directly
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFromPage
    });

    if (results && results[0] && results[0].result && results[0].result.length > 0) {
      const testResults = results[0].result;
      
      // Categorize tests
      const categories = {};
      testResults.forEach(test => {
        const name = test.testName.toUpperCase();
        let category = 'OTHER TESTS';
        
        if (['HB', 'RBC', 'WBC', 'HCT', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'NRBC', 'PLATELET', 'PLT'].some(h => name.includes(h))) {
          category = 'COMPLETE HEMOGRAM';
        } else if (['NEUTROPHIL', 'LYMPHOCYTE', 'MONOCYTE', 'EOSINOPHIL', 'BASOPHIL'].some(d => name.includes(d))) {
          category = 'DIFFERENTIAL COUNT';
        } else if (['CRP', 'C-REACTIVE', 'ESR'].some(i => name.includes(i))) {
          category = 'INFLAMMATORY MARKERS';
        }
        
        if (!categories[category]) categories[category] = [];
        categories[category].push(test);
      });
      
      // Format output
      let output = 'LAB TEST RESULTS\n';
      output += '═══════════════════════════════════\n\n';
      
      Object.keys(categories).sort().forEach(cat => {
        output += cat + '\n';
        categories[cat].forEach(test => {
          output += '  ' + test.testName + ': ' + test.displayValue + '\n';
        });
        output += '\n';
      });
      
      extractedText = output;
      outputDiv.textContent = output;
      statusDiv.innerHTML = '<p style="color: #4caf50;">Extracted ' + testResults.length + ' tests</p>';
      copyBtn.disabled = false;
    } else {
      statusDiv.innerHTML = '<p style="color: #ff9800;">No test results found</p>';
      outputDiv.textContent = 'No data found';
    }

    extractBtn.disabled = false;
  } catch (error) {
    console.error(error);
    statusDiv.innerHTML = '<p style="color: #f44336;">Error: ' + error.message + '</p>';
    extractBtn.disabled = false;
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  if (extractedText) {
    navigator.clipboard.writeText(extractedText).then(() => {
      statusDiv.innerHTML = '<p style="color: #4caf50;">Copied to clipboard!</p>';
      setTimeout(() => {
        statusDiv.innerHTML = '<p style="color: #4caf50;">Extracted ' + extractedText.split('\n').filter(l => l.startsWith('  ')).length + ' tests</p>';
      }, 2000);
    });
  }
});
