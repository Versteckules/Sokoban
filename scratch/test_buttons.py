import subprocess
import re

with open('index.html', 'r', encoding='utf-8') as f:
    full_html = f.read()

# Fix path to ../js/game.bundle.js since test_buttons.html is in scratch/
fixed_html = full_html.replace('src="js/game.bundle.js"', 'src="../js/game.bundle.js"')

test_check = """
<div id="check-output"></div>
<script>
window.addEventListener('DOMContentLoaded', () => {
  const out = {
    appExists: !!window.app,
    screen: window.app ? window.app.currentScreen : null,
    errors: window.testErrors || []
  };
  if (window.app) {
    try {
      // 1. Click Enter Pyramid
      document.getElementById('btn-enter-pyramid').click();
      out.screenAfterClick = window.app.currentScreen;
      
      // 2. Click Hero 10 times
      window.app.showScreen('landing');
      const hero = document.getElementById('hero-img');
      for(let i=0; i<10; i++) hero.click();
      out.reviewerMode = window.app.isReviewerMode;
      
      // 3. Start Level 1
      window.app.startLevel(0);
      out.level1Started = window.app.currentScreen;
      out.levelId = window.app.engine.currentLevel.id;
      
      // 4. Move right
      const res = window.app.engine.move('right');
      out.moveWin = res.win;
    } catch(err) {
      out.actionError = err.message + ' ' + err.stack;
    }
  }
  document.getElementById('check-output').textContent = JSON.stringify(out);
});
</script>
"""

injected = fixed_html.replace('</body>', test_check + '</body>')

with open('scratch/test_buttons.html', 'w', encoding='utf-8') as f:
    f.write(injected)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--dump-dom', 'file:///c:/Users/flaem\Desktop/Antigravity/Sokoban/Sokoban/scratch/test_buttons.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'<div id="check-output">(.*?)</div>', res.stdout)
if m:
    import html
    print('BUTTON TEST RESULT:', html.unescape(m.group(1)))
else:
    print('NO OUTPUT MATCHED')
