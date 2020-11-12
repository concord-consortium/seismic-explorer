
#!/bin/bash
SRC_DIR='dist'
DISTRIBUTION_ID='E3MT1G8AEEAXO'
# name of branch to deploy to root of site
PRODUCTION_BRANCH='production'

# extract current TAG if present
# the 2> is to prevent error messages when no match is found
CURRENT_TAG=`git describe --tags --exact-match $GITHUB_SHA 2> /dev/null`

# Extract the branch or tag name from the GITHUB_REF
# it should either be: refs/head/branch-name or
# or refs/tags/v1.2.3
# since we ought to know if this is a branch or tag based on the ref
# we could simplify the CURRENT_TAG approach above
BRANCH_OR_TAG=${GITHUB_REF#refs/*/}
echo branch or tag: $BRANCH_OR_TAG

# strip PT ID from branch name for branch builds
DEPLOY_DIR_NAME=$BRANCH_OR_TAG
PT_PREFIX_REGEX="^([0-9]{8,}-)(.+)$"
PT_SUFFIX_REGEX="^(.+)(-[0-9]{8,})$"
if [[ $DEPLOY_DIR_NAME =~ $PT_PREFIX_REGEX ]]; then
  DEPLOY_DIR_NAME=${BASH_REMATCH[2]}
fi
if [[ $DEPLOY_DIR_NAME =~ $PT_SUFFIX_REGEX ]]; then
  DEPLOY_DIR_NAME=${BASH_REMATCH[1]}
fi

# tagged builds deploy to /version/TAG_NAME
if [ "$BRANCH_OR_TAG" = "$CURRENT_TAG" ]; then
  mkdir -p _site/version
  S3_DEPLOY_DIR="version/$BRANCH_OR_TAG"
  DEPLOY_DEST="_site/$S3_DEPLOY_DIR"
  INVAL_PATH="/version/$BRANCH_OR_TAG/index.html"
  # used by s3_website.yml
  export S3_DEPLOY_DIR

# production branch builds deploy to root of site
elif [ "$BRANCH_OR_TAG" = "$PRODUCTION_BRANCH" ]; then
  DEPLOY_DEST="_site"
  INVAL_PATH="/index.html"

# branch builds deploy to /branch/BRANCH_NAME
else
  mkdir -p _site/branch
  S3_DEPLOY_DIR="branch/$DEPLOY_DIR_NAME"
  DEPLOY_DEST="_site/$S3_DEPLOY_DIR"
  INVAL_PATH="/branch/$DEPLOY_DIR_NAME/index.html"
  # used by s3_website.yml
  export S3_DEPLOY_DIR
fi

# copy files to destination
mv $SRC_DIR $DEPLOY_DEST

# deploy the site contents
s3_website push --site _site

# explicit CloudFront invalidation to workaround s3_website gem invalidation bug
# with origin path (https://github.com/laurilehmijoki/s3_website/issues/207).
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths $INVAL_PATH