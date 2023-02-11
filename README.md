# LastPong 🏓

<p align="center"><img width="500" src="./asset/lastpong_main.png"></p>

<div align="center">
<b><i>우리들의 마지막 탁구 게임, LastPong</i></b>
<p>2023.01. 제작 완료</p>
</div>

> 42서울 공통과정 마지막 과제 `ft_transcendence` 결과물입니다 🙂

## ☝️ 프로젝트 소개

- `Socket.io`를 이용하여 게임, 채팅, DM을 구현한 SPA 웹서비스
- `42 Auth`를 이용하여 42 유저 대상으로 가입 및 인증 기능 구현
- 유저 생성, 친구 맺기, 친구 차단 등 CRUD 연습

## 💡 구현 중점 사항

- 발생할 수 있는 **다양한 경우의 수를 생각하고 대응하기**
  - 예) 게임 중간에 나갔을 때, 비로그인 유저가 접근하였을 때, 채팅 Owner/Admin 권한 부여에서 발생하는 다양한 케이스
- **결코 UI를 포기하지 않기**
  - 예) 모달창 적극 활용, DM 기능을 실제 서비스처럼 메인에서 눌러볼 수 있도록 제작하기, 탁구 게임 화면 UI를 고전적인 느낌 나도록 만들기

## ⚙️ 설치 및 배포 방법

```bash
$ git clone https://github.com/lev-Zero/lastpong
$ cd lastpong/
# 아래 환경설정 체크
$ docker-compose up -d
```

### localhost 이외의 주소로 배포할 때 수정해야 할 부분

- docker/backend.env의 `CALLBACK_URI`, `FRONTEND_URL`
- frontend/package.json의 `proxy`
- frontend/src/utils/variables.ts의 `SERVER_URL`과 `WS_SERVER_URL`
- 42 OAuth 다른 걸로 이용하는 경우, docker/backend.env의 `UID`, `SECRET` 값도 변경해주어야 함

## 🛠 기술 스택

<table border="1" align="center">
  <th align="center">파트</th>
  <th align="center">기술스택</th>
  <th align="center">선정이유</th>
  <tr>
    <td rowspan="3" align="center">Common</td>
    <td><img src="https://techstack-generator.vercel.app/ts-icon.svg" width="25px" alt="typescript_icon" /> TypeScript</td>
    <td>Type 안정성을 보장하여 런타임 에러 방지</td>
  </tr>
  <tr>
    <td><img src="https://techstack-generator.vercel.app/prettier-icon.svg" width="15px" alt="prettier_icon" /> Prettier</td>
    <td>코드 스타일 정형화를 통한 협업 능률 향상</td>
  </tr>
  <tr>
    <td><img src="https://images.saasworthy.com/socketio_30421_logo_1619604506_tdxqo.png" width="15px" alt="socket.io_icon" /> Socket.io</td>
    <td>실시간 채팅 및 게임 기능 구현을 위해 HTTP 통신이 아닌 소켓 통신 필요</td>
  </tr>
  <tr>
    <td rowspan="3" align="center">Frontend</td>
    <td><img src="https://static-00.iconduck.com/assets.00/next-js-icon-512x512-zuauazrk.png" width="15px" alt="next.js_icon" /> Next.js</td>
    <td> <code>Zero Config</code> : Webpack 및 Babel 설정 없이 빌트인으로 Code Splitting 및 JS 번들링 <br/> <code>File-system Routing</code> : pages 기반 라우팅으로 디렉토리 구조 직관성 확보</td>
  </tr>
  <tr>
    <td><img src="https://pbs.twimg.com/profile_images/1244925541448286208/rzylUjaf_400x400.jpg" width="15px" alt="chakra-ui_icon" /> Chakra UI</td>
    <td>프리메이드 컴포넌트와 유틸리티를 이용한 손쉬운 UI 제작</td>
  </tr>
  <tr>
    <td>🐻 Zustand</td>
    <td>배우기 쉽고 단순한 구조의 상태관리 모듈, 불필요한 리렌더링 방지에 용이함</td>
  </tr>
  <tr>
    <td rowspan="4" align="center">Backend</td>
    <td><img src="https://docs.nestjs.com/assets/logo-small.svg" width="15px" alt="nestjs_icon" /> NestJS</td>
    <td> <code>DI</code> : 의존관계를 분리하여 수정 및 재사용이 용이함 <br/> <code>IoC</code> : 컴포넌트와 모듈에 집중한 프로그래밍 가능, 유지보수 또는 확장시 편리</td>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/46529663/213977435-02cfee1b-ef97-473a-9005-129966a1fe1f.png" width="18px" alt="postgresql_icon" /> PostgreSQL</td>
    <td>영구 무료인 오픈소스, 참고할 자료가 맣고 다양함</td>
  </tr>
  <tr>
    <td><img src="https://seeklogo.com/images/T/typeorm-logo-F243B34DEE-seeklogo.com.png" width="15px" alt="typeorm_icon" /> TypeORM</td>
    <td>RDBMS의 데이터 구조와 객체지향 모델 사이의 간격을 줄여 생산성 증가</td>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/46529663/215252562-a506910d-b351-4592-af18-8d86293c7695.png" width="15px" alt="passport_icon" /> Passport</td>
    <td>42 Auth 인증 기능 간편화</td>
  </tr>
  <tr>
    <td rowspan="1" align="center">Infra</td>
    <td><img src="https://techstack-generator.vercel.app/docker-icon.svg" width="15px" alt="docker-compose_icon" /> Docker-compose</td>
    <td> 컨테이너를 이용한 가상환경 구성 및 빌드 자동화</td>
  </tr>
</table>

## 👋 팀 정보

| Name   | Github ID                                                                                                                                                                | Role     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 박용준 | <a href="https://github.com/yoopark" target="_blank"><img src="https://img.shields.io/badge/yoopark-181717?style=flat-square&logo=github&logoColor=white"/></a>          | FrontEnd |
| 문치훈 | <a href="https://github.com/lev-Zero" target="_blank"><img src="https://img.shields.io/badge/levㅡZero-181717?style=flat-square&logo=github&logoColor=white"/></a>       | FrontEnd |
| 최선빈 | <a href="https://github.com/choi-sunbin" target="_blank"><img src="https://img.shields.io/badge/choiㅡsunbin-181717?style=flat-square&logo=github&logoColor=white"/></a> | FrontEnd |
| 김정환 | <a href="https://github.com/toy-k" target="_blank"><img src="https://img.shields.io/badge/toyㅡk-181717?style=flat-square&logo=github&logoColor=white"/></a>             | BackEnd  |
