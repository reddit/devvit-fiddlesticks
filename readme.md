# [fiddlesticks](https://reddit.com/r/fiddlesticks)

[![demo](resources/screenshot.png)](resources/screenshot.png)

fiddlesticks is a competitive game of pick-up sticks.

## project structure

- src/app, src/main.tsx: devvit-specific code. the intent was to keep this part of the code as small as possible to minimize the devvitism learning curve and improve testability.
- src/shared: game code but may also be referenced by devvit.
- src/web-view: iframe and game code.
- src/test: test utils.

## features

- lit-html components.
- redis per post leaderboard.
- well typed devvit to iframe messaging.
- offline esbuild development flow.
- iframe asset loading and initialization flow.
- Reddit Thing ID keying.
- multi-environment TypeScript configuration for worker (devvit), web view (iframe), and test (Node.js).
- synthesized web audio.
- pointer input.
- scheduled posts.
- optimized no-iframe feed view.
- per post random number seeding.
- web fonts.
