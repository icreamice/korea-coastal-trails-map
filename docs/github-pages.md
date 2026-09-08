# GitHub Pages 운영

공개 지도 주소: https://icreamice.github.io/korea-coastal-trails-map/

최초 한 번 저장소 **Settings → Pages → Build and deployment → Source → GitHub Actions**를 선택합니다.
이 설정과 첫 배포가 성공하기 전에는 위 주소가 열리지 않을 수 있습니다.

이후 `main`에 반영된 수정은 `.github/workflows/pages.yml`에서 자동 빌드·배포합니다.
배포 결과는 저장소 Actions의 **Build and deploy GitHub Pages**에서 확인합니다.
PR에서는 타입 검사와 빌드만 수행합니다.

## 지도와 기록

Pages는 `app/page.tsx`, 지도, 상세 컴포넌트와 코스 데이터를 재사용합니다.
별도의 지도 복사본을 수정할 필요가 없습니다.

Pages에서는 서버 API를 실행하거나 계정 기록을 불러오지 않습니다.
**내 기록 열기**는 기존 인증 사이트로 이동합니다:
https://haeparang-coast-map.icreamice.chatgpt.site/

기존 사이트에 접근 가능한 계정만 그곳에서 기록을 저장할 수 있습니다.
Pages 지도에는 계정의 방문 표시·진행률이 동기화되지 않습니다.
GitHub의 자동 배포는 Pages 화면만 갱신하며 기존 인증 사이트는 별도 배포가 필요합니다.

## 정적 빌드

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit -p tsconfig.pages.json
pnpm exec vite build --config vite.pages.config.ts
```

출력은 `dist-pages`입니다. 서버 API, 데이터베이스, 비밀 값은 이 출력에 포함하지 않습니다.
