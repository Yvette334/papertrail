# Stage 1:install production dependencies
# Pinned Node.js version on Alpine Linux: small image, fewer vulnerabilities,
# and the same version on every machine
FROM node:20.18.0-alpine AS deps

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY the package files first. Docker caches the install step below,
# so it re-runs only when these two files change
COPY package.json package-lock.json ./

# Install the exact versions from package-lock.json, without devDependencies
# (jest, eslint and nodemon are not needed to run the API)
# then clear the npm cache so it does not add size to the layer
RUN npm ci --omit=dev  && npm cache clean --force

# Stage 2: final runtime image
# Start again from a clean image, so build leftovers are not shipped
FROM node:20.18.0-alpine

# Run Express in production mode and set the default port
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Take ONLY the installed production modules from stage 1,
# owned by the unprivileged "node" user
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy the package file and the application source code
# (after the install, to keep the cache)
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

# The API listens on port 3000
EXPOSE 3000

# Security: run as the unprivileged "node" user that ships with the image,
# not as root
USER node

# Docker marks the container "unhealthy" if /health stops answering
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
  
# Start the API
CMD ["node", "src/server.js"]
