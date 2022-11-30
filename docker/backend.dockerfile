FROM node:lts

WORKDIR /app

EXPOSE 3000

ENTRYPOINT [ "/bin/sh", "-c", "npm install && npm run start:dev" ]