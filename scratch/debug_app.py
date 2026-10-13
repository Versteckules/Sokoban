import subprocess
import re

with open('js/game.bundle.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Also let's include index.html's actual DOM body elements so getElementById doesn't return null!
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Replace the DOMContentLoaded in the bundle with a try-catch that logs the error
modified_bundle = text.replace(
    'window.app = new SokobanApp();',
    'try { window.app = new SokobanApp(); } catch(e) { window.__appError = e.message + " | " + e.stack; console.error(e); }'
)

# Put modified bundle into index.html
test_page = index_html.replace(
    '<script src="js/game.bundle.js"></script>',
    f'<div id="debug-out"></div>\n<script>\n{modified_bundle}\nwindow.addEventListener("DOMContentLoaded", () => {{\n  document.getElementById("debug-out").textContent = "APP: " + (window.app ? "OK" : "FAIL") + " | ERR: " + (window.__appError || "NONE");\n}});\n</script>'
)

with open('scratch/test_debug.html', 'w', encoding='utf-8') as f:
    f.write(test_page)

cmd = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', '--headless=new', '--dump-dom', 'file:///c:/Users/flaem/Desktop/Antigravity/Sokoban/Sokoban/scratch/test_debug.html']
res = subprocess.run(cmd, capture_output=True, encoding='utf-8', errors='replace')

m = re.search(r'<div id="debug-out">(.*?)</div>', res.stdout)
if m:
    print('DEBUG RESULT:', m.group(1))
else:
    print('NO RESULT:', res.stdout[:500])
