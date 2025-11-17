$BR = git rev-parse --abbrev-ref HEAD
$STAMP = Get-Date -Format 'yyyyMMdd_HHmm'
$TAG = "SAFE_${BR}_${STAMP}"
git fetch origin
git tag -a $TAG -m "Snapshot antes de cambios $BR @ $STAMP"
git branch "backup/$BR/$STAMP"
git push --tags
git push origin "backup/$BR/$STAMP"
Write-Output $TAG


