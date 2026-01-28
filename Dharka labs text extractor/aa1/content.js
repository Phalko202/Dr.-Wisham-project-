// Content script to extract lab test data from the page
console.log('Lab Test Extractor: Content script loaded');

// Test categories
function categorizeTest(testName) {
  const test = testName.toUpperCase().trim();
  
  const hemogram = ['HB', 'HEMOGLOBIN', 'RBC', 'WBC', 'PLATELET', 'PLT', 'HCT', 'PCV', 'MCV', 'MCH', 'MCHC', 'RDW', 'NRBC', 'MPV'];
  const differential = ['NEUTROPHIL', 'LYMPHOCYTE', 'MONOCYTE', 'EOSINOPHIL', 'BASOPHIL', 'BAND', 'BLAST'];
  const inflammatory = ['CRP', 'C-REACTIVE', 'ESR', 'PROCALCITONIN'];
  const lft = ['SGOT', 'SGPT', 'AST', 'ALT', 'ALP', 'BILIRUBIN', 'ALBUMIN', 'GLOBULIN', 'GGT'];
  const rft = ['UREA', 'CREATININE', 'URIC ACID', 'BUN', 'SODIUM', 'POTASSIUM', 'CHLORIDE'];
  const dengue = ['DENGUE', 'NS1', 'IGG', 'IGM'];
  
  if (hemogram.some(h => test.includes(h))) return 'COMPLETE HEMOGRAM';
  if (differential.some(d => test.includes(d))) return 'DIFFERENTIAL COUNT';
  if (inflammatory.some(i => test.includes(i))) return 'INFLAMMATORY MARKERS';
  if (lft.some(l => test.includes(l))) return 'LIVER FUNCTION TESTS';
  if (rft.some(r => test.includes(r))) return 'RENAL FUNCTION TESTS';
  if (dengue.some(d => test.includes(d))) return 'DENGUE PROFILE';
  
  return 'OTHER TESTS';
}

// Check if value is within normal range
function isWithinNormal(result, refRange) {
  if (!result || !refRange) return false;
  
  const value = parseFloat(result);
  if (isNaN(value)) return false;
  
  const range = refRange.trim();
  
  // Handle < format
  if (range.startsWith('<')) {
    const limit = parseFloat(range.replace('<', '').trim());
    return value < limit;
  }
  
  // Handle > format
  if (range.startsWith('>')) {
    const limit = parseFloat(range.replace('>', '').trim());
    return value > limit;
  }
  
  // Handle range format (e.g., "4.00-5.50" or "4.0 - 11.0")
  const rangeMatch = range.match(/([0-9.]+)\s*[-–]\s*([0-9.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return value >= min && value <= max;
  }
  
  return false;
}

// Main extraction function
function extractLabTestData() {
  console.log('Starting extraction...');
  
  const data = {
    testResults: [],
    categorizedTests: {},
    extracted: false
  };

  try {
    // Find ALL rows in the page that contain test data
    const allRows = document.querySelectorAll('tr');
    console.log('Found ' + allRows.length + ' table rows');
    
    allRows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      
      // Need at least 4 cells (Test Name, LIS Result, Unit, Reference Range)
      if (cells.length >= 4) {
        const testName = cells[0]?.textContent?.trim();
        const lisResult = cells[1]?.textContent?.trim();
        const unit = cells[2]?.textContent?.trim();
        const refRange = cells[3]?.textContent?.trim();
        
        // Skip header rows or empty rows
        if (!testName || !lisResult || testName === 'Test Name' || testName === '') {
          return;
        }
        
        // Skip if result looks like a header
        if (lisResult === 'LIS Result' || lisResult === 'Result') {
          return;
        }
        
        // Check if it's a valid test (has a numeric result or known test name)
        const hasNumericResult = !isNaN(parseFloat(lisResult));
        if (!hasNumericResult) {
          return;
        }
        
        console.log('Found test: ' + testName + ' = ' + lisResult);
        
        // Determine if WNL or show value
        const isNormal = isWithinNormal(lisResult, refRange);
        const displayValue = isNormal ? 'WNL' : lisResult;
        
        // Categorize
        const category = categorizeTest(testName);
        
        const testData = {
          testName: testName,
          result: lisResult,
          displayValue: displayValue,
          category: category
        };
        
        data.testResults.push(testData);
        
        if (!data.categorizedTests[category]) {
          data.categorizedTests[category] = [];
        }
        data.categorizedTests[category].push(testData);
      }
    });
    
    data.extracted = data.testResults.length > 0;
    console.log('Extracted ' + data.testResults.length + ' tests');
    
  } catch (error) {
    console.error('Extraction error:', error);
  }

  return data;
}

// Format output as simple text
function formatLabTestData(data) {
  if (!data.extracted || data.testResults.length === 0) {
    return 'No lab test data found on this page.';
  }

  let output = 'LAB TEST RESULTS\n';
  output += '═══════════════════════════════════\n\n';

  const categories = Object.keys(data.categorizedTests).sort();
  
  categories.forEach(category => {
    const tests = data.categorizedTests[category];
    output += category + '\n';
    
    tests.forEach(test => {
      output += '  ' + test.testName + ': ' + test.displayValue + '\n';
    });
    
    output += '\n';
  });

  return output;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.action);
  
  if (request.action === 'extractData') {
    const extractedData = extractLabTestData();
    const formattedText = formatLabTestData(extractedData);
    
    console.log('Sending response with ' + extractedData.testResults.length + ' tests');
    
    sendResponse({
      success: extractedData.extracted,
      data: extractedData,
      formattedText: formattedText
    });
  }
  return true;
});

console.log('Lab Test Extractor: Ready');
