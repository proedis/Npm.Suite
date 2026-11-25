# Proedis Internal Platform, built from the root of the monorepo and served by nginx.
#
# The build context is the root of the repository: the site compiles the source of the workspace packages
# it documents, so it needs the whole workspace, not only apps/platform. CapRover builds from the root
# too, through apps/platform/captain-definition.

# ---- Build -------------------------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /repo

# Yarn 4, the version packageManager pins, through corepack; no prompt, the build is not interactive
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable

COPY . .

RUN yarn install --immutable

RUN yarn workspace @proedis/platform build


# ---- Serve -------------------------------------------------------------------------------------------
FROM nginx:1.27-alpine

COPY apps/platform/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /repo/apps/platform/build /usr/share/nginx/html

EXPOSE 80
