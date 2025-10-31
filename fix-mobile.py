#!/usr/bin/env python3
with open('public/js/sandra-mobile.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove line 18 (the badge) - index 17
del lines[17]

# Now find the last lines (iOS detection) and replace them
# After deleting line 18, the iOS lines shift up by 1
# Original 906-907 becomes 905-906

# Replace with new code
lines[904] = '  // CLEANUP: Manage install prompt visibility\n'
lines[905] = '  const installBox = document.querySelector("#installBox");\n'  
lines[906] = '  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);\n'
lines.insert(907, '  const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||\n')
lines.insert(908, '                       window.navigator.standalone === true;\n')
lines.insert(909, '\n')
lines.insert(910, '  // Hide if: not iOS, OR already installed in standalone mode\n')
lines.insert(911, '  if (!isIOS || isStandalone) {\n')
lines.insert(912, '    if (installBox) installBox.style.display = "none";\n')
lines.insert(913, '  }\n')

with open('public/js/sandra-mobile.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")
