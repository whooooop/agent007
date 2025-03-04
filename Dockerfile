FROM node:20.11.1-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# FROM base AS prod-deps
# # RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++
RUN npm ci
RUN find src -name "*.test.ts" -delete
RUN npm run build

FROM base
# COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules 
CMD ["pnpm", "start"]
