# Screen Spec

## Home

### 화면 목적

사용자가 앱을 열자마자 현재 시장 기준 주요 품목 가격과 빠른 행동을 확인한다.

### 가장 중요한 정보

현재 선택 시장, 오늘의 주요 가격 카드, Price Check CTA, Report Price CTA.

### 정보 우선순위

1. Header: `BozorCheck AI`
2. 현재 시장 카드
3. 오늘의 주요 품목 5개와 `fairMid`
4. Price Check / Report Price CTA
5. 신뢰도 높은 품목과 데이터 부족 품목
6. 최근 검색어
7. Mock API 개발용 badge

### 주요 컴포넌트

MarketSelector compact card, PriceSummaryCard compact variant, ConfidenceBadge, AppButton, RecentSearchList.

### CTA

- “가격 확인하기”
- “가격 제보하기”

### 빈 상태

주요 품목 데이터가 없으면 “아직 표시할 가격 데이터가 없습니다. 검색으로 품목을 확인해 주세요.”

### 에러 상태

“가격 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.”

### 로딩 상태

Header는 먼저 보이고 가격 카드 영역에 LoadingState를 표시한다.

### 다국어 고려사항

CTA는 버튼 폭이 좁을 수 있으므로 줄바꿈을 허용한다. Uzbek/Russian 문구는 2줄까지 허용한다.

### 3단계 구현 시 주의사항

Mock API badge와 “development mock data” 표시를 Home에서 숨기지 않는다.

## Search

### 화면 목적

사용자가 농산물을 code, 현지명, 영어명, alias로 찾는다.

### 가장 중요한 정보

검색창과 검색 결과 ProductCard.

### 정보 우선순위

1. 검색 입력
2. 최근 검색어 chip
3. ProductCard 목록
4. 결과 없음 안내

### 주요 컴포넌트

ProductSearchInput, ProductCard, EmptyState, RecentSearchChip.

### CTA

ProductCard tap -> Product Detail.

### 빈 상태

“검색 결과가 없습니다. 다른 이름이나 현지명으로 검색해 보세요.”

### 에러 상태

“품목 목록을 불러오지 못했습니다.”

### 로딩 상태

검색창 아래 LoadingState.

### 다국어 고려사항

검색 대상은 `code`, `nameKo`, `nameEn`, `nameUz`, `nameRu`, `aliases`를 포함한다. `pomidor` 입력 시 `TOMATO`가 나와야 한다.

### 3단계 구현 시 주의사항

검색어는 최근 검색어에 저장하되 개인정보처럼 취급하지 않는다. 서버 전송은 mock 단계에서 하지 않는다.

## Product Detail

### 화면 목적

선택한 품목의 최신 적정 가격, 가격 흐름, 데이터 신뢰도를 보여준다.

### 가장 중요한 정보

`fairMid`, `fairLow/fairMid/fairHigh`, `confidenceScore`, `sourceBreakdown`, `sampleCount`.

### 정보 우선순위

1. 품목명과 현지명
2. 현재 시장명
3. 큰 `fairMid`
4. PriceRangeBar
5. 7~30일 가격 history chart
6. ConfidenceBadge
7. `sampleCount`
8. SourceBreakdown
9. Price Check / Report CTA

### 주요 컴포넌트

ProductPriceSummaryCard, PriceRangeBar, PriceHistoryChart, ConfidenceBadge, SourceBreakdown, AppButton.

### CTA

- “이 가격 괜찮나요?” -> Price Check
- “가격 제보하기” -> Report Price

### 빈 상태

“아직 이 시장의 데이터가 충분하지 않습니다. 참고용으로 확인해 주세요.”

### 에러 상태

“가격 요약을 불러오지 못했습니다.”

### 로딩 상태

상단 품목명 skeleton 또는 LoadingState, 이후 가격 카드 로딩.

### 다국어 고려사항

품목명은 현재 locale 이름을 우선하되, 현지명 `nameUz` 또는 `nameRu`를 보조로 보여준다.

### 3단계 구현 시 주의사항

가격 chart만 보여주고 출처/신뢰도를 접어두지 않는다. MVP에서는 chart library를 무겁게 추가하지 않는다.

## Price Check

### 화면 목적

상인이 부른 가격이 현재 시세 기준 어느 범위인지 판단한다.

### 가장 중요한 정보

입력 가격, verdict, 기준 가격 범위.

### 정보 우선순위

1. Product selector
2. Market selector
3. quotedPrice input
4. Check CTA
5. Result card: 입력 가격
6. VerdictBadge
7. `fairLow/fairMid/fairHigh`
8. recommendedTargetPrice = `fairMid`
9. overFairHighPercent
10. `confidenceScore`, `sampleCount`, `sourceBreakdown`

### 주요 컴포넌트

PriceCheckForm, PriceCheckResultCard, VerdictBadge, PriceRangeBar, ConfidenceBadge, SourceBreakdown.

### CTA

“가격 확인하기”

### 빈 상태

결과 전에는 “가격을 입력하면 현재 시세 범위와 비교해 드립니다.”

### 에러 상태

입력 오류는 form 아래에 짧게 표시한다. summary 없음은 데이터 부족 문구를 사용한다.

### 로딩 상태

CTA에 loading spinner를 표시하고 결과 영역은 유지한다.

### 다국어 고려사항

verdict label은 짧은 단어를 사용하고, 설명 문구는 2줄까지 허용한다.

### 3단계 구현 시 주의사항

Dify 문장 생성은 구현하지 않는다. 하단에 “AI bargaining coach coming later” 개발용 placeholder만 허용한다.

## Report Price

### 화면 목적

사용자가 현장에서 본 가격을 제보하고 검토 대기 상태를 확인한다.

### 가장 중요한 정보

submittedPrice, 품목, 시장, `PENDING` 상태.

### 정보 우선순위

1. Product selector 또는 rawProductName input
2. Market selector
3. submittedPrice input
4. submittedUnit 기본 `KG`
5. 사진/위치 placeholder
6. Submit CTA
7. ReportStatusCard with `PENDING`
8. “검토 후 시세에 반영” 문구

### 주요 컴포넌트

ReportPriceForm, ReportStatusCard, AppInput, AppButton, EmptyState.

### CTA

“제보 제출하기”

### 빈 상태

입력 전에는 “제보는 검토 후 시세에 반영됩니다.”

### 에러 상태

품목/시장/가격 필수값 누락을 field-level message로 표시한다.

### 로딩 상태

Submit CTA에 loading 표시.

### 다국어 고려사항

PENDING은 상태 badge로 유지하고, 설명 문구만 번역한다.

### 3단계 구현 시 주의사항

실제 카메라, 위치 권한, 파일 업로드, backend POST를 구현하지 않는다. `price_observations`가 바로 생성되는 것처럼 표현하지 않는다.

## Settings

### 화면 목적

언어, 기본 시장, mock API 상태를 확인하고 변경한다.

### 가장 중요한 정보

언어 선택, 기본 시장 선택.

### 정보 우선순위

1. Language selector: `ko`, `en`, `uz`, `ru`
2. Default Market selector
3. Mock API status
4. API Base URL
5. 최근 검색어 초기화
6. Dev API Status 이동

### 주요 컴포넌트

SegmentedControl, MarketSelector, SettingsRow, AppButton.

### CTA

- “최근 검색어 초기화”
- “API Status 보기”

### 빈 상태

시장 목록이 없으면 “선택 가능한 시장이 없습니다.”

### 에러 상태

“설정을 불러오지 못했습니다.”

### 로딩 상태

시장 selector 영역에 LoadingState.

### 다국어 고려사항

언어명은 자체 표기와 code를 함께 보여준다. 예: `Uzbek (uz)`.

### 3단계 구현 시 주의사항

`locale`, `selectedMarketCode`, `recentSearches`는 AsyncStorage persist 대상이다.

## Dev API Status

### 화면 목적

개발자가 현재 API mode와 integration 미구현 상태를 확인한다.

### 가장 중요한 정보

API mode mock/real, API Base URL, mock product count, mock market count.

### 정보 우선순위

1. API mode
2. API Base URL
3. Mock products count
4. Mock markets count
5. “4단계에서 실제 Spring API 연결 예정”
6. Dify: not connected
7. Telegram: not connected

### 주요 컴포넌트

StatusRow, AppCard, Badge.

### CTA

필수 CTA 없음. Settings로 돌아가는 기본 navigation만 사용한다.

### 빈 상태

Mock data count가 0이면 경고 문구 표시.

### 에러 상태

이 화면은 local config만 읽으므로 runtime error 외 별도 에러 상태는 두지 않는다.

### 로딩 상태

없음.

### 다국어 고려사항

개발자 화면이므로 핵심 상태값은 영어 원문으로 유지한다.

### 3단계 구현 시 주의사항

실제 backend health check를 호출하지 않는다.
