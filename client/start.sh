#!/bin/sh

# 等待数据库服务启动
# DATABASE_PORT=$(echo $USER_SERVICE_DATABASE_URL | awk -F[/:] '{print $5}')

# echo "Waiting for the database to be ready..."
# while ! nc -z $USER_SERVICE_DATABASE_URL; do
#   sleep 1
# done

# # 同步数据库
# USER_SERVICE_DATABASE_URL=$(echo $USER_SERVICE_DATABASE_URL | awk -F[/:] '{print $5}')
# echo "Pushing database schema..."
# exec npx prisma db push

# # 启动应用
# echo "Starting the application..."
# exec node server.js

prisma migrate deploy --schema=./prisma/schema.prisma
node server.js


