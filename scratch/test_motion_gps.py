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
      const results = {};

      // 1. Enter pyramid & start level 2 (index 1)
      document.getElementById('btn-enter-pyramid').click();
      window.app.startLevel(1);

      // Start position: player at (1, 1), empty floor at (2, 1) to the right
      const startPos = { ...window.app.engine.player };
      window.app.engine.player.facing = 'right';
      window.app.gps.resetStepOrigin();

      // Simulate GPS lock with good accuracy (5m)
      window.app.gps.handlePositionUpdate({
        coords: { latitude: 50.1234, longitude: 11.5678, accuracy: 5, speed: 0.8 }
      });

      const simulateStepPeak = () => {
        window.app.gps.handleDeviceMotion({
          acceleration: { x: 0.2, y: 1.4, z: 0.3 },
          accelerationIncludingGravity: null
        });
      };

      // 3 steps right: moves player from (1, 1) to (2, 1)
      simulateStepPeak();
      window.app.gps.lastMotionPeakTime = performance.now() - 400;
      simulateStepPeak();
      window.app.gps.lastMotionPeakTime = performance.now() - 400;
      simulateStepPeak();

      results.posAfterRightSteps = { ...window.app.engine.player };

      // 2. Turn Right: facing becomes 'down' (toward box at x=2, y=2)
      document.getElementById('btn-turn-right').click();
      results.facingAfterTurn = window.app.engine.player.facing;
      results.motionStepsAfterTurn = window.app.gps.motionStepsCount;
      results.walkDistanceAfterTurn = window.app.gps.currentWalkDistance;

      // 3. Take 3 steps down: should push box from (2, 2) to (2, 3) and player to (2, 2)
      window.app.gps.lastStepTime = 0;
      window.app.gps.lastMotionPeakTime = 0;
      simulateStepPeak();
      window.app.gps.lastMotionPeakTime = performance.now() - 400;
      simulateStepPeak();
      window.app.gps.lastMotionPeakTime = performance.now() - 400;
      simulateStepPeak();

      results.posAfterDownSteps = { ...window.app.engine.player };
      results.boxPos = { ...window.app.engine.boxes[0] };
      results.pushCount = window.app.engine.pushCount;

      document.body.setAttribute('data-test-output', JSON.stringify(results));
    } catch(e) {
      document.body.setAttribute('data-test-output', JSON.stringify({ error: e.message, stack: e.stack }));
    }
  }, 150);
});
</script>
"""

content = index_content.replace('</body>', test_injection + '</body>')
with open('test_motion_gps_run.html', 'w', encoding='utf-8') as f:
    f.write(content)

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=2500',
    '--dump-dom',
    'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/test_motion_gps_run.html'
]
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    print('RESULT:\n', html.unescape(m.group(1)))
else:
    print('OUTPUT NOT FOUND')
