/**
 * Writes public/organogram-snapshot.json from the built-in seed tree.
 * Run from hrms_wireframe: node scripts/export-organogram-seed.mjs
 *
 * Note: This is a minimal export; for full parity run the app and use Export JSON on the mapping page.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'organogram-snapshot.json')

// Seed is maintained in TS — use Export JSON from Organogram mapping after `npm run dev` for live data.
const readme = {
  _note:
    'Replace this file via Organogram mapping → Export JSON, or edit navttcOrgMapping.ts then export from the app.',
  nodes: [],
}

writeFileSync(out, JSON.stringify(readme, null, 2))
console.log(`Wrote placeholder ${out}`)
console.log('Use the app: Organogram mapping → Export JSON, then save over this file.')
