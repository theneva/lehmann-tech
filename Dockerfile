FROM node:16-alpine as builder

WORKDIR /app

# Install dependencies required to build
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/package.json
RUN yarn install --frozen-lockfile

# Copy source files, and build
COPY packages/ packages/
RUN yarn --cwd packages/client build

# Drop all non-production dependencies
RUN yarn install --frozen-lockfile --production

# Copy posts last, since they never affect the build
COPY posts/ posts/
RUN ln -s /app/packages/client/build /app/packages/server/public

FROM node:16-alpine

ENV NODE_ENV production

WORKDIR /app
COPY --from=builder /app ./

CMD ["yarn", "--cwd", "packages/server", "start"]
