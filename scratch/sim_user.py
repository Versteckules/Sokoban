import subprocess
import re
import html

test_script = """
<div id="sim-log"></div>
<script>
window.testLog = [];
window.addEventListener('load', () => {
  setTimeout(() => {
    try {
      // 1. Enter pyramid
      document.getElementById('btn-enter-pyramid').click();
      window.testLog.push('Entered pyramid');
      
      // 2. Click Level 1
      const stone0 = document.querySelector('.pyramid-stone[data-index="0"]');
      if (stone0) stone0.click();
      window.testLog.push('Screen after clicking Level 1: ' + window.app.currentScreen);
      
      const p = window.app.engine.player;
      window.testLog.push('Initial: pos=(' + p.x + ',' + p.y + '), facing=' + p.facing);
      
      // 3. User clicks btn-turn-right (to face the crate on the right!)
      document.getElementById('btn-turn-right').click();
      window.testLog.push('After clicking btn-turn-right: facing=' + p.facing);
      
      // 4. User clicks btn-step-forward
      document.getElementById('btn-step-forward').click();
      window.testLog.push('After clicking btn-step-forward: pos=(' + p.x + ',' + p.y + '), boxes=' + JSON.stringify(window.app.engine.boxes));
      
      // 5. Reset level
      window.app.engine.reset();
      window.testLog.push('After Reset: pos=(' + window.app.engine.player.x + ',' + window.app.engine.player.y + '), facing=' + window.app.engine.player.facing + ', boxes=' + JSON.stringify(window.app.engine.boxes));
      
      // 6. User presses ArrowRight key
      const keyEvt = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(keyEvt);
      // 8. Test Touch D-Pad
      window.app.engine.reset();
      document.getElementById('btn-touch-right').click();
      window.testLog.push('After Touch D-Pad Right: pos=(' + window.app.engine.player.x + ',' + window.app.engine.player.y + '), boxes=' + JSON.stringify(window.app.engine.boxes));

      // 9. Test GPS step with walk direction
      window.app.engine.reset();
      window.app.gps.triggerStep('right');
      window.testLog.push('After GPS Step Right: pos=(' + window.app.engine.player.x + ',' + window.app.engine.player.y + '), boxes=' + JSON.stringify(window.app.engine.boxes));

      // 10. Test Field Rotation and relative controls
      window.app.engine.reset();
      window.app.rotateField(); // 90°
      window.testLog.push('Field rotated to: ' + window.app.renderer.rotation + '°');
      // On screen, right is still screenDir 'right'
      const gridDirForScreenRight = window.app.screenDirToGrid('right');
      window.testLog.push('Screen right maps to grid: ' + gridDirForScreenRight);

      document.getElementById('sim-log').textContent = JSON.stringify(window.testLog);
    } catch(e) {
      document.getElementById('sim-log').textContent = 'ERR: ' + e.message + ' ' + e.stack;
    }
  }, 200);
});
</script>
"""

with open('index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

test_page = orig.replace('</body>', test_script + '</body>')
with open('test_user_sim.html', 'w', encoding='utf-8') as f:
    f.write(test_page)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--virtual-time-budget=2000', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/test_user_sim.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'<div id="sim-log">(.*?)</div>', res.stdout)
if m:
    print('SIMULATION OUTPUT:\n', html.unescape(m.group(1)))
else:
    print('NO SIM OUTPUT. STDOUT END:\n', res.stdout[-600:])

