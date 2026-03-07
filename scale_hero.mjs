import fs from 'fs'

const path = 'd:/Coherence/Chronos/src/components/landing-v2/Hero.tsx'
let content = fs.readFileSync(path, 'utf8')

// Replace for dashboard and canvas scale up
content = content.replace(/className="[^"]*"/g, (match) => {
  // Only scale classes in specific parts (from line 27 to 837)
  let newMatch = match
  newMatch = newMatch.replace(/text-\[8px\]/g, 'text-[10px]')
  newMatch = newMatch.replace(/text-\[9px\]/g, 'text-[11px]')
  newMatch = newMatch.replace(/text-\[10px\]/g, 'text-xs')
  newMatch = newMatch.replace(/text-\[11px\]/g, 'text-sm')
  newMatch = newMatch.replace(/text-\[12px\]/g, 'text-base')
  newMatch = newMatch.replace(/text-xs(?![A-Za-z0-9\-])/g, 'text-sm')
  newMatch = newMatch.replace(/text-sm/g, 'text-base')
  return newMatch
})

content = content.replace(/maxWidth: '620px'/g, "maxWidth: '800px'")
content = content.replace(/w-\[140px\]/g, 'w-[180px]')
content = content.replace(/max-w-5xl/g, 'max-w-7xl')
content = content.replace(/min-h-\[340px\]/g, 'min-h-[460px]')
content = content.replace(/lg:min-h-\[420px\]/g, 'lg:min-h-[580px]')
content = content.replace(/w-44/g, 'w-64') // Sidebar width

fs.writeFileSync(path, content)
console.log('Scaled Hero UI elements')
