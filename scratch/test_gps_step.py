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
      // 1. Enter pyramid & start level 2 (index 1)
      document.getElementById('btn-enter-pyramid').click();
      window.app.startLevel(1);
      const posBefore = { ...window.app.engine.player };
      
      // Facing right (tile at x=2, y=1 is empty floor)
      window.app.engine.player.facing = 'right';
      window.app.gps.lastStepTime = 0;
      window.app.gps.triggerStep();
      const posAfter = { ...window.app.engine.player };

      // 2. Test compass orientation event (heading = 180 -> South / down)
      const orientEvt = new Event('deviceorientation');
      orientEvt.alpha = 180;
      orientEvt.webkitCompassHeading = 180;
      window.dispatchEvent(orientEvt);
      const facingAfterCompass = window.app.engine.player.facing;

      // 3. Test field rotation with compass
      window.app.rotateField();
      const facingAfterRotate = window.app.engine.player.facing;
      const fieldRot = window.app.renderer.rotation;

      // 4. Test button turns
      document.getElementById('btn-turn-left').click();
      const facingAfterTurnLeft = window.app.engine.player.facing;
      document.getElementById('btn-turn-right').click();
      const facingAfterTurnRight = window.app.engine.player.facing;

      const out = {
        posBefore,
        posAfter,
        facingAfterCompass,
        facingAfterRotate,
        fieldRot,
        facingAfterTurnLeft,
        facingAfterTurnRight
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
with open('test_step_compass.html', 'w', encoding='utf-8') as f:
    f.write(content)

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=2000',
    '--dump-dom',
    'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/test_step_compass.html'
]
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    print('RESULT:\n', html.unescape(m.group(1)))
else:
    print('OUTPUT NOT FOUND')
