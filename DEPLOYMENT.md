# Production deployment and Git policy

`yakarta.pro` is served by Jino Passenger. The production entrypoint is
`passenger_wsgi.py`, which serves files from the project directory and handles
lead submissions. The public pages are the root `index.html` and the HTML
files under the route directories; public assets are in `assets/` and
`static/`.

## What belongs in Git

GitHub contains the published Jino release snapshot, not the full local
Django/build workspace. Commit the files Passenger serves directly:

- `passenger_wsgi.py`, the root landing page, and published route directories
  such as `about/`, `blog/`, `cases/`, `contacts/`, `privacy/`, `services/`,
  `solutions/` and `tools/`.
- `assets/`, `static/` and other public files referenced by those pages, such
  as `robots.txt`, `sitemap.xml`, `script.js` and `styles.css`.
- Repository documentation, including `README.md` and this guide.

The local Django sources and release builder (`apps/`, `config/`, `templates/`,
`current site/`, `generated_services/`, `manage.py`, and
`build_static_release.py`) are not part of this production-snapshot repository.
They stay in the development workspace. The root `.gitignore` also excludes
environments, databases and lead data, collected static output, preview
releases, backups, screenshots, audit artifacts, and one-off root scripts. Do
not force-add ignored files just to make a commit.

## Updating the release

Build and review the public HTML and assets in the separate development
workspace. Copy only the verified output files into the production snapshot,
preserving the paths that Passenger serves. The GitHub repository intentionally
does not contain the sources needed to rebuild the local workspace.

The Passenger request handler uses the Python standard library. Do not infer
that development/build dependencies are required by the production host.

## Configuration and sensitive data

Never commit `.env`, host or SMTP credentials, lead records, or local database
files. Configure secrets on Jino through environment variables or a private
host-side environment file. `.env.example` is a template only; review it before
sharing it publicly.

Review deployment and synchronization scripts before use. The one-off scripts
in the development workspace are intentionally not part of this repository.
