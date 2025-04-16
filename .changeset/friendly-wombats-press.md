---
'@builder.io/mitosis': patch
---

[angular]:

Fix minor issues for ``api=signals``:

- Missing ``OnDestroy`` import
- ``onMount`` hook will be `AfterViewInit` instead of `OnInit`
- HTML template uses prettiers [html-whitespace-sensitivity](https://github.com/angular/angular/issues/37635#issuecomment-2298369500) to avoid spaces around content
