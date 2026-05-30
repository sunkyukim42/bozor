# Design System

## Color Tokens

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Primary | `primary` | `#147A62` | 주요 CTA, 선택 상태, active tab |
| Background | `background` | `#F7F4ED` | 앱 전체 배경 |
| Surface | `surface` | `#FFFFFF` | 카드, 입력창, bottom tab |
| Text primary | `textPrimary` | `#1F2A24` | 제목, 가격, 주요 본문 |
| Text secondary | `textSecondary` | `#66726A` | 보조 설명, 날짜, 출처명 |
| Border | `border` | `#DED7CA` | 카드/입력 구분선 |
| Cheap | `cheap` | `#25855A` | `CHEAP`, 좋은 가격 |
| Fair | `fair` | `#2F6B9A` | `FAIR`, 보통 범위 |
| Expensive | `expensive` | `#B7791F` | `EXPENSIVE`, 높은 편 |
| Very expensive | `veryExpensive` | `#B42318` | `VERY_EXPENSIVE`, 상당히 높은 편 |
| Confidence high | `confidenceHigh` | `#25855A` | 높은 신뢰도 |
| Confidence medium | `confidenceMedium` | `#B7791F` | 중간 신뢰도 |
| Confidence low | `confidenceLow` | `#B42318` | 낮은 신뢰도 |

Soft background variants should use 10-16% tint of each semantic color.

## Typography

| Token | Size | Weight | Usage |
| --- | ---: | --- | --- |
| `title` | 28-30 | 800 | 화면 제목 |
| `sectionTitle` | 20-22 | 700 | 섹션 제목 |
| `body` | 16 | 400-500 | 기본 문장 |
| `small` | 13-14 | 500 | 보조 정보, badge |
| `price` | 32-36 | 800 | 가격 숫자 |

가격은 숫자 읽기가 가장 중요하므로 line-height를 넉넉하게 두고, 같은 카드 안의 부가 정보보다 최소 1.5배 크게 둔다.

## Spacing

- `xs`: 4
- `sm`: 8
- `md`: 12
- `lg`: 16
- `xl`: 24
- `xxl`: 32

화면 기본 padding은 `lg`, 카드 내부 padding은 `lg`, 섹션 간격은 `xl`을 기본으로 한다.

## Radius

- Card: 8
- Button: 8
- Input: 8
- Bottom sheet or modal: 12
- Badge: pill radius 999

## Shadow

- Android: `elevation: 1-2`
- iOS: low opacity shadow only
- 가격 카드에는 강한 그림자를 쓰지 않는다. 신뢰감은 장식보다 정보 명확성으로 만든다.

## Border

- 기본 border color는 `border`
- 카드와 입력창은 1px border
- 선택 상태는 `primary` border와 soft background를 함께 사용

## Icon Usage

- 버튼과 탭에는 lucide 계열 아이콘을 사용한다.
- 아이콘은 의미를 보조하고 텍스트를 대체하지 않는다.
- 주요 추천 아이콘:
  - Home: `Home`
  - Search: `Search`
  - Price Check: `Calculator`
  - Report: `Send`
  - Settings: `Settings`
  - API Status: `Database`

## Card Style

- 카드 배경은 `surface`
- radius 8, border 1
- 카드 안에 또 다른 카드 넣지 않기
- 반복 목록의 ProductCard, PriceSummaryCard, ReportStatusCard에만 카드 스타일 사용

## Button Style

- 최소 높이 52
- primary button은 `primary` background와 흰색 label
- secondary button은 `primary` border와 soft background
- destructive button은 MVP에서 가급적 사용하지 않는다
- 작은 Android 화면에서 2개 버튼을 가로로 억지 배치하지 않고 세로 stack을 기본으로 한다

## Input Style

- 최소 높이 52
- 숫자 입력은 큰 font size 18 이상
- 가격 입력은 `numeric` keyboard
- 단위 `KG`는 작은 pill 또는 suffix로 표시
- validation 문구는 짧고 영문 fallback 가능해야 한다

## Badge Style

- VerdictBadge는 semantic color를 사용한다.
- ConfidenceBadge는 `confidenceScore` 구간으로 색을 나눈다.
- Badge 안 텍스트는 13-14px bold.

## 핵심 컴포넌트 원칙

### PriceSummaryCard

- `fairMid`를 가장 크게 표시한다.
- `fairLow/fairMid/fairHigh`, `sampleCount`, `confidenceScore`, `sourceBreakdown`을 같은 카드 흐름 안에 둔다.

### PriceRangeBar

- 좌측은 낮은 가격, 중앙은 `fairMid`, 우측은 높은 가격.
- 사용자가 입력한 가격이 있으면 marker로 표시한다.

### ConfidenceBadge

- 높음: `confidenceScore >= 0.75`
- 중간: `0.5 <= confidenceScore < 0.75`
- 낮음: `confidenceScore < 0.5`
- 숫자를 숨기지 않고 “82% confidence”처럼 보여준다.

### VerdictBadge

- `CHEAP`: 좋은 가격
- `FAIR`: 보통 범위
- `EXPENSIVE`: 높은 편
- `VERY_EXPENSIVE`: 상당히 높은 편

### SourceBreakdown

- `sourceBreakdown` key와 count를 row 형태로 표시한다.
- 예: `FIELD_SURVEY 12`, `USER_REPORT 8`, `STAT_UZ 1`

### ProductCard

- 이름은 `nameEn` 또는 현재 locale 이름을 1순위로 표시한다.
- `nameUz`, `nameRu`, code를 보조 정보로 둔다.

### MarketSelector

- 기본 선택 시장을 명확히 보여준다.
- 시장과 온라인몰을 같은 selector에서 고를 수 있게 한다.

### ReportStatusCard

- 상태 `PENDING`을 크게 표시한다.
- “검토 후 반영” 문구를 반드시 포함한다.

### LoadingState

- skeleton보다 간단한 spinner와 짧은 문구를 우선한다.

### EmptyState

- 사용자가 다음에 할 수 있는 행동을 알려준다.

### ErrorState

- stack trace나 technical detail을 보여주지 않는다.
- retry UI는 4단계 네트워크 정책 확정 후 추가한다.
