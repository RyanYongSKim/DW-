# 마감선 핵심 작업 기록

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
- `AGENTS.md`

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
