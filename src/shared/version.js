'use strict';

// Patchfeld counter versioning: 0.0.1 → … → 0.0.9 → 0.1.0 → … → 0.9.9 → 1.0.0.
// Minor and patch are single digits (0–9); major grows without limit.
// Every result is valid semver, so electron-updater orders versions correctly.
const PATTERN = /^(\d+)\.(\d)\.(\d)$/;

function parseVersion(version) {
  const match = PATTERN.exec(String(version).trim());
  if (!match) {
    throw new Error(`Ungültige Version "${version}" – erwartet X.Y.Z, Y und Z jeweils 0–9.`);
  }
  return match.slice(1).map(Number);
}

function isValidVersion(version) {
  try {
    parseVersion(version);
    return true;
  } catch {
    return false;
  }
}

function nextVersion(version) {
  let [major, minor, patch] = parseVersion(version);
  patch += 1;
  if (patch > 9) {
    patch = 0;
    minor += 1;
  }
  if (minor > 9) {
    minor = 0;
    major += 1;
  }
  return `${major}.${minor}.${patch}`;
}

module.exports = { parseVersion, isValidVersion, nextVersion };
