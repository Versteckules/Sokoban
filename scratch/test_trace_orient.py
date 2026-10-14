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
      window.app.engine.player.facing = 'right';

      const traces = [];
      const e = { webkitCompassHeading: 180 };

      traces.push("currentScreen: " + window.app.currentScreen);
      traces.push("engine.player: " + !!window.app.engine.player);
      const now = performance.now();
      traces.push("diffManualTime: " + (now - window.app.lastManualTurnTime));
      const heading = window.app.calculateHeading(e);
      traces.push("heading: " + heading);
      traces.push("lastCompassHeading: " + window.app.lastCompassHeading);
      const fieldRot = window.app.renderer ? window.app.renderer.rotation : 0;
      const gridAngle = (heading - fieldRot + 360) % 360;
      traces.push("gridAngle: " + gridAngle);
      const newFacing = window.app.angleToDirection(gridAngle, window.app.engine.player.facing);
      traces.push("newFacing: " + newFacing);
      traces.push("oldFacing: " + window.app.engine.player.facing);

      // Now call orientationHandler
      window.app.orientationHandler(e);
      traces.push("facingAfterHandler: " + window.app.engine.player.facing);
      traces.push("lastCompassHeadingAfter: " + window.app.lastCompassHeading);

      document.body.setAttribute('data-test-output', JSON.stringify(traces));
    } catch(err) {
      document.body.setAttribute('data-test-output', JSON.stringify({ error: err.message, stack: err.stack }));
    }
  }, 100);
});
</script>
"""

content = index_content.replace('</body>', test_injection + '</body>')
with open('debug_trace_run.html', 'w', encoding='utf-8') as f:
    f.write(content)

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=2000',
    '--dump-dom',
    'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/debug_trace_run.html'
]
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    print('TRACE:\n', html.unescape(m.group(1)))
else:
    print('OUTPUT NOT FOUND')
