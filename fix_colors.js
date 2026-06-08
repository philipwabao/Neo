import fs from 'fs';

const files = [
  'src/components/SSMBenefits.tsx',
  'src/components/ClassifierDemo.tsx',
  'src/components/SecurityDiagram.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/#2563EB/g, '#B8541F');
  content = content.replace(/#1E40AF/g, '#8B3F13');
  fs.writeFileSync(file, content);
}
console.log('Done');
