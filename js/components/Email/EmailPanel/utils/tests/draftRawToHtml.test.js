import draftRawToHtml from '../draftRawToHtml';
import {
  testJson1,
  testResult1,
  testJson2,
  testResult2,
} from './sampleTemplates';

const escapeHtml = html => html.replace(/"/g, "&quot;").replace(/'/g, "\\'").replace(/\n/g, '\\n');


test('basic template with 2 paragraphs', () => {
  expect(draftRawToHtml(testJson1)).toBe(testResult1);
});


test('complex template with font-size, bold, italic, images, and entities', () => {
  expect(escapeHtml(draftRawToHtml(testJson2))).toBe(escapeHtml(testResult2));
});


