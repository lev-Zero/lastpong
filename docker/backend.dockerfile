FROM node:lts

WORKDIR /app

EXPOSE 3000

ENTRYPOINT [ "/bin/sh", "-c", "npm install && npm i -g @nestjs/cli && npm run start:dev" ]