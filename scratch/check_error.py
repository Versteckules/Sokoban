import subprocess
import re

with open('js/game.bundle.js', 'r', encoding='utf-8') as f:
    bundle = f.read()

template = """<!DOCTYPE html>
<html>
<head>
<script>
window.errors = [];
window.onerror = function(msg, url, line, col, error) {
  window.errors.push({msg: msg, line: line, col: col, error: String(error), stack: error ? error.stack : ''});
};
</script>
<script>
try {
__BUNDLE__
} catch(e) {
  window.errors.push({msg: e.message, line: e.lineNumber, stack: e.stack});
}
</script>
</head>
<body>
<div id="output"></div>
<script>
document.getElementById('output').textContent = JSON.stringify(window.errors);
</script>
</body>
</html>"""

with open('test_error.html', 'w', encoding='utf-8') as f:
    f.write(template.replace('__BUNDLE__', bundle))

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/test_error.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'<div id="output">(.*?)</div>', res.stdout)
if m:
    print('ERRORS FOUND:', m.group(1))
else:
    print('NO OUTPUT DIV:', res.stdout[:500])
