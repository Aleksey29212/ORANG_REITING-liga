#!/bin/bash

# Скрипт для быстрой отправки проекта на GitHub
# Использование: npm run github-push -- ССЫЛКА_НА_РЕПО

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
  echo "❌ ОШИБКА: Укажите ссылку на ваш репозиторий GitHub."
  echo "Пример: npm run github-push -- https://github.com/ваш-логин/имя-репо.git"
  exit 1
fi

echo "🚀 Начинаю процесс отправки на GitHub..."

# Инициализация если нужно
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git инициализирован."
fi

# Проверка настроек пользователя
if [ -z "$(git config user.name)" ]; then
    git config --global user.name "DartBrig Admin"
    git config --global user.email "admin@dartbrig.pro"
fi

# Процесс коммита
git add .
git commit -m "DartBrig Pro: обновление системы и дизайна"

# Настройка ветки
git branch -M main

# Добавление или обновление удаленного репозитория
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

echo "📤 Отправка файлов..."
git push -u origin main --force

echo ""
echo "✨ ГОТОВО! Ваш проект теперь на GitHub по адресу: $REPO_URL"
echo "💡 В следующий раз можно просто писать: git push"
