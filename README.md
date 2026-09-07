# 코리아둘레길 지도 · 나의 걷기 기록

해파랑길·남파랑길·서해랑길의 노선과 코스 상세를 살펴보고, 다녀온 코스를 계정에 저장하는 지도 웹앱입니다.

## 주요 기능

- 해파랑길 50개, 남파랑길 90개, 서해랑길 109개 코스(본선 103개 + 지선 6개)
- 길·지역·방문 상태별 선택, 지도 이동·확대·축소
- 코스별 거리, 소요시간, 난이도, 주요지점, 편의시설, 고도 그래프
- 시점·종점 주소와 나란히 배치한 스탬프 QR 위치
- 방문일·메모 저장, 수정·삭제 및 다녀온 거리 집계
- 인증된 사용자별 기록 분리와 다른 기기에서의 조회
- 모바일 대응

## 실행

Node.js 22.13 이상과 pnpm이 필요합니다.

```sh
pnpm install --frozen-lockfile
pnpm exec wrangler d1 migrations apply DB --local --config wrangler.local.json
pnpm dev
```

개발 서버가 안내하는 주소를 엽니다. 로컬 기록 저장 기능은 페이지의 **계정으로 로그인**을 통해 테스트 계정으로 연결합니다. 로컬 데이터는 `.wrangler/`에 저장되며 Git에 포함되지 않습니다.

```sh
pnpm exec tsc --noEmit
pnpm build
```

## 저장소와 인증

React·TypeScript·Vinext·Leaflet과 Cloudflare D1을 사용합니다. 저장 API는 서버에서 `oai-authenticated-user-id` 헤더를 확인하고 사용자별로 데이터를 구분합니다.

현재 인증 흐름은 OpenAI Sites의 인증 프록시를 전제로 합니다. 다른 환경에 배포할 때는 이 헤더를 신뢰할 수 있게 만드는 인증 프록시 또는 별도의 서버 인증이 필요합니다. 외부 요청이 임의의 사용자 ID 헤더를 전달하도록 노출하면 안 됩니다.

`.openai/hosting.json`에는 논리적 데이터베이스 바인딩 `DB`만 포함했습니다. 기존 개인 사이트의 프로젝트 ID, 인증 토큰, 방문 기록, 실제 데이터베이스 파일은 포함하지 않았습니다. 새 배포 환경의 프로젝트 및 데이터베이스 연결을 별도로 구성해야 합니다.

## 검증

개발 서버가 실행 중일 때 다음 명령으로 로컬 저장 API를 검증할 수 있습니다. Python 3 표준 라이브러리만 사용합니다.

```sh
python3 scripts/verify-visits.py
```

인증, 저장·수정·조회·삭제, 새 클라이언트에서의 조회, 잘못된 날짜 및 입력 거부, 계정별 SQL 분리를 검사합니다. 지정된 테스트 코스에 기존 기록이 있으면 덮어쓰지 않고 중단합니다. 테스트가 생성한 기록은 종료 시 삭제합니다. 실제 사용자의 데이터베이스를 대상으로 실행하지 마세요.

## 데이터와 출처

코스 데이터는 2026년 9월 7일 확인한 [두루누비](https://www.durunubi.kr/) 공개 코스 안내 기준입니다.

- [해파랑길 소개](https://www.durunubi.kr/haeparang-introduction.do)
- [남파랑길 소개](https://www.durunubi.kr/namparang-introduction.do)
- [서해랑길 소개](https://www.durunubi.kr/seohaerang-introduction.do)
- 배경지도: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

실시간 갱신 기능은 포함하지 않습니다. 원본에 없는 정보는 미제공으로 표시하며, 고도는 GPX 표본을 사용하므로 안내된 코스 거리와 차이가 있을 수 있습니다. 실제 방문 전 두루누비의 최신 통제·우회 정보를 확인하세요.

`app/courses.json`에 실행에 필요한 데이터가 포함되어 있습니다. `scripts/collect-course-details.py`와 `scripts/build-course-data.py`는 데이터 작성 당시의 수집·변환 도구이며, 실행 시 스크립트에 명시된 `/tmp/` 원본 자료가 필요합니다. 일반 실행·빌드에는 이 도구가 필요하지 않습니다.

이 프로젝트는 두루누비의 공식 서비스가 아닙니다. 원본 코스 정보와 지도, 외부 라이브러리의 권리 및 이용 조건은 각 제공자에게 귀속됩니다. 저장소 공개가 제3자 자료에 대한 별도 이용 허락을 의미하지는 않습니다.
