FROM node:lts

WORKDIR /app

EXPOSE 8080

ENTRYPOINT [ "/bin/sh", "-c", "npm install && npm run dev" ]