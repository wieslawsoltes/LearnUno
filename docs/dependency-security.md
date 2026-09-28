# Browser dependency security

The browser dependency tree is pinned by `package-lock.json`. Monaco 0.55.1 includes marked and DOMPurify transitively; they are part of the editor's implementation even though LearnUno's reference reader uses its own escaped-markup renderer.

The initial audit reported advisories for Monaco's pinned DOMPurify version and fflate 0.8.2. The reviewed update overrides DOMPurify to 3.4.16 and upgrades fflate to 0.8.3. fflate's reported issue concerned malformed ZIP64 decompression; LearnUno currently uses it to generate exports, but retaining an affected dependency was unnecessary.

The package update was installed, audited, and exercised with the source tests and static build before applying it to main. Main repeats all runtime/browser validation. `dependency-security.yml` records a fresh audit report and fails on reported vulnerabilities whenever the lockfile changes or the workflow is explicitly dispatched.

An audit is evidence about known advisories at the time it runs—not a guarantee that a dependency is vulnerability-free. Keep the override reviewed as Monaco changes its own dependency constraints and update the license notices with the actual dependency graph.
