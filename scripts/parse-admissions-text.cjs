#!/usr/bin/env node
/** Parse free-text admission requirements into structured numeric/boolean fields. */

function parseEnglishRequirements(text) {
  if (!text) return {};
  const t = text.toLowerCase();
  const out = {};

  const ielts = t.match(/ielts\s*(\d+(?:\.\d+)?)/);
  if (ielts) out.ieltsMinScore = parseFloat(ielts[1]);

  const toefl = t.match(/toefl\s*(\d+)/);
  if (toefl) out.toeflMinScore = parseInt(toefl[1], 10);

  if (/cambridge\s*c1|cae/i.test(text)) out.cambridgeEnglishLevel = "C1";
  else if (/cambridge\s*c2|proficiency/i.test(text)) out.cambridgeEnglishLevel = "C2";
  else if (/cambridge\s*b2/i.test(text)) out.cambridgeEnglishLevel = "B2";

  return out;
}

function parseFrenchRequirements(text) {
  if (!text) return {};
  const out = {};
  const delf = text.match(/delf\s*([bc][12])/i);
  if (delf) out.delfLevel = delf[1].toUpperCase();
  const dalf = text.match(/dalf\s*([c][12])/i);
  if (dalf) out.dalfLevel = dalf[1].toUpperCase();
  return out;
}

module.exports = { parseEnglishRequirements, parseFrenchRequirements };
