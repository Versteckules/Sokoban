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
      // 1. Enter pyramid and open Level 1
      document.getElementById('btn-enter-pyramid').click();
      const stone0 = document.querySelector('.pyramid-stone[data-index="0"]');
      if (stone0) stone0.click();
      
      const p = window.app.engine.player;
      window.testLog.push('Started Level 1: pos=(' + p.x + ',' + p.y + '), facing=' + p.facing + ', isReviewerMode=' + window.app.isReviewerMode);
      
      // 2. NORMAL MODE: Press WASD 'd'
      const keyD = new KeyboardEvent('keydown', { key: 'd' });
      window.dispatchEvent(keyD);
      const toast1 = document.getElementById('game-toast') ? document.getElementById('game-toast').textContent : '';
      window.testLog.push('Normal Mode - after pressing D: pos=(' + p.x + ',' + p.y + '), toast="' + toast1 + '"');

      // 3. NORMAL MODE: Press ArrowRight
      const keyArrow = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(keyArrow);
      window.testLog.push('Normal Mode - after ArrowRight: pos=(' + p.x + ',' + p.y + ')');

      // 4. NORMAL MODE: Click Canvas to the right of player
      const canvas = document.getElementById('sokoban-canvas');
      const rect = canvas.getBoundingClientRect();
      const clickEvt = new MouseEvent('click', {
        clientX: rect.left + canvas.width / (2 * (window.devicePixelRatio||1)) + 60,
        clientY: rect.top + canvas.height / (2 * (window.devicePixelRatio||1))
      });
      canvas.dispatchEvent(clickEvt);
      window.testLog.push('Normal Mode - after Canvas Click right: pos=(' + p.x + ',' + p.y + '), facing=' + p.facing);

      // 5. NORMAL MODE: Outdoor GPS walking!
      // Simulate GPS moving 2.2m East (lat=52.5, lon=13.4 -> lat=52.5, lon=13.400035)
      // Or triggerStep with bearing 90 (East)
      window.app.gps.triggerStep(90);
      window.testLog.push('Normal Mode - after GPS walking East (90 deg): pos=(' + p.x + ',' + p.y + '), boxes=' + JSON.stringify(window.app.engine.boxes));

      // 6. REVIEWER MODE: Activate reviewer mode
      window.app.engine.reset();
      window.app.activateReviewerMode();
      window.testLog.push('Reviewer Mode activated: isReviewerMode=' + window.app.isReviewerMode);

      // In Reviewer Mode: Press 'd'
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      window.testLog.push('Reviewer Mode - after pressing D: pos=(' + window.app.engine.player.x + ',' + window.app.engine.player.y + '), boxes=' + JSON.stringify(window.app.engine.boxes));

      // Check Audio: verify no synth drone
      window.testLog.push('Audio synth drone active: ' + (window.app.audio.ambientOscillators.length > 0));

      document.getElementById('sim-log').textContent = JSON.stringify(window.testLog);
    } catch(e) {
      document.getElementById('sim-log').textContent = 'ERR: ' + e.message + ' ' + e.stack;
    }
  }, 250);
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
import sys
sys.stdout.reconfigure(encoding='utf-8')
if m:
    print('SIMULATION OUTPUT:\n', html.unescape(m.group(1)))
else:
    print('NO SIM OUTPUT. STDOUT END:\n', res.stdout[-600:])
