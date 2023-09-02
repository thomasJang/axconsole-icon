import { readdirSync } from 'fs';
import path from 'path';
import * as fs from 'fs';
import { camelCase, pascalCase } from 'change-case';

const projectName = 'AXFIcons';
const svgFiles = 'svgFiles';

export function generate() {
  const fileNames = readdirSync(path.join(svgFiles), {
    withFileTypes: true,
    encoding: 'utf-8',
  })
    .filter(p => p.isFile())
    .map(p => p.name);

  const componentNames: string[] = [];

  fileNames.forEach(fnm => {
    let svgContents = fs.readFileSync(path.join(svgFiles, fnm), {
      encoding: 'utf-8',
    });
    let tmpl = fs.readFileSync(path.join('src/common/component.tmpl'), {
      encoding: 'utf-8',
    });

    if (!fnm.endsWith('.svg')) return;
    const reactFileName = projectName + pascalCase(fnm.replace('.svg', ''));

    svgContents = svgContents.replace(/fill-opacity=/g, 'fillOpacity=');
    svgContents = svgContents.replace(/fill-rule=/g, 'fillRule=');
    svgContents = svgContents.replace(/clip-rule=/g, 'clipRule=');
    svgContents = svgContents.replace(/clip-path=/g, 'clipPath=');
    //
    //
    svgContents = svgContents.replace(/"/g, "'");

    tmpl = tmpl.replace(/{{COMPONENT_NAME}}/g, reactFileName);
    tmpl = tmpl.replace(/{{SVG_CONTENTS}}/g, svgContents);

    fs.mkdirSync(path.join('src/components'), { recursive: true });
    fs.writeFileSync(
      path.join('src/components', reactFileName + '.tsx'),
      tmpl,
      { encoding: 'utf-8' },
    );

    componentNames.push(reactFileName);
  });

  // make story
  let storyTmpl = fs.readFileSync(path.join('stories/Icon.stories.tmpl'), {
    encoding: 'utf-8',
  });
  storyTmpl = storyTmpl.replace(/{{icons}}/g, componentNames.join(',\n'));

  fs.writeFileSync(
    path.join('src', 'index.ts'),
    componentNames.map(c => `export * from './components/${c}';`).join('\n'),
    { encoding: 'utf-8' },
  );

  fs.writeFileSync(path.join('stories', 'Icon.stories.tsx'), storyTmpl, {
    encoding: 'utf-8',
  });
}

generate();
