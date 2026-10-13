import subprocess
import re
import html

code = """
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    try {
      document.getElementById('btn-enter-pyramid').click();
      window.app.startLevel(1);
      const screen1 = window.app.currentScreen;
      const isTracking = window.app.gps.isTracking;
      const hasOnStep = !!window.app.gps.onStepTriggered;
      
      const gps = window.app.gps;
      const t1 = performance.now();
      const lst = gps.lastStepTime;
      const cld = gps.stepCooldownMs;
      const cond = (t1 - lst < cld);
      gps.lastStepTime = -99999;
      let onStepCalled = false;
      gps.onStepTriggered = () => { onStepCalled = true; };
      gps.triggerStep();
      const playerAfterTrigger = { ...window.app.engine.player };

      const diag = {
        t1, lst, cld, cond,
        screen1,
        isTracking,
        hasOnStep,
        onStepCalled,
        playerAfterTrigger
      };
      document.body.setAttribute('data-diag', JSON.stringify(diag));
    } catch(e) {
      document.body.setAttribute('data-diag', JSON.stringify({ error: e.message, stack: e.stack }));
    }
  }, 100);
});
</script>
"""

content = open('index.html', 'r', encoding='utf-8').read().replace('</body>', code + '</body>')
with open('test_diag.html', 'w', encoding='utf-8') as f:
    f.write(content)

cmd = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '--headless=new',
    '--virtual-time-budget=2000',
    '--dump-dom',
    'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/test_diag.html'
]
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')
m = re.search(r'data-diag="([^"]+)"', res.stdout)
if m:
    print('DIAG:\n', html.unescape(m.group(1)))
else:
    print('NOT FOUND')
