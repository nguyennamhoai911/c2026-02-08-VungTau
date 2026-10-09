FROM nginx:alpine
COPY tide-app/public/index.html tide-app/public/styles.css tide-app/public/app.js tide-app/public/model.js tide-app/public/data.csv tide-app/public/brand-theme.css tide-app/public/logo-maritime.png tide-app/public/activity-football.png tide-app/public/activity-crab.png tide-app/public/header-coast.jpg /usr/share/nginx/html/
EXPOSE 80

