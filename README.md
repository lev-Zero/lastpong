# LastPong 🏓

<p align="center"><img src="https://blog.kakaocdn.net/dn/KSNXx/btqFhkY8CaX/rd9F5KcQvPOekWeTFeRH2k/img.png"></p>

<div align="center">
<b><i>우리들의 마지막 탁구 게임, LastPong</i></b>
<p>2023.01. 제작 완료</p>
</div>

> 42서울 공통과정 마지막 과제 `ft_transcendence` 결과물입니다 🙂

## ☝️ 프로젝트 소개

- `Socket.io`를 이용하여 게임, 채팅, DM을 구현한 SPA 웹서비스
- `42 Auth`를 이용하여 42 유저만 이용가능하도록 인증
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

| 파트     | 기술스택       | 선정이유                                                                                                                                                                                                                                                |
| -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Common   | TypeScript     | Type 안정성을 보장하여 런타임 에러 방지                                                                                                                                                                                                                 |
|          | Prettier       | 코드 스타일 정형화를 통한 협업 능률 향상                                                                                                                                                                                                                |
|          | Socket.io      | 실시간 채팅 및 게임 기능 구현을 위해 HTTP 통신이 아닌 소켓 통신 필요                                                                                                                                                                                    |
| Frontend | Next.js        | ▶ Zero config & Config Customizing : Webpack 설정과 Babel 설정이 포함되어 있음 ▶ Code splitting & bundling : `next build` 시 자동으로 code splitting 하여 자바스크립트로 번들링 ▶ File-system Routing : pages 기반 라우팅으로 디렉토리 구조 직관성 확보 |
|          | Chakra UI      | 프리메이드 컴포넌트와 유틸리티 → 간략한 코드, 간편한 사용                                                                                                                                                                                               |
|          | Zustand        | 상태변경시 리렌더링을 제어하기 쉽다. 배우기 쉽고 단순한 구조이다.                                                                                                                                                                                       |
| Backend  | NestJS         | ▶ DI : 의존관계를 분리하여 수정 및 재사용이 용이함 ▶ IoC : 컴포넌트와 모듈에 집중한 프로그래밍 가능, 유지보수 또는 확장시 편리                                                                                                                          |
|          | PostgreSQL     | 오픈소스 - 영구 무료, 참고할 자료가 많고 다양함                                                                                                                                                                                                         |
|          | TypeORM        | RDBMS의 데이터 구조와 객체지향 모델 사이의 간격을 줄여 생산성 증가                                                                                                                                                                                      |
|          | Passport       | 42 Auth 인증 기능 간편화                                                                                                                                                                                                                                |
| Infra    | Docker-compose | 컨테이너를 이용한 가상환경 구성 및 빌드 자동화                                                                                                                                                                                                          |

## 👋 팀 정보

| Name   | Github ID                                                                                                                                                                | Role     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 박용준 | <a href="https://github.com/yoopark" target="_blank"><img src="https://img.shields.io/badge/yoopark-181717?style=flat-square&logo=github&logoColor=white"/></a>          | FrontEnd |
| 문치훈 | <a href="https://github.com/lev-Zero" target="_blank"><img src="https://img.shields.io/badge/levㅡZero-181717?style=flat-square&logo=github&logoColor=white"/></a>       | FrontEnd |
| 최선빈 | <a href="https://github.com/choi-sunbin" target="_blank"><img src="https://img.shields.io/badge/choiㅡsunbin-181717?style=flat-square&logo=github&logoColor=white"/></a> | FrontEnd |
| 김정환 | <a href="https://github.com/toy-k" target="_blank"><img src="https://img.shields.io/badge/toyㅡk-181717?style=flat-square&logo=github&logoColor=white"/></a>             | BackEnd  |
