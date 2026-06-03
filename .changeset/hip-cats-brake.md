---
'@builder.io/mitosis': patch
---

Angular signals: gate the deprecated `allowSignalWrites` effect option on the runtime Angular version (`VERSION.major < 19`) instead of dropping it. This silences the deprecation warning on Angular 19+ while keeping backwards compatibility with lower versions.
