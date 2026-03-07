import fs from 'fs'
import path from 'path'

const dir = 'd:/Coherence/Chronos/src/components/landing-v2'
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'))

for (const file of files) {
  const filePath = path.join(dir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  
  content = content.replace(/py-32/g, 'py-16 lg:py-24')
  content = content.replace(/py-28/g, 'py-16 lg:py-20')
  content = content.replace(/pt-36/g, 'pt-24')
  content = content.replace(/pt-28/g, 'pt-20 lg:pt-24')
  
  fs.writeFileSync(filePath, content)
}
console.log('Reduced spacing across sections')
