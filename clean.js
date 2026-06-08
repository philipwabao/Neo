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

  // Replace colors
  content = content.replace(/#B8541F/g, '#2563EB'); // blue-600
  content = content.replace(/#8B3F13/g, '#1E40AF'); // blue-800
  content = content.replace(/#111111/g, '#0F172A'); // slate-900
  content = content.replace(/#111(?![0-9a-fA-F])/g, '#0F172A'); // slate-900
  content = content.replace(/#555/g, '#475569'); // slate-600
  content = content.replace(/#666/g, '#64748B'); // slate-500
  content = content.replace(/#999/g, '#94A3B8'); // slate-400
  content = content.replace(/#FAFAFA/g, '#F8FAFC'); // slate-50
  content = content.replace(/#EAEAEA/g, '#E2E8F0'); // slate-200

  // Replace typography and slop terminology
  content = content.replace(/font-newsreader/g, 'font-sans font-bold');
  content = content.replace(/Neognathae/g, 'Auxerta API');
  content = content.replace(/Kestrel/g, 'Text Classifier');
  content = content.replace(/Weights as a Service/g, 'Enterprise AI Infrastructure');
  content = content.replace(/The catalogue/g, 'Platform Capabilities');
  content = content.replace(/We build narrow, and go deep\./g, 'Built for Scale and Precision.');
  content = content.replace(/More underway\./g, 'Scalable architecture.');
  content = content.replace(/Pl\. 02/g, 'Fig 1');
  content = content.replace(/Pl\. 01/g, 'Fig 1');
  content = content.replace(/Carried by the flock/g, 'High-Throughput Processing');
  content = content.replace(/An engraving of a sailing ship carried across the sky by a flock of birds/g, 'A diagram representing distributed cloud processing');

  fs.writeFileSync(file, content);
}
console.log('Done');
