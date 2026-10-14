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

      // --- TEST 1: STATIONARY JITTER (Zero Ghost Steps) ---
      // Player is at (1, 1). 20 GPS jitter fixes while standing still.
      const initialSteps = window.app.engine.stepCount;
      const initialPos = { ...window.app.engine.player };

      for (let i = 0; i < 20; i++) {
        // Idle tremor (< 0.5 m/s², no steps)
        window.app.gps.handleDeviceMotion({
          acceleration: { x: 0.1, y: 0.05, z: 0.1 }
        });
        // GPS wander +/- 0.5 to 1.3m
        window.app.gps.handlePositionUpdate({
          coords: { latitude: 50.1234 + Math.sin(i) * 0.00001, longitude: 11.5678 + Math.cos(i) * 0.00001, accuracy: 12, speed: 0.0 }
        });
      }

      results.stationaryGhostSteps = window.app.engine.stepCount - initialSteps;
      results.stationaryPosUnchanged = (window.app.engine.player.x === initialPos.x && window.app.engine.player.y === initialPos.y);

      // --- TEST 2: ANDROID 45° TILT COMPASS TEST ---
      const compassAudit = [];
      // North (alpha = 0)
      window.app.orientationHandler({ alpha: 0, beta: 45, gamma: 0 }, true);
      compassAudit.push({ dir: 'North', facing: window.app.engine.player.facing });

      // East (alpha = 270)
      window.app.orientationHandler({ alpha: 270, beta: 45, gamma: 0 }, true);
      compassAudit.push({ dir: 'East', facing: window.app.engine.player.facing });

      // South (alpha = 180)
      window.app.orientationHandler({ alpha: 180, beta: 45, gamma: 0 }, true);
      compassAudit.push({ dir: 'South', facing: window.app.engine.player.facing });

      // West (alpha = 90)
      window.app.orientationHandler({ alpha: 90, beta: 45, gamma: 0 }, true);
      compassAudit.push({ dir: 'West', facing: window.app.engine.player.facing });

      results.compassAudit = compassAudit;

      // --- TEST 3: WALKING EAST (2 physical strides + GPS displacement) ---
      window.app.engine.player.facing = 'right';
      window.app.gps.resetStepOrigin();
      window.app.gps.handlePositionUpdate({
        coords: { latitude: 50.1234, longitude: 11.5678, accuracy: 5, speed: 0.8 }
      });

      // 2 strides peak
      simulateStepPeak();
      window.app.gps.lastMotionPeakTime = performance.now() - 400;
      simulateStepPeak();

      results.posAfterRightSteps = { ...window.app.engine.player };

      // --- TEST 4: DIRECTION CHANGE & RE-ANCHOR ---
      document.getElementById('btn-turn-right').click();
      results.facingAfterTurn = window.app.engine.player.facing;
      results.motionStepsAfterTurn = window.app.gps.motionStepsCount;
      results.walkDistanceAfterTurn = window.app.gps.currentWalkDistance;

      // --- TEST 5: STEP DOWN (PUSH CRATE) ---
      window.app.gps.lastStepTime = 0;
      window.app.gps.lastMotionPeakTime = 0;
      simulateStepPeak();
      window.app.gps.lastMotionPeakTime = performance.now() - 400;
      simulateStepPeak();

      // GPS confirms physical movement South by ~1.5m
      window.app.gps.handlePositionUpdate({
        coords: { latitude: 50.1234 - 0.000015, longitude: 11.5678, accuracy: 5, speed: 0.75 }
      });

      results.posAfterDownSteps = { ...window.app.engine.player };
      results.boxPos = { ...window.app.engine.boxes[0] };
      results.pushCount = window.app.engine.pushCount;

      // --- TEST 6: CANVAS & RENDER PIPELINE ---
      let renderOk = true;
      try {
        window.app.renderer.render(performance.now());
      } catch (err) {
        renderOk = false;
        results.renderError = err.message;
      }
      results.renderOk = renderOk;

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
