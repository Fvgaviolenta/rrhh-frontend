FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ARG NEXT_PUBLIC_API_GATEWAY_URL=http://127.0.0.1:8080
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=build --chown=nextjs:nextjs /app/public ./public
COPY --from=build --chown=nextjs:nextjs /app/.next ./.next
COPY --from=build --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nextjs /app/package.json ./package.json
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
    CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["npm", "start"]
