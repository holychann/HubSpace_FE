# HubSpace 프론트엔드 디자인 가이드

현재 코드에 이미 쓰이고 있는 디자인 규칙을 정리한 문서다. 새 규칙을 만드는 문서가 아니라, 새 화면을 만들 때 기존 화면과 어긋나지 않도록 참고하는 기준이다. 값은 실제 CSS에서 가져왔으며, 출처 파일을 함께 적는다.

## 1. 화면 계열

| 계열 | 화면 | 특징 |
|---|---|---|
| 관리자 화면 | 대시보드, 이벤트 생성(CSV·폼), 이벤트 편집 | `AdminLayout` 안에서 회색 배경(`--color-background`) 위에 흰 카드 섹션을 쌓는다 |
| 공개 화면 | 조회(`/search`), 결과(`/result`), 약관 | `GradientLayout`의 그라데이션 SVG 배경 위에 가운데 정렬된 좁은 카드(최대 411px) |
| 홈 | 홈(`/`, 로그인 버튼 포함) | 흰 바탕의 소개 화면. 공통 헤더(`src/components/header`)와 자체 푸터를 쓰고, 공통 푸터는 붙이지 않는다. 첫 화면은 궤도 그림(`HomeOrbit`), 버튼은 알약 모양(`src/pages/homePage`) |
| 문의하기 | 문의하기(`/contact`) | 공통 헤더(`src/components/header`)와 흰 바탕에 FAQ·이메일 문의 영역. 아래에는 공통 푸터를 붙인다(`src/pages/contactPage`) |
| 이용 방법 | 이용 방법(`/guide`) | 공통 헤더와 흰 바탕에 Google Forms·파일 업로드 탭, 단계별 설명과 화면 예시. 화면 예시는 실제 화면을 단순하게 옮긴 그림이다. 아래에는 공통 푸터를 붙인다(`src/pages/guidePage`) |

관리자 화면을 새로 만들 때는 `src/pages/csvCreatePage`와 `src/pages/csvDetailPage`(파일 변경)를 기준 화면으로 삼는다. 두 화면은 데이터 파일 업로드·컬럼 선택·미리보기를 공통 컴포넌트 `CsvFileUpload`, `CsvColumnSelect`, `CsvPreview`(`src/components`)로 함께 쓴다.

## 2. 색상

### 2.1 토큰 (`src/styles/palette.css`)

새 코드는 아래 변수를 우선 사용한다.

| 변수 | 값 | 용도 |
|---|---|---|
| `--color-white` | `#ffffff` | 카드 배경 |
| `--color-main` | `#3280ff` | 대표 파랑. `EventButton` 글자·테두리 |
| `--color-text` | `#050064` | 기본 글자, 진한 남색. 모달의 주요 버튼 배경 |
| `--color-text-additional` | `#43414f` | 설명 글자 |
| `--color-input` | `#a2a9b8` | placeholder, 비어 있는 선택값 |
| `--color-box-conditional` | `#f5f5f8` | 안내 박스, 선택(optional) 배지, 메뉴 hover |
| `--color-border` | `rgb(129 129 129 / 0.28)` | 입력·드롭다운 테두리, 구분선 |
| `--color-background` | `#f1f5f9` | 관리자 화면 배경 |
| `--color-box-view` / `--color-action-view` | `#effdfa` / `#1c7a72` | 조회용 링크 박스 |
| `--color-box-apply` / `--color-action-apply` | `#faf5ff` / `#7e22ce` | 폼(신청) 링크 박스 |
| `--color-active` / `--color-active-bg` | `#05cb45` / `#effdf4` | 활성 상태 |
| `--color-disabled` / `--color-disabled-bg` | `#959595` / `#f0f0f0` | 비활성 상태, 예시 문구 |
| `--color-exit` | `#e70000` | 삭제·종료·필수 표시·오류 |

### 2.2 토큰화되지 않았지만 반복되는 값

아래 값은 변수 없이 여러 파일에 직접 쓰여 있다. 같은 역할이면 같은 값을 그대로 쓰고, 다른 값을 새로 만들지 않는다.

| 값 | 역할 | 주로 쓰는 곳 |
|---|---|---|
| `#2d3b86` | 선택·포커스 강조 남색. 체크박스 `accent-color`, `focus-visible` 외곽선, 선택된 값 글자, 스피너 색 | CsvColumnSelect, EventDropdown, EventItem |
| `#e9f3ff` | 선택된 항목·칩 배경, 드롭다운 항목 hover | CsvColumnSelect, EventDropdown |
| `#4b5682` | 배지·파일명 같은 보조 글자 | CsvCreatePage 미리보기 |
| `rgba(183, 193, 231, a)` | 연한 파랑 테두리(배지, 안내 박스 왼쪽 선) | CsvCreatePage |
| `rgba(45, 59, 134, a)` | `#2d3b86`의 투명 버전(hover 그림자, 포커스 링) | CsvCreatePage |
| `rgba(224, 54, 54, a)` | 필수 배지 배경·테두리 | CsvCreatePage |

강조색이 두 갈래라는 점에 주의한다. 버튼 계열은 `--color-main`(밝은 파랑), 입력·선택 계열은 `#2d3b86`(남색)을 쓴다.

## 3. 타이포그래피

글꼴은 Pretendard 가변 폰트(`pretendard` 패키지의 dynamic subset) 하나이며, 글꼴 이름은 직접 쓰지 않고 `var(--font-family)`로 지정한다. 굵기는 `--font-light`(300), `--font-regular`(400), `--font-medium`(500), `--font-semibold`(600), `--font-bold`(700)만 쓴다 (`src/styles/font.css`). 제목은 `--font-semibold`를 쓰고, `--font-bold`는 홈 첫 화면과 이용 방법 시작하기의 큰 제목 줄(`.home-hero__solution`, `.guide-start__solution`)에만 쓴다.

| 역할 | 크기 / 굵기 | 예 |
|---|---|---|
| 대시보드 제목 | 28px / semibold, `letter-spacing: -0.025em` | `.dashBoard-header__title` |
| 모달 제목 | 22px / semibold | `.editTitleModal-header__title` |
| 생성·파일 변경 화면 제목 | 24px / semibold, `letter-spacing: -0.02em` (모바일 22px) | `.csvCreate-title` |
| 섹션 제목, 카드 제목 | 18px / medium (모바일 16px) | `.csvFileUpload__title--title`, `.eventItem-title__title` |
| 본문, 버튼 | 14~15px / regular·medium | `.eventItem-info__info`, `.eventButton-button` |
| 표, 미리보기 설명 | 13px | `.csvPreview__table td` |
| 안내 문구, 입력값 | 12px / light | `.csvColumnSelect__info` |
| 배지·필수 표시 | 11~12px / medium | `.csvColumnSelect__title--notice` |

## 4. 레이아웃

### 4.1 관리자 화면 골격

- 헤더는 홈·문의하기와 같은 공통 헤더(`src/components/header`)를 쓰고, 오른쪽 끝에는 닉네임만 보인다. 높이는 `--admin-header-height` 변수로 관리한다: 767px 이하 56px, 768px 이상 72px (`AdminLayout.css`).
- 페이지 루트는 `height: calc(100svh - var(--admin-header-height, 100px))`로 잡고, 안쪽 컨테이너가 세로 스크롤한다.
- 생성·편집 화면의 콘텐츠 폭은 960px이다: `padding: 50px max(80px, calc((100% - 960px) / 2)) calc(88px + env(safe-area-inset-bottom))`.
- 대시보드의 콘텐츠 폭은 1112~1120px이다.

### 4.2 섹션 카드

| 속성 | 데스크톱 | 767px 이하 |
|---|---|---|
| 배경 | `--color-white` | 동일 |
| 안쪽 여백 | 40px | 20px |
| 모서리 | 10px | 12px |
| 섹션 간격 | 44px (마지막 필드 섹션 50px) | 24px |

미리보기처럼 "결과를 보여주는" 카드는 더 강조된 형태를 쓴다: 모서리 18px, 연한 파랑 테두리, 흰색→연파랑 그라데이션 배경, 넓은 그림자 (`.csvPreview`).

### 4.3 반응형 기준

`src/styles/screen.css`에 640/768/1024 변수가 있지만, 관리자 화면 CSS는 실제로 아래 값을 쓴다.

- `max-width: 960px`: 좌우 여백 24px로 축소, 표 글자 축소, 대시보드 링크 세로 배치
- `max-width: 767px`: 카드 여백 20px, 드롭다운 세로 배치, 터치 대상 높이 44~48px
- `max-width: 480px`: 모달을 하단 시트처럼 배치, 버튼 2열 그리드

## 5. 컴포넌트 패턴

### 5.1 섹션 머리

제목 옆에 보조 표시를 둔다. 필수·선택 여부는 참고 정보라 배경 없는 작은 글자로, 지금 해야 할 일은 알약 모양 배지로 보여준다. 제목과는 글자 아래선(`align-items: baseline`)에 맞추고 간격은 8px이다.

| 표시 | 모양 | 예 |
|---|---|---|
| 필수 | 배경 없음, 12px regular, 조금 부드러운 빨강 `#e04848` | "2개 이상 필수" |
| 선택 | 배경 없음, 12px regular, `--color-disabled` | "선택" |
| 단계 안내 | 알약 배지: `rgba(45, 59, 134, 0.08)` 배경 + `#2d3b86` 글자 | "먼저 파일을 첨부해주세요" |

제목 아래 설명은 옅은 회색 박스(`--color-box-conditional`, 모서리 8px, 안쪽 여백 12px 16px)에 둔다: 13px `--color-text-additional`, 다음 줄의 예시(`예: …`)는 `--color-disabled` 색 (`.csvColumnSelect__infoBox`). 한쪽에만 두꺼운 강조선을 넣은 박스는 새로 쓰지 않는다.

### 5.2 파일 업로드

`<label>` 안에 시각적으로 숨긴 `<input type='file'>`을 둔다 (`CsvFileUpload`). 카드는 다른 섹션과 같은 흰 카드이고, 그라데이션과 그림자는 쓰지 않는다. 첫 단계라는 강조는 단계 안내 배지로만 한다.

- 파일 없음: 1.5px 점선(`#b1b8d6`), 모서리 12px, `--color-box-default` 배경의 넓은 영역 가운데에 흰 원 아이콘(48px, 모바일 44px), 한 줄 안내(15px medium), 형식 "CSV, TSV"(13px `#667196`)를 세로로 둔다. 끌어다 놓기를 지원하는 화면(`allowDrop`)만 "끌어다 놓거나"를 안내하고, 767px 이하에서는 "눌러서 파일을 선택하세요"로 바꾼다.
- 파일 선택됨: 같은 영역이 흰 배경 + 1px 실선 테두리의 한 줄로 바뀐다. 파일 아이콘 타일, 파일명(한 줄 말줄임)과 상태 문구, 오른쪽 "파일 변경" 버튼 모양(모바일 "변경"). 줄 전체가 눌리는 영역이다.
- 오류: 점선만 빨강(`rgba(231, 0, 0, 0.45)`)으로 바꾸고, 영역 아래에 경고 아이콘 + `--color-exit` 글자로 이유를 보여준다. 배경 박스는 두지 않는다.

### 5.3 선택 입력

- 단일 선택: `EventDropdown`. 높이 40px(모바일 48px), 2px `--color-border` 테두리, 모서리 5px, 미선택은 `--color-input`, 선택되면 `#2d3b86` medium.
- 다중 선택: 토글 버튼 + 체크박스 목록 + 하단 "전체 해제 / 선택 완료" + 선택된 값 칩 (`.csvColumnSelect-display__*`). 칩은 `#e9f3ff` 배경, `#2d3b86` 글자, × 제거 버튼.
- 텍스트 입력: `EventInput`. 높이 40px(모바일 48px), 오른쪽에 연필 아이콘.

### 5.4 미리보기 표

머리에 제목·설명과 메타 배지(파일명, 행 수, 컬럼 수)를 둔다. 표는 둥근 테두리 박스 안에 넣고, 표 영역만 `overflow-x: auto`로 가로 스크롤한다. 헤더 셀은 sticky, 짝수 행은 연파랑 줄무늬, 셀은 `white-space: nowrap`. 데이터가 없을 때는 점선 박스 + 막대 세 개 아이콘 + 제목 + 설명의 빈 상태를 보여준다.

### 5.5 버튼

| 종류 | 모양 | 쓰는 곳 |
|---|---|---|
| 페이지 주요 행동 | `EventButton`: 흰 배경, `--color-main` 글자·테두리, 모서리 14px. `disabled` 지원 | 생성·편집 화면 하단 오른쪽 |
| 페이지 보조 행동 | `EventButton`과 같은 크기, `--color-border` 테두리, `--color-text-additional` 글자 | 편집 화면의 "취소" (`.csvDetail-secondaryButton`) |
| 모달 확인 | `--color-text` 배경 흰 글자, 모서리 10px, 최소 폭 84px | 이름 수정 모달 |
| 모달 취소 | `--color-border` 테두리, `--color-text-additional` 글자 | 이름 수정 모달 |
| 위험 행동 | `--color-exit` 글자 | 대시보드 더보기 메뉴의 "이벤트 삭제" |

비활성 버튼은 `opacity: 0.45~0.6`과 `cursor: default` 또는 `not-allowed`로 표시한다. 진행 중에는 버튼 문구를 "생성 중...", "수정 중..."처럼 바꾼다.

### 5.6 진행·알림

- 화면 전체 작업: 고정 오버레이 `rgba(240, 244, 255, 0.68)` + `backdrop-filter: blur(4px)` + `LoadingSpinner`(`color='#2d3b86'`, size 48) + 15px medium 문구. 이벤트 생성은 최종 확인 모달로 옮겨 지금은 이 방식을 쓰는 화면이 없다.
- 데이터 조회 대기: 내용이 들어올 자리에 `Skeleton`(`src/components/skeleton`)을 실제 요소와 같은 크기로 둔다. 감싸는 요소에 `role='status'`와 `aria-label`로 불러오는 중임을 알린다. 대시보드 카드 목록(`EventItemSkeleton`), 파일 변경 화면의 '현재 설정' 카드(`CurrentSettingsSkeleton`), 헤더 닉네임, 홈 시작 버튼이 이 방식이다. 버튼처럼 화면 폭마다 크기가 달라지는 요소는 크기 클래스를 그대로 두고 `skeleton-fill` 클래스로 칠한다.
- 확인 모달에서 시작한 작업(이벤트 생성, 이벤트 삭제, 파일 변경): 별도 오버레이 없이 모달의 확인 버튼이 스피너와 "삭제 중..." 같은 문구로 진행 상태를 보여준다.
- 결과 알림: `sonner` 토스트, 상단 가운데, 기본 2초, `richColors` (`src/App.jsx`).
- 문구 톤: 성공은 "~되었습니다!", 실패는 "~에 실패했습니다.", 요청은 "~해주세요."

### 5.7 모달

오버레이 `rgba(0, 0, 0, 0.3)` + blur 3px, 본문 최대 480px, 여백 40px, 모서리 22px. 열릴 때 0.2초 페이드·살짝 올라오는 애니메이션. ESC와 바깥 클릭으로 닫히되, 저장 중에는 닫히지 않는다. 480px 이하에서는 화면 하단에 붙는다.

되돌리기 어려운 작업은 실행 전에 공통 확인 모달 `ConfirmModal`(`src/components/confirmModal`)로 확인을 받는다. 취소 버튼에 처음 포커스를 두고 Tab 이동을 모달 안에 가두며, `variant='danger'`이면 확인 버튼이 `--color-exit` 배경이 된다. API 호출과 오류 처리는 호출 화면이 맡는다. `children`(제목과 버튼 사이 본문), `cancelText`, `className`(크기·배치 덮어쓰기)을 받는다.

이벤트 생성(FORM·FILE)은 하단 '입력 완료' 버튼으로 입력값을 검사한 뒤 최종 확인 모달 `EventCreateConfirmModal`(`src/components/eventCreateConfirmModal`)을 띄우고, 모달의 '이벤트 생성'에서 요청을 보낸다. 모달은 최대 560px, 여백 32px(모바일 20px), 모서리 16px이고 생성 정보 요약(`--color-box-default`)과 주의사항 박스를 담는다. 내용이 길면 이 본문만 스크롤하고 제목과 버튼은 계속 보인다. 실패하면 모달을 연 채 입력값을 유지해 다시 시도할 수 있다. 작성 화면의 모션 그래픽 아래 안내('확인해주세요', 항목마다 앞에 대시. 첫 화면에서 입력칸이 가려지지 않게 항목 제목만 보이고, 오른쪽 '자세히 보기'로 설명을 한꺼번에 펼친다)와 모달의 '필수 확인'은 같은 `CreateNotice`(`src/components/createNotice`, `--color-box-conditional` 배경, 모서리 16px, 여백 24px·모바일 16px)를 쓴다.

## 6. 접근성과 상호작용

- 키보드 포커스: `:focus-visible`에 `outline: 2px solid #2d3b86; outline-offset: 2px`.
- hover 효과는 `@media (hover: hover)` 안에 둔다. 터치 기기에서 hover가 남지 않게 하기 위해서다.
- 모바일 터치 대상은 최소 44px 높이를 확보한다.
- 선택 가능한 요소는 `<button>` 또는 `<label>` + `<input>`으로 만든다. `aria-expanded`, `aria-controls`, `aria-live='polite'`(파일명 같은 동적 문구)를 기존 생성 화면처럼 붙인다.

## 7. 알려진 불일치

아래는 현재 코드에 남아 있는 차이다. 새 코드에서 그대로 따라 하지 말고, 관련 작업이 아니면 고치지도 않는다.

- `reset.css`가 모든 `<button>`의 `outline`을 없앤다. 새 버튼에는 `:focus-visible` 외곽선을 직접 넣는다.
- `EventButton`은 `<div>`로 감싸져 있어, 부모가 flex 일 때 크기를 바꾸려면 `.eventButton-button`을 직접 지정해야 한다.
- `--color-main`(`#3280ff`)과 `#2d3b86`이 모두 강조색으로 쓰인다. 2.2절의 역할 구분을 따른다.
- 반응형 기준이 `screen.css` 변수와 실제 미디어 쿼리(960/767/480)로 나뉘어 있다.

## 8. 새 관리자 화면 체크리스트

1. 루트·컨테이너 구조와 960px 폭을 `CsvCreatePage.css`와 맞췄는가
2. 섹션마다 흰 카드 + 제목 + 배지 + 안내 박스 구조를 따르는가
3. 새 색을 만들지 않고 2절의 토큰 또는 반복 값을 썼는가
4. 767px 이하에서 카드 여백 20px, 입력 높이 48px, 터치 대상 44px를 확보했는가
5. 저장 중 진행 표시(확인 모달 버튼 또는 오버레이)·중복 클릭 방지를 넣었는가
6. 버튼과 선택 요소가 키보드로 조작되고 `focus-visible`이 보이는가
