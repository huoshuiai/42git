FROM node:20-alpine AS base

# =====安装依赖阶段=====
FROM base AS deps

# 安装 libc6-compat 依赖
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3 libc6-compat busybox ssl_client
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY package-lock.json ./

RUN npm ci

# =====构建阶段=====
FROM base AS builder
WORKDIR /app

# 复制依赖阶段的 node_modules 目录
COPY --from=deps /app/node_modules ./node_modules

# 复制项目的所有文件
COPY . .

# 關閉nextjs遙測追蹤
ENV NEXT_TELEMETRY_DISABLED 1

# 生成 Prisma Client
RUN npx prisma generate

RUN npm run build

# =====运行阶段=====
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV production
# 關閉nextjs遙測追蹤
ENV NEXT_TELEMETRY_DISABLED 1

# 创建系统用户和用户组
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 全局的prisma依賴
RUN npm install -g --no-package-lock --no-save prisma


# 复制构建产物
COPY --from=builder /app/public ./public
# 複製構建時的依賴
COPY --from=builder /app/package.json ./package.json

# 复制 Next.js 的 standalone 和 static 目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

 # important to support Prisma DB migrations in docker-bootstrap-app.sh
COPY --chown=nextjs:nodejs prisma ./prisma/               
COPY --chown=nextjs:nodejs start.sh ./

RUN chmod +x ./start.sh

USER nextjs

ENV PORT 3000

EXPOSE ${PORT}

# Run the shell script using sh or bash

CMD ["dumb-init", "--","./start.sh"]