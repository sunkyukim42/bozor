# UX Flow

## Flow A: 농산물 검색

### 사용자 상황

사용자는 바자르에서 토마토, 감자, 사과 등 특정 농산물 가격을 보기 전에 현재 시세를 빠르게 확인하고 싶다.

### 사용자의 목표

품목을 검색하고 Product Detail에서 오늘의 적정가 범위와 가격 흐름을 확인한다.

### 화면 이동 순서

`Home -> Search -> Product Detail`

### 각 단계의 주요 UI

- Home: 검색 진입 CTA, 오늘의 주요 품목 5개, 현재 선택 시장
- Search: 검색 입력, 최근 검색어, ProductCard 목록
- Product Detail: 큰 `fairMid`, `fairLow/fairMid/fairHigh`, PriceRangeBar, 7~30일 가격 흐름, `confidenceScore`, `sampleCount`, `sourceBreakdown`

### 실패/빈 상태

- 검색 결과 없음: “검색 결과가 없습니다. 다른 이름이나 현지명으로 검색해 보세요.”
- 데이터 부족: “아직 이 시장의 데이터가 충분하지 않습니다. 참고용으로 확인해 주세요.”
- 네트워크 실패: mock 단계에서는 ErrorState만 제공하고 실제 retry 정책은 4단계에서 정의한다.

### 성공 기준

- 사용자가 2~3번의 터치 안에 Product Detail까지 도달한다.
- `query=pomidor` 입력 시 `TOMATO`가 검색된다.
- Product Detail에서 가격, 신뢰도, 출처, 표본 수를 한 화면 흐름 안에서 확인할 수 있다.

## Flow B: 상인이 부른 가격 확인

### 사용자 상황

상인이 특정 농산물 가격을 말했고, 사용자는 그 가격이 현재 시세 범위와 비교해 어떤 수준인지 알고 싶다.

### 사용자의 목표

품목, 시장, 가격을 입력하고 `CHEAP/FAIR/EXPENSIVE/VERY_EXPENSIVE` 판정을 받는다.

### 화면 이동 순서

`Home -> Price Check -> Result`

또는

`Product Detail -> Price Check -> Result`

### 각 단계의 주요 UI

- 진입 CTA: “가격 확인하기” 또는 “이 가격 괜찮나요?”
- Price Check: Product selector, Market selector, quotedPrice input, unitCode 기본 `KG`
- Result: 입력 가격을 가장 크게 표시, VerdictBadge, `fairLow/fairMid/fairHigh`, 추천 기준가 `fairMid`, 초과율, `confidenceScore`, `sourceBreakdown`

### 실패/빈 상태

- 가격 미입력 또는 0 이하: “0보다 큰 가격을 입력해 주세요.”
- 품목 미선택: “품목을 선택해 주세요.”
- summary 없음: “아직 이 시장의 데이터가 충분하지 않습니다. 참고용으로 확인해 주세요.”

### 성공 기준

- 사용자가 가격 입력 후 즉시 판정을 이해한다.
- 결과 문구가 상인을 공격하지 않고 다음 행동을 제안한다.
- `quotedPrice=22000`, `TOMATO`, `TASHKENT_CHORSU` mock 기준에서 verdict가 표시된다.

## Flow C: 현장 가격 제보

### 사용자 상황

사용자가 현장에서 실제로 본 가격을 서비스에 제보해 시세 품질 개선에 기여하고 싶다.

### 사용자의 목표

품목, 시장, 가격, 단위를 입력하고 제보가 접수되었음을 확인한다.

### 화면 이동 순서

`Home -> Report Price -> PENDING Result`

또는

`Product Detail -> Report Price -> PENDING Result`

### 각 단계의 주요 UI

- Report Price: Product selector 또는 rawProductName 입력, Market selector, submittedPrice input, submittedUnit 기본 `KG`
- Placeholder: “사진 첨부 예정” disabled button, 위치 입력은 숨김 또는 optional placeholder
- Result: ReportStatusCard, `PENDING`, submittedPrice, “제보가 접수되었습니다. 검토 후 시세에 반영됩니다.”

### 실패/빈 상태

- 가격 미입력: “가격을 입력해 주세요.”
- 품목과 rawProductName 둘 다 없음: “품목을 선택하거나 이름을 입력해 주세요.”
- 시장 미선택: “시장 또는 판매처를 선택해 주세요.”

### 성공 기준

- 제출 후 사용자가 제보가 즉시 시세에 반영되지 않는다는 점을 이해한다.
- `price_observations`가 바로 생성되는 것처럼 보이지 않는다.
- 결과 상태는 반드시 `PENDING`이다.

## Flow D: 언어/시장 설정

### 사용자 상황

사용자는 앱 언어 또는 기본 시장을 바꾸고 이후 모든 화면에서 같은 기준으로 보고 싶다.

### 사용자의 목표

Settings에서 언어와 기본 시장을 바꾸고 Home 및 가격 화면에 반영한다.

### 화면 이동 순서

`Settings -> Change Language / Change Market -> Home`

### 각 단계의 주요 UI

- Settings: language segmented control (`ko`, `en`, `uz`, `ru`)
- Settings: MarketSelector
- Settings: Mock API 상태, API Base URL, Dev API Status 이동
- Home: 선택한 시장명이 현재 시장 카드에 반영

### 실패/빈 상태

- 시장 목록 없음: “시장을 불러오지 못했습니다.”
- 언어 키 누락: 영어 fallback 사용
- 저장 실패: 3단계에서는 AsyncStorage persist 실패를 ErrorState로 단순 표시

### 성공 기준

- 언어와 기본 시장이 앱 재실행 후 유지된다.
- 긴 Uzbek/Russian 문구도 버튼과 카드 영역을 깨지 않는다.
