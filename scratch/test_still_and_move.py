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

      // Start position: player at (1, 1)
      window.app.engine.player.facing = 'right';
      window.app.gps.resetStepOrigin();

      // GPS Initial Fix at lat 50.00000, lon 11.00000
      window.app.gps.handlePositionUpdate({
        coords: { latitude: 50.000000, longitude: 11.000000, accuracy: 6 }
      });

      const initialStepsTaken = window.app.engine.stepCount;

      // TEST 1: STANDING STILL - Simulate 10 GPS jitter points within 0.6m
      for (let i = 0; i < 10; i++) {
        // Small jitter (+- 0.000005 deg is ~0.4 meters)
        const jitterLat = 50.000000 + (Math.sin(i) * 0.000004);
        const jitterLon = 11.000000 + (Math.cos(i) * 0.000004);
        window.app.gps.handlePositionUpdate({
          coords: { latitude: jitterLat, longitude: jitterLon, accuracy: 6 }
        });
      }

      // Check: Was any ghost step triggered while standing still?
      results.stepsWhileStill = window.app.engine.stepCount - initialStepsTaken;
      results.walkDistWhileStill = window.app.gps.currentWalkDistance;

      // TEST 2: COMPASS TURNING (Android absolute event & iOS event)
      // Simulate compass pointing East (90 deg -> facing 'right')
      window.app.lastManualTurnTime = -999999;
      window.app.orientationHandler({ webkitCompassHeading: 90 });
      results.facingAfterEast = window.app.engine.player.facing;

      // Simulate compass pointing South (180 deg -> facing 'down')
      window.app.lastManualTurnTime = -999999;
      window.app.orientationHandler({ webkitCompassHeading: 180 });
      results.facingAfterSouth = window.app.engine.player.facing;

      // Simulate compass pointing West (270 deg -> facing 'left')
      window.app.lastManualTurnTime = -999999;
      window.app.orientationHandler({ webkitCompassHeading: 270 });
      results.facingAfterWest = window.app.engine.player.facing;

      // Simulate compass pointing North (0 deg -> facing 'up')
      window.app.lastManualTurnTime = -999999;
      window.app.orientationHandler({ webkitCompassHeading: 0 });
      results.facingAfterNorth = window.app.engine.player.facing;

      // TEST 3: MANUAL TURN BUTTONS
      // From 'up': Click Turn Left -> becomes 'left'
      document.getElementById('btn-turn-left').click();
      results.facingButtonLeft = window.app.engine.player.facing;

      // From 'left': Click Turn Left -> becomes 'down'
      document.getElementById('btn-turn-left').click();
      results.facingButtonDown = window.app.engine.player.facing;

      // TEST 4: WALKING - Real physical displacement of 1.6m South (facing 'down')
      // Origin is at 50.000000, 11.000000.
      // Moving South by 1.6m: deltaLat = -1.6 / 111111 = -0.0000144
      window.app.gps.lastStepTime = -10000;
      window.app.gps.handlePositionUpdate({
        coords: { latitude: 50.000000 - 0.000015, longitude: 11.000000, accuracy: 5, speed: 0.9 }
      });
      results.stepsAfterWalk = window.app.engine.stepCount - initialStepsTaken;
      results.posAfterWalk = { ...window.app.engine.player };

      document.body.setAttribute('data-test-output', JSON.stringify(results));
    } catch(e) {
      document.body.setAttribute('data-test-output', JSON.stringify({ error: e.message, stack: e.stack }));
    }
  }, 150);
});
</script>
"""

content = index_content.replace('</body>', test_injection + '</body>')
with open('test_still_and_move_run.html', 'w', encoding='utf-8') as f:
    f.write(content)

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=2500',
    '--dump-dom',
    'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/test_still_and_move_run.html'
]
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    print('RESULT:\n', html.unescape(m.group(1)))
else:
    print('OUTPUT NOT FOUND')
