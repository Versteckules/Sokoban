import re

files = [
    ('levels.js', 'js/levels.js'),
    ('engine.js', 'js/engine.js'),
    ('audio.js', 'js/audio.js'),
    ('gps.js', 'js/gps.js'),
    ('renderer.js', 'js/renderer.js'),
    ('crypto.js', 'js/crypto.js'),
    ('main.js', 'js/main.js')
]

parts = []
parts.append('// SOKOBAN PYRAMID - STANDALONE GAME BUNDLE')
parts.append('// Funktioniert sowohl auf GitHub Pages als auch beim direkten Doppelklick (file://) im Browser!')
parts.append('// Ersteller: versteckules')
parts.append('(function() {')
parts.append('')

for name, path in files:
    parts.append(f'// --- Source: {name} ---')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove import lines
    content = re.sub(r'import\s+[^;]+;\n?', '', content)
    # Remove export statements (export class, export const, export function, export let)
    content = re.sub(r'export\s+(class|const|let|function|var)\s+', r'\1 ', content)
    # Remove standalone export { ... };
    content = re.sub(r'export\s+\{[^}]+\};\n?', '', content)
    
    parts.append(content.strip())
    parts.append('')

parts.append('})();')

bundle_text = '\n'.join(parts)

with open('js/game.bundle.js', 'w', encoding='utf-8') as f:
    f.write(bundle_text)

print(f'Built js/game.bundle.js successfully ({len(bundle_text)} bytes, {len(bundle_text.splitlines())} lines)')
