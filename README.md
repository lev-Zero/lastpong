# lastpong

ft_transcendence project in 42 Seoul

### localhost 이외의 주소로 배포할 때 수정해야 할 부분

- docker/backend.env의 `CALLBACK_URI`, `FRONTEND_URL`
- frontend/package.json의 `proxy`
- frontend/src/utils/variables.ts의 `SERVER_URL`과 `WS_SERVER_URL`
