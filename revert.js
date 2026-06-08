import fs from 'fs';

const files = [
  'src/App.tsx',
  'src/components/SSMBenefits.tsx',
  'src/components/ClassifierDemo.tsx',
  'src/components/SecurityDiagram.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Revert naming
  content = content.replace(/Auxerta API/g, 'Neognathae');
  content = content.replace(/Text Classifier/g, 'Kestrel');

  fs.writeFileSync(file, content);
}
console.log('Done reverting names');
