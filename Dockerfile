# Стадия 1: Установка зависимостей
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* ./
RUN npm ci

# Стадия 2: Сборка приложения
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отключаем телеметрию Next.js во время сборки
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Стадия 3: Финальный образ (Runner)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из стадии сборки
COPY --from=builder /app/public ./public

# Устанавливаем права доступа для standalone папки
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Копируем результат сборки в режиме standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# При запуске через node server.js используются переменные окружения
CMD ["node", "server.js"]