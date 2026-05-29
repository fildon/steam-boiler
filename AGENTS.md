<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Always run the local build before pushing

Run `npm run build` and confirm it exits with no errors before any `git push`. The build runs the TypeScript compiler and ESLint checks that CI runs — errors caught locally mean the deploy never breaks. Do not push if the build fails.
