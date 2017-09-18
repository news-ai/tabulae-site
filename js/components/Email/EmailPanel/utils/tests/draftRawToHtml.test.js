import draftRawToHtml from '../draftRawToHtml';
import {
  testJson1,
  testResult1,
  testJson2,
  testResult2,
  testJson3,
  testResult3,
} from './sampleTemplates';

const escapeHtml = html => html.replace(/"/g, "&quot;").replace(/'/g, "\\'").replace(/\n/g, '\\n');

test('basic template with 2 paragraphs', () => {
  expect(draftRawToHtml(testJson1)).toBe(testResult1);
});

test('complex template with differnt font-sizes, bold, italic, images, and link entities', () => {
  expect(escapeHtml(draftRawToHtml(testJson2))).toBe(escapeHtml(testResult2));
});

test('basic template with 3 grafs of different alignments: left, middle, right', () => {
  expect(escapeHtml(draftRawToHtml(testJson3))).toBe(escapeHtml(testResult3));
});
