#!/usr/bin/env ts-node
/**
 * HPCAE Service Test File
 * 
 * This file demonstrates and tests the HPCAE (Hybrid Predictive Certificate Anomaly Engine) output
 * Run with: npx ts-node server/services/hpcaeService.test.ts
 */

import { generateSingleCertificateOutput, generateBulkUploadOutput, formatHPCAELog } from './hpcaeService';

console.log('\n\n');
console.log('╔════════════════════════════════════════════════════════════════════════╗');
console.log('║                HPCAE SERVICE TEST & DEMONSTRATION                      ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝');

console.log('\n\n█████████████████████████████████████████████████████████████████████████████');
console.log('TEST 1: SINGLE CERTIFICATE UPLOAD OUTPUT (Random Format)');
console.log('█████████████████████████████████████████████████████████████████████████████');

const singleOutput = generateSingleCertificateOutput({
  studentId: 'STU1234',
  name: 'Anjali Verma',
  rollNumber: 'ROLL1234',
  branch: 'Computer Science',
  course: 'B.Tech - AI & ML'
});

console.log(formatHPCAELog(singleOutput));

console.log('\n\n█████████████████████████████████████████████████████████████████████████████');
console.log('TEST 2: BULK UPLOAD OUTPUT (120 records with 6 flagged)');
console.log('█████████████████████████████████████████████████████████████████████████████');

const bulkOutput = generateBulkUploadOutput(
  120, // Total records
  114, // Successfully uploaded
  [
    { row: 27, error: 'Duplicate certificate detected' },
    { row: 45, error: 'Missing required fields' }
  ]
);

console.log(formatHPCAELog(bulkOutput));

console.log('\n\n█████████████████████████████████████████████████████████████████████████████');
console.log('TEST 3: ANOTHER SINGLE UPLOAD (Different Random Output Each Time)');
console.log('█████████████████████████████████████████████████████████████████████████████');

const anotherSingle = generateSingleCertificateOutput({
  studentId: 'STU5678',
  name: 'Arjun Singh',
  rollNumber: 'ROLL5678',
  branch: 'Electronics',
  course: 'B.Tech - ECE'
});

console.log(formatHPCAELog(anotherSingle));

console.log('\n\n✅ HPCAE Service Test Complete!');
console.log('📝 Note: Each test generates randomized anomalies and scores');
console.log('💡 These logs will be automatically printed during certificate uploads');
console.log('\n');
