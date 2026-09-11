# Deployment

S3 deployment is handled by GitHub Actions. Pushes are deployed to `models-resources/seismic-explorer/` by the `s3-deploy2` job in [`ci.yml`](../.github/workflows/ci.yml), and a released version is promoted to the top-level `index.html` by [`release.yml`](../.github/workflows/release.yml) via `workflow_dispatch`.

## AWS Access

The GitHub actions in this project are allowed to update files in S3 using OIDC. An IAM role has been created in AWS with a trust policy that allows GitHub actions in this specific repository to assume this IAM role. The IAM role has a `RepoName` tag and a managed policy that uses this tag to give the role's users permission to update files in `models-resources/[RepoName]`.

See [deploy-setup.md in starter-projects](https://github.com/concord-consortium/starter-projects/blob/main/doc/deploy-setup.md) for how the AWS side is set up.

Two hardening options sometimes suggested in code review — splitting the build and the deploy into separate jobs, and pinning actions to a commit SHA — have been considered and declined. See [Hardening we have chosen not to do](https://github.com/concord-consortium/starter-projects/blob/main/doc/deploy-setup.md#hardening-we-have-chosen-not-to-do) for the reasons.
