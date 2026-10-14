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

      window.app.engine.player.facing = 'down';
      window.app.gps.resetStepOrigin();

      // Initial fix at 50.0, 11.0
      window.app.gps.handlePositionUpdate({
        coords: { latitude: 50.000000, longitude: 11.000000, accuracy: 5, speed: 0 }
      });

      const distBefore = window.app.gps.currentWalkDistance;
      const originBefore = { ...window.app.gps.stepOriginCoord };

      // Move 2 meters South
      // 2 meters in degrees lat = 2 / 111111 = 0.000018
      window.app.gps.lastStepTime = -10000;
      window.app.gps.handlePositionUpdate({
        coords: { latitude: 50.000000 - 0.000020, longitude: 11.000000, accuracy: 5, speed: 1.1 }
      });

      const distAfter = window.app.gps.currentWalkDistance;
      const playerPosAfter = { ...window.app.engine.player };
      const stepCount = window.app.engine.stepCount;

      const out = {
        distBefore,
        originBefore,
        distAfter,
        playerPosAfter,
        stepCount
      };

      document.body.setAttribute('data-test-output', JSON.stringify(out));
    } catch(err) {
      document.body.setAttribute('data-test-output', JSON.stringify({ error: err.message, stack: err.stack }));
    }
  }, 100);
});
</script>
"""

content = index_content.replace('</body>', test_injection + '</body>')
with open('debug_walk_run.html', 'w', encoding='utf-8') as f:
    f.write(content)

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=2000',
    '--dump-dom',
    'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/debug_walk_run.html'
]
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    print('WALK TEST:\n', html.unescape(m.group(1)))
else:
    print('OUTPUT NOT FOUND')
