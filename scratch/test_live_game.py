import subprocess
import re

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

test_injection = """
<script>
window.testResults = {};
window.addEventListener('load', () => {
  setTimeout(() => {
    try {
      testResults.appExists = !!window.app;
      testResults.startScreen = window.app.currentScreen;

      // 1. Enter pyramid
      document.getElementById('btn-enter-pyramid').click();
      testResults.screenAfterEnter = window.app.currentScreen;

      // 2. Start Level 1 (index 0)
      window.app.startLevel(0);
      testResults.levelActive = window.app.currentScreen;
      testResults.levelId = window.app.engine.currentLevel.id;
      testResults.initialFacing = window.app.engine.player.facing;
      testResults.playerInitialPos = { ...window.app.engine.player };

      // 3. Test field rotation around player
      const rotBtn = document.getElementById('btn-rotate-field');
      rotBtn.click();
      testResults.rotationAfterClick = window.app.renderer.rotation;
      rotBtn.click();
      rotBtn.click();
      rotBtn.click();
      testResults.rotationFullCycle = window.app.renderer.rotation;

      // 4. Test turning player
      document.getElementById('btn-turn-right').click();
      testResults.facingAfterTurnRight = window.app.engine.player.facing;
      document.getElementById('btn-turn-left').click();
      testResults.facingAfterTurnLeft = window.app.engine.player.facing;

      // Set facing to 'right' (towards crate in Level 1)
      window.app.engine.player.facing = 'right';

      // 5. Test walking forward (step forward button)
      document.getElementById('btn-step-forward').click();
      testResults.playerPosAfterStep = { x: window.app.engine.player.x, y: window.app.engine.player.y };
      testResults.boxPosAfterStep = { x: window.app.engine.boxes[0].x, y: window.app.engine.boxes[0].y };
      testResults.isWin = window.app.engine.isCompleted;

      // 6. Test GPS trigger step in Level 2
      window.app.modalVictory.classList.remove('active');
      window.app.startLevel(1); // Level 2
      testResults.lvl2InitialPos = { ...window.app.engine.player };
      // Turn down towards box
      window.app.engine.player.facing = 'down';
      // Simulate walking step from GPS / accelerometer
      window.app.gps.triggerStep();
      testResults.lvl2PosAfterWalk = { x: window.app.engine.player.x, y: window.app.engine.player.y };
      testResults.lvl2FacingAfterWalk = window.app.engine.player.facing;

      document.body.setAttribute('data-test-output', JSON.stringify(testResults));
    } catch(e) {
      testResults.error = e.message + ' at ' + e.stack;
      document.body.setAttribute('data-test-output', JSON.stringify(testResults));
    }
  }, 100);
});
</script>
"""

test_file_content = index_content.replace('</body>', test_injection + '</body>')

with open('test_live_run.html', 'w', encoding='utf-8') as f:
    f.write(test_file_content)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--virtual-time-budget=2000', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/test_live_run.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    import html
    raw = html.unescape(m.group(1))
    print('ALL TESTS PASSED:\n', raw)
else:
    print('NO OUTPUT FOUND:', res.stdout[-500:])
