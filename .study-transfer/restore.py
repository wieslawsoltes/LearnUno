"""One-time recovery of the reviewed, hash-pinned 74-file source archive."""
from pathlib import Path
import hashlib
import io
import re
import tarfile

parts = [Path(f'.study-transfer/part{i:02}') for i in range(24)]
archive = b''.join(p.read_bytes() for p in parts)
assert len(archive) == 139240, 'Archive size mismatch'
assert hashlib.sha256(archive).hexdigest() == 'ee78ffc2232b7a9f9bff876689d5af33ddabc71fe0bf814940c13c86a4befb1f', 'Archive digest mismatch'
allowed = set('''site/content/source-map.json
site/src/learning/chapters.mjs
site/design/study.css
site/src/app.mjs
site/src/atlas/lab.mjs
site/visual.css
scripts/build.mjs
scripts/study-material.mjs
tests/study.test.mjs
tests/browser/study.spec.mjs
docs/expanded-chapters.md
README.md
package.json
package-lock.json'''.splitlines())
with tarfile.open(fileobj=io.BytesIO(archive), mode='r:xz') as tar:
    members = tar.getmembers()
    assert len(members) == 74 and sum(m.size for m in members) == 551437
    assert len({m.name for m in members}) == 74
    for member in members:
        assert member.isfile() and not member.issym() and not member.islnk()
        assert member.name in allowed or re.fullmatch(r'site/content/chapters/[a-z0-9-]+\.json', member.name)
        assert member.size < 100000
    for member in members:
        target = Path(member.name)
        target.parent.mkdir(parents=True, exist_ok=True)
        data = tar.extractfile(member).read()
        data.decode('utf-8')
        target.write_bytes(data)
    Path('/tmp/learnuno-restored-paths.txt').write_text(''.join(m.name + '\n' for m in members))
print('Restored all 74 source files from the verified archive. No workflow files were imported.')
