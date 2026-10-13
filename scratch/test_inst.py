import subprocess
import re

with open('js/game.bundle.js', 'r', encoding='utf-8') as f:
    bundle = f.read()

test_html = f"""<!DOCTYPE html>
<html>
<head></head>
<body>
<div id="output"></div>
<script>
window.testErrors = [];
window.onerror = function(msg, url, line, col, err) {{
  window.testErrors.push({{msg: msg, stack: err ? err.stack : null}});
}};
</script>
<script>
{bundle}
</script>
<script>
try {{
  console.log('Manually instantiating SokobanApp...');
  window.manualApp = new SokobanApp();
}} catch(e) {{
  window.testErrors.push({{msg: 'Constructor error: ' + e.message, stack: e.stack}});
}}
document.getElementById('output').textContent = JSON.stringify(window.testErrors);
</script>
</body>
</html>"""

with open('scratch/test_instantiation.html', 'w', encoding='utf-8') as f:
    f.write(test_html)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/scratch/test_instantiation.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'<div id="output">(.*?)</div>', res.stdout)
if m:
    print('INSTANTIATION ERRORS:', m.group(1))
else:
    print('NO OUTPUT:', res.stdout[:500])
