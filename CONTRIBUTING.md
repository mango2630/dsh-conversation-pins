# Contributing

## Setup

```sh
pnpm install
pnpm build
pnpm check
```

`lib/client.js` is intentionally committed. It lets users install the repository with `dsh plugin add <git-url>` without running a build. Rebuild and commit it in the same change as `src/client.tsx`.

## Manual verification

1. Install the checkout into a disposable DSH Web profile:

   ```sh
   dsh plugin --profile pins-dev add /path/to/dsh-conversation-pins
   dsh --profile pins-dev --no-open --port 3099
   ```

2. Open a long conversation.
3. Hover a paragraph, move into the left gutter, and click the pin.
4. Scroll to the bottom and jump from the pinboard.
5. Repeat for a table cell and for a block in a folded turn.
6. Check the browser console for page errors.

Do not commit `node_modules`, packed tarballs, personal paths, or session data.

## Pull requests

- Keep the host half a no-op unless a feature genuinely needs a host service.
- Preserve the committed bundle whenever browser sources change.
- Describe user-visible behavior and the DSH versions you tested against.
