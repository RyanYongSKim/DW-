# YS-DW 업무 확인 리스트 핵심 작업 기록

핵심 기능의 추가·수정·제거 이력을 한국 시간(Asia/Seoul) 기준으로 기록한다. 단순 문구 교정이나 핵심 동작에 영향을 주지 않는 작은 스타일 변경은 생략할 수 있다.

## 2026-08-05 16:16:03 KST

### 현재까지의 핵심 구현 정리

- 순수 HTML, CSS, JavaScript 기반의 거래처 업무 마감 관리 화면을 구현했다.
- 거래처명, 처리할 업무와 마감시간을 입력해 업무를 등록하고 브라우저 `localStorage`에 자동 저장한다.
- 미처리 업무를 기한 지남 우선 및 마감시간순으로 정렬한다.
- 상태를 `진행 중`, `마감 임박`, `기한 지남`, `처리 완료`, `취소됨`으로 구분한다.
- 미처리, 처리·취소, 전체 필터로 업무 내용을 구분해 확인한다.
- 기존 업무의 거래처명, 업무 내용과 마감시간을 수정할 수 있다.
- 업무 취소 시 기록을 삭제하지 않고 `취소됨` 상태로 보존한다.
- 모든 상태의 업무에 삭제 기능을 제공하며, 거래처명과 업무명이 포함된 확인창에서 승인한 경우에만 영구 삭제한다.
- 지정 상태색과 모바일 반응형 기준을 `design.md`에 정리하고 화면에 반영했다.

### 기록 규칙 추가

- 이후 새로운 핵심 기능이나 핵심 수정·제거 작업이 끝나면 이 파일에 일자, 시간, 변경 내용과 영향 파일을 추가한다.
- 작업 전 `prd.md`, `design.md`, `memory.md`를 함께 확인하도록 `AGENTS.md`를 갱신했다.

### 영향 파일

- `index.html`
- `styles.css`
- `app.js`
- `prd.md`
- `design.md`
- `AGENTS.md`

## 2026-08-05 16:33:58 KST

### 프로젝트 폴더 재분류

- 실행 시작 파일인 `index.html`과 작업 규칙인 `AGENTS.md`를 프로젝트 최상위에 유지했다.
- `styles.css`를 `assets/css/styles.css`로 이동했다.
- `app.js`를 `assets/js/app.js`로 이동했다.
- `prd.md`, `prd.html`, `design.md`, `memory.md`를 `docs` 폴더로 이동했다.
- `index.html`의 CSS와 JavaScript 참조 경로를 새 구조에 맞게 변경했다.
- `AGENTS.md`의 선행 자료와 작업 기록 경로를 `docs` 기준으로 변경하고 파일 분류 규칙을 추가했다.
- 브라우저 저장 데이터가 유지되도록 `localStorage` 키는 변경하지 않았다.

### 영향 파일

- `index.html`
- `AGENTS.md`
- `assets/css/styles.css`
- `assets/js/app.js`
- `docs/prd.md`
- `docs/prd.html`
- `docs/design.md`
- `docs/memory.md`

## 2026-08-05 16:50:18 KST

### 거래처별 접수 번호와 마감 우선 정렬 개선

- 업무 번호의 의미를 실제 처리 순서가 아닌 같은 거래처에서 문의를 접수한 순서를 나타내는 `접수 번호`로 명확히 했다.
- 새 업무 등록 시 같은 거래처에서 사용한 가장 큰 번호의 다음 번호를 기본으로 제안한다.
- 기존에 사용자가 입력한 접수 번호는 변경하지 않고 보존한다.
- 미처리 목록 정렬을 `상태 → 마감시간 → 같은 거래처의 접수 번호` 순서로 수정했다.
- 접수 번호가 빠르더라도 마감 상태가 더 급하거나 마감시간이 더 빠른 업무를 먼저 표시한다.
- 상태와 마감시간이 같은 동일 거래처 업무는 접수 번호가 빠른 순서로 표시한다.
- 대표 데이터로 마감시간 우선과 동일 마감시간의 번호순 정렬을 확인했고 JavaScript 구문 검사를 통과했다.

### 영향 파일

- `index.html`
- `assets/js/app.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`
- `AGENTS.md`

## 2026-08-12 10:33:27 KST

### CurvedInput 기반 업무 검색 추가

- React Bits 공식 `CurvedInput-JS-CSS` 레지스트리의 SVG 곡선 구조와 스타일을 확인했다.
- 공식 레지스트리에 별도 패키지 의존성이 없음을 확인했다.
- 프로젝트의 순수 HTML, CSS, JavaScript 규칙을 보존하기 위해 React와 shadcn을 설치하지 않고 바닐라 JavaScript 컴포넌트로 포팅했다.
- 업무 목록 위에 밝은 테마, 평평한 형태, 버튼과 아이콘이 없는 검색창을 추가했다.
- 검색어를 입력하면 현재 상태 필터 안에서 거래처명과 업무 내용이 일치하는 업무만 즉시 표시한다.
- 검색은 저장 데이터와 마감 우선 정렬을 변경하지 않는다.
- 모바일에서 검색창 너비가 화면을 넘지 않도록 `100%` 반응형 너비를 적용했다.

### 영향 파일

- `index.html`
- `assets/components/curved-input.css`
- `assets/components/curved-input.js`
- `assets/css/styles.css`
- `assets/js/app.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`
- `AGENTS.md`

## 2026-08-12 10:37:06 KST

### ScrollStack 업무 카드 효과 추가

- React Bits 공식 `ScrollStack-JS-CSS` 레지스트리 소스와 `lenis@^1.3.13` 의존성을 확인했다.
- 프로젝트의 순수 HTML, CSS, JavaScript 및 무설치 규칙을 지키기 위해 React와 Lenis를 설치하지 않고 스크롤 스택 동작을 바닐라 JavaScript로 포팅했다.
- 전체 업무 목록의 각 카드가 현재 정렬 순서를 유지하면서 위쪽에 겹쳐 쌓이도록 적용했다.
- 카드가 쌓일 때 약한 축소 효과를 적용하고 blur는 사용하지 않아 업무 문구와 버튼 가독성을 유지했다.
- 동적으로 추가·수정·검색되는 카드 목록을 `MutationObserver`로 다시 인식한다.
- 모바일에서는 스택 간격을 줄이고, 모션 감소 설정에서는 일반 목록으로 표시한다.
- 기존 저장, 마감 정렬, 검색, 수정, 취소, 삭제 및 처리 동작은 변경하지 않았다.

### 영향 파일

- `index.html`
- `assets/components/scroll-stack.css`
- `assets/components/scroll-stack.js`
- `assets/js/app.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`

## 2026-08-12 10:48:13 KST

### Orbiting Items 3D 상태 현황 추가

- Animata 공식 `orbiting-items-3-d` 레지스트리 소스와 `lucide-react@^0.475.0` 의존성을 확인했다.
- 프로젝트의 순수 HTML, CSS, JavaScript 및 무설치 규칙에 따라 React와 lucide-react를 설치하지 않고 3D 타원 궤도 계산을 바닐라 JavaScript로 포팅했다.
- 장식 아이콘 대신 실제 `진행 중`, `마감 임박`, `기한 지남`, `처리 완료` 건수를 궤도 항목으로 사용했다.
- 상단 업무 현황 중앙에는 기존 남은 업무 수를 유지하고 주변에 상태별 건수를 표시했다.
- 업무 데이터가 변경되면 상태별 건수가 다시 계산되어 표시된다.
- 기존 상태색을 궤도 항목 테두리에 적용하고, 모바일 너비와 모션 감소 설정을 지원했다.
- 기존 저장, 정렬, 검색, 카드 스택, 수정, 취소, 삭제 및 처리 기능은 변경하지 않았다.

### 영향 파일

- `index.html`
- `assets/components/orbiting-items-3d.css`
- `assets/components/orbiting-items-3d.js`
- `assets/css/styles.css`
- `assets/js/app.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`

## 2026-08-12 10:55:50 KST

### 처리된 업무 기록 영역과 후속 업무 추가

- 처리 완료 업무를 진행 목록 및 취소 기록과 분리한 `처리된 업무` 영역을 진행 목록 아래에 추가했다.
- 처리 기록에 거래처명, 접수 번호, 처리 업무, 마감시간과 실제 처리 시각을 표시한다.
- 처리된 업무는 최근 처리 시각순으로 표시하며 검색어를 함께 적용한다.
- 기존 `처리·취소` 필터를 `취소됨`으로 변경하고 완료 기록은 별도 영역에서만 표시한다.
- 처리 완료 카드에 `후속 업무 추가` 버튼을 추가했다.
- 후속 업무 추가 시 기존 거래처명과 다음 접수 번호만 입력란에 불러오며 기존 완료 기록은 유지한다.
- 진행 업무가 없어도 처리된 업무 영역이 계속 표시되도록 렌더링 흐름을 분리했다.
- 모바일에서는 완료 시각, 삭제와 후속 업무 버튼이 화면 밖으로 나가지 않도록 2열로 배치한다.

### 영향 파일

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`

## 2026-08-12 11:33:25 KST

### 프로젝트 전용 AI 개발팀 구성

- `.codex/config.toml`에서 서브 에이전트를 활성화하고 동시 실행 한도를 4개로 설정했다.
- HTML 담당 `짱구`, CSS 담당 `철수`, JavaScript 담당 `훈이`, QA 엔지니어 `맹구`를 프로젝트 전용 Codex 에이전트로 등록했다.
- 각 에이전트가 이름과 역할 질문에 지정된 형식으로 답하도록 정체성 지침을 추가했다.
- 구현 담당자는 자신의 파일 영역에 집중하고 다른 영역 변경은 메인 에이전트에게 보고하도록 경계를 설정했다.
- QA 담당 맹구는 읽기 전용으로 요구사항, 회귀, 접근성, 모바일, 저장과 정렬을 검증하도록 설정했다.
- 루트 `AGENTS.md`에 역할별 위임, 충돌 방지를 위한 순차 작업과 최종 QA 규칙을 추가했다.

### 영향 파일

- `.codex/config.toml`
- `.codex/agents/jjanggu.toml`
- `.codex/agents/cheolsu.toml`
- `.codex/agents/hooni.toml`
- `.codex/agents/maenggu.toml`
- `AGENTS.md`
- `docs/memory.md`
# 2026-08-12 15:05:37 KST

## 업무 데이터 내보내기·가져오기 추가

- 브라우저별 `localStorage`에 저장된 전체 업무를 JSON 파일로 내려받는 `데이터 내보내기` 기능을 추가했다.
- 내보낸 JSON 파일을 다른 브라우저나 배포 사이트에서 불러오는 `데이터 가져오기` 기능을 추가했다.
- 가져오기 전에 업무 건수와 기존 데이터 교체 여부를 확인하고, 형식이 올바르지 않으면 안내하도록 했다.
- 모바일 화면에서도 데이터 관리 버튼이 화면 밖으로 나가지 않도록 반응형 크기를 적용했다.

### 영향 파일

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `docs/memory.md`
# 2026-08-12 16:02:00 KST

## Supabase 업무 영구 저장 환경 구축

- 기존 Supabase 프로젝트에 `tasks` 테이블을 만들고 진행, 완료, 취소 업무를 한 테이블에 기록하도록 구성했다.
- 익명 사용자 인증을 활성화하고 `user_id` 소유권을 검사하는 조회·등록·수정·삭제 RLS 정책을 적용했다.
- 브라우저에는 공개 가능한 publishable key만 연결하고 비밀 키는 포함하지 않았다.
- 서버 데이터가 있으면 우선 불러오고, 서버가 비어 있으면 기존 `localStorage` 업무를 최초 1회 자동 이전하도록 연결했다.
- 서버 연결 실패 시 브라우저 저장을 계속 사용하는 안전장치를 유지했다.
- Supabase 공식 CLI로 로컬 설정과 마이그레이션 파일을 생성했다.
- 실제 익명 로그인, 업무 등록·조회·삭제 테스트와 사용자 간 데이터 격리 테스트를 수행했다.

### 영향 파일

- `index.html`
- `assets/js/app.js`
- `assets/js/supabase-config.js`
- `assets/js/supabase-sync.js`
- `supabase/config.toml`
- `supabase/migrations/20260812070412_create_tasks.sql`
- `docs/prd.md`
- `docs/memory.md`
- `AGENTS.md`
# 2026-08-12 16:17:06 KST

## 가져온 업무의 서버 저장 누락 수정

- JSON 업무 가져오기 직후 창을 닫으면 비동기 Supabase 저장이 끝나지 않아 다시 열었을 때 업무가 사라지는 문제를 수정했다.
- 최초 서버 불러오기가 끝날 때까지 기다린 뒤 가져온 업무를 적용하도록 순서를 보장했다.
- 여러 저장 요청을 순서대로 처리하는 대기열을 추가해 앞선 저장과 뒤의 저장이 충돌하지 않도록 했다.
- 가져오기 버튼에 `서버에 저장 중…` 상태를 표시하고 Supabase 저장이 성공한 뒤에만 완료 안내를 표시한다.
- 서버 저장 실패 시 브라우저 저장 여부와 재시도 방법을 구분해 안내하도록 했다.

### 영향 파일

- `assets/js/app.js`
- `docs/prd.md`
- `docs/memory.md`

# 2026-08-12 16:45:00 KST

## 가져온 업무의 Supabase 소유권 충돌 수정

- 과거 브라우저에서 내보낸 업무 ID가 해당 익명 사용자의 서버 행에 남아 있을 때, 새 익명 사용자가 같은 ID로 `upsert`하면 RLS가 403으로 차단하는 원인을 확인했다.
- JSON 가져오기 시 업무 내용과 상태는 유지하되 각 업무에 새 내부 ID를 발급해 현재 사용자의 새 서버 행으로 저장하도록 수정했다.
- 일반 업무 등록과 가져오기가 동일한 ID 생성 함수를 사용하도록 정리했다.
- 서버 저장 실패 안내에서 인터넷 문제로 단정하던 문구를 제거하고 재시도 방법을 안내하도록 수정했다.

### 영향 파일

- `assets/js/app.js`
- `docs/prd.md`
- `docs/memory.md`

## 2026-08-12 17:12:00 KST

### Supabase 이메일 인증 링크로 PC·핸드폰 업무 연결

- 강제 로그인 화면 없이 익명 사용자도 기존 업무 화면과 핵심 기능을 바로 사용할 수 있게 유지했다.
- 업무가 있는 PC의 익명 계정에 이메일을 연결하는 `현재 업무 연결`과 다른 기기에서 같은 이메일로 로그인하는 `업무 불러오기`를 추가했다.
- 비밀번호 대신 Supabase 이메일 인증 링크를 사용하고 인증 세션을 브라우저에 유지해 이후 자동 연결되도록 구성했다.
- 기존 익명 사용자는 같은 사용자 ID에 이메일 인증 수단을 연결하므로 기존 `tasks.user_id` 소유권과 서버 업무가 유지된다.
- 브라우저 캐시를 사용자 ID별 키로 분리하고 기존 공용 캐시는 최초 사용자에게 한 번만 이전해 데이터 혼입을 방지했다.
- Supabase Authentication에서 수동 계정 연결을 활성화하고 Site URL을 실제 배포 주소로 수정했다.
- 헤더에 브라우저 전용·연결 이메일 상태와 기기 연결·로그아웃 버튼을 추가하고 360px 모바일 폭에서 연결 창을 한 열로 배치했다.

### 영향 파일

- `index.html`
- `assets/css/styles.css`
- `assets/js/supabase-sync.js`
- `assets/js/app.js`
- `supabase/config.toml`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`

## 2026-08-12 17:30:00 KST

### 휴대폰 마감 달력 선택 버튼 추가

- `처리 마감시간` 옆에 `달력 열기` 버튼을 추가해 휴대폰에서 기기의 기본 날짜·시간 선택기를 직접 열 수 있게 했다.
- 브라우저가 `showPicker()`를 지원하면 이를 사용하고, 지원하지 않으면 마감시간 입력란의 기본 선택 동작으로 전환한다.
- 360px 모바일 폭에서도 날짜 입력란과 달력 버튼이 같은 줄에서 화면 밖으로 나가지 않도록 반응형 너비를 적용했다.

### 영향 파일

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`

## 2026-08-13 08:11:00 KST

### 제품명 변경과 최초 1회 자동 기기 동기화 개선

- 화면과 브라우저 제목을 `YS-DW 업무 확인 리스트`로 변경했다.
- 기기마다 다른 익명 사용자 ID가 만들어져 PC와 휴대폰의 업무가 달라질 수 있었고, 서버 조회 전에 빈 배열을 먼저 표시해 최초 화면이 비어 보일 수 있었던 원인을 확인했다.
- `현재 업무 연결`과 `업무 불러오기` 선택을 제거하고 이메일 입력 하나로 현재 기기에 필요한 연결 방식을 자동 판단하도록 단순화했다.
- 각 기기에서 최초 인증을 한 번 마치면 Supabase 세션을 유지해 이후에는 별도 이메일 확인 없이 자동 연결되도록 했다.
- 서버 업무 확인이 끝나기 전에는 빈 목록 대신 로딩 안내를 표시하고 입력을 잠시 잠가 초기 빈 데이터가 서버 자료를 덮지 않게 했다.
- Supabase의 `tasks` 실시간 변경 전송을 활성화하고 실시간 구독, 20초 주기 확인, 화면 복귀와 온라인 복귀 시 재확인을 추가했다.
- 오프라인 변경은 브라우저에 대기 상태로 남기고 연결 복구 시 서버에 먼저 전송하며, 서버에서 업무를 모두 지운 경우 이전 브라우저 캐시가 다시 살아나지 않도록 했다.
- 헤더에 자동 동기화 상태를 표시하고 오프라인일 때에는 브라우저 저장 상태를 명확히 알리도록 했다.
- 웹 앱 매니페스트, 서비스 워커와 앱 아이콘을 추가해 PC와 휴대폰에서 설치형 바로가기로 사용할 수 있게 했다.

### 영향 파일

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/js/supabase-sync.js`
- `assets/js/pwa.js`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `manifest.webmanifest`
- `service-worker.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`

## 2026-08-13 08:34:33 KST

### 제품명 문구 변경

- 사이트 상단 브랜드와 브라우저 제목을 `YS-DW 처리업무 확인 리스트`로 변경했다.
- 설치 앱 이름, 화면 하단 제품명과 제품 문서 제목도 같은 문구로 통일했다.
- 기존 설치 앱이 새 이름을 갱신하도록 서비스 워커 캐시 버전을 변경했다.

### 영향 파일

- `index.html`
- `manifest.webmanifest`
- `service-worker.js`
- `dist/client/index.html`
- `dist/client/manifest.webmanifest`
- `dist/client/service-worker.js`
- `docs/prd.md`
- `docs/design.md`
- `docs/memory.md`
