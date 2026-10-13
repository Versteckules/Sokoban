import subprocess
import re

with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Synchronously check window.app and errors
footer_injection = """
<div id="error-report"></div>
<script>
document.getElementById('error-report').textContent = JSON.stringify({
  errors: window.domErrors,
  appExists: !!window.app,
  screen: window.app ? window.app.currentScreen : null
});
</script>
"""

err_injection = """
<script>
window.domErrors = [];
window.addEventListener('error', function(e) {
  window.domErrors.push({
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error ? e.error.stack : ''
  });
});
</script>
"""

test_content = index_html.replace('<head>', '<head>' + err_injection).replace('</body>', footer_injection + '</body>')

with open('scratch/test_live.html', 'w', encoding='utf-8') as f:
    f.write(test_content)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/scratch/test_live.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'<div id="error-report">(.*?)</div>', res.stdout)
if m:
    import html
    print('REPORT:', html.unescape(m.group(1)))
else:
    print('NO REPORT FOUND')
