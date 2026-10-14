import subprocess
import re
import html

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

test_injection = """
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    try {
      document.getElementById('btn-enter-pyramid').click();
      window.app.startLevel(1);

      window.app.lastManualTurnTime = 0;
      window.app.lastCompassHeading = null;
      let err = null;
      try {
        window.app.orientationHandler({ webkitCompassHeading: 180 });
      } catch(e) {
        err = e.message + " stack: " + e.stack;
      }

      const out = {
        facing: window.app.engine.player.facing,
        lastCompassHeading: window.app.lastCompassHeading,
        hasActiveCompass: window.app.hasActiveCompass,
        err: err
      };

      document.body.setAttribute('data-test-output', JSON.stringify(out));
    } catch(e) {
      document.body.setAttribute('data-test-output', JSON.stringify({ error: e.message, stack: e.stack }));
    }
  }, 100);
});
</script>
"""

content = index_content.replace('</body>', test_injection + '</body>')
with open('debug_orientation_run.html', 'w', encoding='utf-8') as f:
    f.write(content)

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=2000',
    '--dump-dom',
    'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/debug_orientation_run.html'
]
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    print('DEBUG RESULT:\n', html.unescape(m.group(1)))
else:
    print('OUTPUT NOT FOUND')
