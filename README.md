# 픽픽

영상에서 발견한 맛집을 채널과 지역으로 다시 찾는 모바일 우선 웹 앱입니다. 채널이 늘어나도 같은 중립적인 화면을 사용하며, 빨간색은 현재 선택과 핵심 행동에만 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

프로덕션 확인은 `npm run build` 후 `npm run start`로 실행합니다. 환경 변수는 `.env.example`을 복사해 설정합니다.

## 검증 명령

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run content:validate
npm run youtube:sync -- --dry-run --fixture fixtures/youtube/videos.json
npx next build --webpack
npm run test:e2e
```

콘텐츠 원본은 `data/import/catalog.json`이며, Supabase 계약은 `supabase/migrations`와 `supabase/seed.sql`에 있습니다. YouTube 동기화는 50개 단위 요청과 30일 refresh 정책을 사용하고, NAVER 지도 앱을 열 수 없는 경우 주소 복사 fallback을 제공합니다.

## 디자인 기준

상세한 토큰, 컴포넌트, 접근성, 모션 원칙은 [DESIGN.md](./DESIGN.md)를 참고하세요. 제공된 중립 3화면 레퍼런스를 기준으로 하며 특정 채널의 로고나 채널별 테마를 사용하지 않습니다.
