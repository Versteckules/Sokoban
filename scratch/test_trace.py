import subprocess
import re

with open('js/game.bundle.js', 'r', encoding='utf-8') as f:
    bundle = f.read()

# Let's inspect what happens when we run the bundle code directly
test_code = f"""<!DOCTYPE html>
<html>
<head></head>
<body>
<div id="trace"></div>
<script>
window.traceLog = [];
try {{
  window.traceLog.push('Before bundle');
  {bundle}
  window.traceLog.push('After bundle');
}} catch(e) {{
  window.traceLog.push('Bundle Exception: ' + e.message + ' at ' + e.stack);
}}

window.addEventListener('DOMContentLoaded', () => {{
  window.traceLog.push('DOMContentLoaded fired');
  window.traceLog.push('window.app: ' + !!window.app);
  document.getElementById('trace').textContent = JSON.stringify(window.traceLog);
}});
</script>
</body>
</html>"""

with open('scratch/test_trace.html', 'w', encoding='utf-8') as f:
    f.write(test_code)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/scratch/test_trace.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'<div id="trace">(.*?)</div>', res.stdout)
if m:
    import html
    print('TRACE:', html.unescape(m.group(1)))
else:
    print('NO TRACE')
