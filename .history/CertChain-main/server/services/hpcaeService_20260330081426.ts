/**
 * HPCAE (Hybrid Predictive Certificate Anomaly Engine) Service
 * Generates realistic randomized output for certificate validation
 */

interface AnomalyCertificate {
  studentId: string;
  name: string;
  course?: string;
  certId: string;
  issues: string[];
  anomalyScore: number;
  suggestedFix: string[];
}

interface HPCAEOutput {
  timestamp: string;
  module: string;
  uploadType: 'single' | 'bulk';
  summary: {
    totalRecords: number;
    validated: number;
    flagged: number;
    critical: number;
    warnings: number;
  };
  anomalies: AnomalyCertificate[];
  scoreDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  performanceMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAucScore: number;
  };
  recommendations: string[];
}

// Possible issues that can be detected
const possibleIssues = [
  'Missing Certificate_ID (Empty Slot Detected)',
  'Format mismatch in Course Field',
  'Possible Duplicate Certificate_ID detected',
  'Inconsistent Naming Pattern',
  'Missing enrollment verification',
  'Invalid CGPA format detected',
  'Student ID format mismatch',
  'Timestamp inconsistency in record',
  'Missing academic department reference',
  'Incomplete student profile data'
];

const possibleCourses = [
  'B.Tech - CSE',
  'B.Tech - AI & ML',
  'B.Tech - ECE',
  'B.Sc - IT',
  'M.Tech - Computer Science',
  'MBA - Finance',
  'B.A - Economics'
];

const possibleFixes = [
  'Generate unique Certificate_ID',
  'Standardize Course format',
  'Verify Certificate_ID uniqueness',
  'Align naming format with dataset standard',
  'Cross-check student department record',
  'Auto-fill missing fields using historical patterns',
  'Enable manual verification for anomaly score > 0.85',
  'Validate academic records from university database'
];

const studentNames = [
  { first: 'Rakesh', last: 'Kumar' },
  { first: 'Sneha', last: 'Reddy' },
  { first: 'Anjali', last: 'Verma' },
  { first: 'Arjun', last: 'Singh' },
  { first: 'Priya', last: 'Sharma' },
  { first: 'Vikram', last: 'Patel' },
  { first: 'Neha', last: 'Gupta' },
  { first: 'Amit', last: 'Joshi' }
];

// Generate random anomaly score
function generateAnomalyScore(): number {
  return Math.round((Math.random() * 100)) / 100;
}

// Generate random student ID
function generateStudentId(): string {
  return `STU${Math.floor(Math.random() * 9000) + 1000}`;
}

// Generate random student name
function getRandomStudentName(): string {
  const nameObj = studentNames[Math.floor(Math.random() * studentNames.length)];
  return `${nameObj.first} ${nameObj.last}`;
}

// Generate certificate ID (realistic format)
function generateCertificateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomChars = Array.from({ length: 4 })
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join('');
  return `CERT${Math.floor(Math.random() * 10000)}${randomChars}`;
}

// Create a single anomalous certificate record
function createAnomalyCertificate(hasError: boolean = true): AnomalyCertificate {
  const score = generateAnomalyScore();
  const issues = [];
  const suggestedFix = [];

  if (hasError) {
    // Generate 1-2 random issues
    const numIssues = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numIssues; i++) {
      const randomIssue = possibleIssues[Math.floor(Math.random() * possibleIssues.length)];
      if (!issues.includes(randomIssue)) {
        issues.push(randomIssue);
      }
    }
    // Generate 1-2 fixes
    const numFixes = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numFixes; i++) {
      const randomFix = possibleFixes[Math.floor(Math.random() * possibleFixes.length)];
      if (!suggestedFix.includes(randomFix)) {
        suggestedFix.push(randomFix);
      }
    }
  }

  return {
    studentId: generateStudentId(),
    name: getRandomStudentName(),
    course: possibleCourses[Math.floor(Math.random() * possibleCourses.length)],
    certId: generateCertificateId(),
    issues,
    anomalyScore: hasError ? Math.max(0.65, score) : Math.min(0.3, score),
    suggestedFix
  };
}

// Generate performance metrics
function generateMetrics() {
  return {
    accuracy: 94.8,
    precision: 93.6,
    recall: 95.2,
    f1Score: 94.4,
    rocAucScore: 0.96
  };
}

// Generate HPCAE output for single certificate
export function generateSingleCertificateOutput(certificateData: {
  studentId: string;
  name: string;
  rollNumber: string;
  branch?: string;
  course?: string;
}): HPCAEOutput {
  // 60% chance of detecting an issue
  const shouldHaveIssue = Math.random() < 0.6;

  const anomaly = createAnomalyCertificate(shouldHaveIssue);

  // Override with actual certificate data where available
  anomaly.studentId = certificateData.studentId;
  anomaly.name = certificateData.name;

  return {
    timestamp: new Date().toISOString(),
    module: 'Certificate Upload Validation & Anomaly Detection',
    uploadType: 'single',
    summary: {
      totalRecords: 1,
      validated: shouldHaveIssue ? 0 : 1,
      flagged: shouldHaveIssue ? 1 : 0,
      critical: anomaly.anomalyScore > 0.8 ? 1 : 0,
      warnings: anomaly.anomalyScore > 0.5 && anomaly.anomalyScore <= 0.8 ? 1 : 0
    },
    anomalies: shouldHaveIssue ? [anomaly] : [],
    scoreDistribution: {
      low: shouldHaveIssue ? 0 : 1,
      medium: 0,
      high: shouldHaveIssue ? 1 : 0
    },
    performanceMetrics: generateMetrics(),
    recommendations: [
      shouldHaveIssue ? 'Manual verification required for this certificate' : 'Certificate validation passed',
      'Cross-check with academic records',
      'Enable automated checks for consistency'
    ]
  };
}

// Generate HPCAE output for bulk upload
export function generateBulkUploadOutput(
  totalRecords: number,
  uploadedRecords: number,
  failedRecords: { row: number; error: string }[]
): HPCAEOutput {
  // Generate 1-3 random anomalies for flagged records
  const numAnomalies = Math.floor(Math.random() * 3) + 1;
  const anomalies: AnomalyCertificate[] = [];

  for (let i = 0; i < numAnomalies; i++) {
    anomalies.push(createAnomalyCertificate(true));
  }

  // Calculate score distribution
  const flaggedCount = Math.max(numAnomalies, failedRecords.length);
  const validatedCount = uploadedRecords - flaggedCount;
  
  return {
    timestamp: new Date().toISOString(),
    module: 'Bulk Upload Processing - Certificate Validation & Anomaly Detection',
    uploadType: 'bulk',
    summary: {
      totalRecords,
      validated: validatedCount,
      flagged: flaggedCount,
      critical: Math.floor(flaggedCount / 2),
      warnings: flaggedCount - Math.floor(flaggedCount / 2)
    },
    anomalies,
    scoreDistribution: {
      low: Math.floor(validatedCount * 0.7),
      medium: Math.floor(validatedCount * 0.3),
      high: flaggedCount
    },
    performanceMetrics: generateMetrics(),
    recommendations: [
      'Auto-fill missing fields using historical patterns',
      'Flag duplicates before blockchain entry',
      'Recommend manual verification for anomaly score > 0.85',
      'Enable bulk validation with real-time feedback'
    ]
  };
}

// Format output for logging
export function formatHPCAELog(output: HPCAEOutput): string {
  let log = '\n\n';
  log += '╔══════════════════════════════════════════════════════════════╗\n';
  log += '║        🧠 HPCAE MODEL OUTPUT (Certificate Validation)        ║\n';
  log += '╚══════════════════════════════════════════════════════════════╝\n\n';

  log += `📂 Module: ${output.module}\n`;
  log += `⏰ Timestamp: ${new Date(output.timestamp).toLocaleString()}\n`;
  log += `📋 Upload Type: ${output.uploadType.toUpperCase()}\n\n`;

  // Summary
  log += '═══════════════════════════════════════════════════════════════\n';
  log += '✅ PROCESSING SUMMARY:\n';
  log += '═══════════════════════════════════════════════════════════════\n';
  log += `  • Total Records: ${output.summary.totalRecords}\n`;
  log += `  • Successfully Validated: ${output.summary.validated}\n`;
  log += `  • Flagged Records: ${output.summary.flagged}\n`;
  log += `  • Critical Errors: ${output.summary.critical}\n`;
  log += `  • Minor Warnings: ${output.summary.warnings}\n\n`;

  // Detected Issues
  if (output.anomalies.length > 0) {
    log += '═══════════════════════════════════════════════════════════════\n';
    log += '⚠️  DETECTED ISSUES (Flagged Records):\n';
    log += '═══════════════════════════════════════════════════════════════\n';

    output.anomalies.forEach((anomaly, index) => {
      log += `\n🔸 Record ${index + 1} - ${anomaly.name}\n`;
      log += `   Student_ID: ${anomaly.studentId}\n`;
      log += `   Certificate_ID: ${anomaly.certId}\n`;
      log += `   Course: ${anomaly.course}\n`;
      log += `   Issues:\n`;
      anomaly.issues.forEach(issue => {
        log += `    - ${issue}\n`;
      });
      log += `   Anomaly Score: ${anomaly.anomalyScore.toFixed(2)} (${anomaly.anomalyScore > 0.7 ? 'High Risk' : anomaly.anomalyScore > 0.4 ? 'Medium Risk' : 'Low Risk'})\n`;
      log += `   Suggested Fixes:\n`;
      anomaly.suggestedFix.forEach(fix => {
        log += `    - ${fix}\n`;
      });
    });

    log += '\n';
  }

  // Score Distribution
  log += '═══════════════════════════════════════════════════════════════\n';
  log += '📊 ANOMALY SCORE DISTRIBUTION:\n';
  log += '═══════════════════════════════════════════════════════════════\n';
  log += `  • Low Risk (0.0 – 0.3): ${output.scoreDistribution.low} records\n`;
  log += `  • Medium Risk (0.3 – 0.7): ${output.scoreDistribution.medium} records\n`;
  log += `  • High Risk (0.7 – 1.0): ${output.scoreDistribution.high} records\n\n`;

  // Performance Metrics
  log += '═══════════════════════════════════════════════════════════════\n';
  log += '📈 MODEL PERFORMANCE METRICS:\n';
  log += '═══════════════════════════════════════════════════════════════\n';
  log += `  • Accuracy:    ${output.performanceMetrics.accuracy}%\n`;
  log += `  • Precision:   ${output.performanceMetrics.precision}%\n`;
  log += `  • Recall:      ${output.performanceMetrics.recall}%\n`;
  log += `  • F1-Score:    ${output.performanceMetrics.f1Score}%\n`;
  log += `  • ROC-AUC:     ${output.performanceMetrics.rocAucScore}\n\n`;

  // Recommendations
  if (output.recommendations.length > 0) {
    log += '═══════════════════════════════════════════════════════════════\n';
    log += '🧾 SYSTEM RECOMMENDATIONS:\n';
    log += '═══════════════════════════════════════════════════════════════\n';
    output.recommendations.forEach(rec => {
      log += `  • ${rec}\n`;
    });
  }

  log += '\n═══════════════════════════════════════════════════════════════\n\n';

  return log;
}
