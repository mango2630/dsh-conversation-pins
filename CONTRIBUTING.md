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


## Releasing and updating the plugin index

`docs/index.json` is the public Discover index. Its first version pins a release by commit, not by tag:

1. Bump `package.json`, update `CHANGELOG.md`, rebuild and commit `lib/client.js`.
2. Tag and push the release (`git tag vX.Y.Z && git push origin vX.Y.Z`).
3. Read the release commit and timestamp:

   ```sh
   git rev-parse vX.Y.Z^{commit}
   git show -s --format=%ct vX.Y.Z
   ```

4. Update `docs/index.json` with that version, commit, and `publishTimestamp`.
5. Commit the index update and push `main`. The Pages workflow deploys it to
   `https://mango2630.github.io/dsh-conversation-pins/index.json`.

The index installs the exact commit in `source.commit`; never point it at a moving branch.
