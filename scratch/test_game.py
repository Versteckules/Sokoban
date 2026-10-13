import subprocess
import re

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

test_injection = """
<script>
window.testResults = {};
window.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Check window.app initialized
    testResults.appExists = !!window.app;
    testResults.currentScreen = window.app ? window.app.currentScreen : null;
    
    // 2. Click Pyramide betreten
    const btnEnter = document.getElementById('btn-enter-pyramid');
    btnEnter.click();
    testResults.screenAfterEnter = window.app.currentScreen;
    
    // 3. Test Hero 10-click (Reviewer mode)
    window.app.showScreen('landing');
    const heroImg = document.getElementById('hero-img');
    for (let i = 0; i < 10; i++) {
      heroImg.click();
    }
    testResults.reviewerActive = window.app.isReviewerMode;
    
    // 4. Test Enter Level 1
    window.app.showScreen('pyramid');
    window.app.startLevel(0);
    testResults.levelScreenActive = window.app.currentScreen;
    testResults.levelId = window.app.engine.currentLevel.id;
    
    // 5. Test move right
    const moveRes = window.app.engine.move('right');
    testResults.moveRightSuccess = moveRes.success;
    testResults.moveRightWin = moveRes.win;
    
    document.body.setAttribute('data-test-output', JSON.stringify(testResults));
  } catch(e) {
    testResults.error = e.message + ' at ' + e.stack;
    document.body.setAttribute('data-test-output', JSON.stringify(testResults));
  }
});
</script>
"""

test_file_content = index_content.replace('</body>', test_injection + '</body>')

with open('scratch/test_integration.html', 'w', encoding='utf-8') as f:
    f.write(test_file_content)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/scratch/test_integration.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'data-test-output="([^"]+)"', res.stdout)
if m:
    import html
    raw = html.unescape(m.group(1))
    print('TEST RESULTS:', raw)
else:
    print('NO DATA-TEST-OUTPUT:', res.stdout[-500:])
