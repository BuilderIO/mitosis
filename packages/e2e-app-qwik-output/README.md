# Harness to compile the Qwik output of Mitosis E2E tests

Qwik, like some other frameworks, requires its output be compiled to produce an
npm package suitable for downstream consumption. To test realistically, the E2E
tests follow this path.

**However**, as of 0.0.34 an error occurs when trying to consume a Qwik library
from a Qwik application, so this harness is used only to verify the Qwik library
will compile; the E2E harness consumes the source code directly instead, and
works only in dev mode.
