# BozorCheck 2.5 Design Overview

## 목적

2.5단계는 React Native 구현 전에 BozorCheck AI의 제품 경험을 고정하는 디자인 정의 단계다. 이 문서는 3단계 구현자가 화면 구조, 정보 우선순위, 디자인 토큰, 카피 톤, mock API 표현 방식을 결정하지 않고 바로 구현할 수 있도록 만든 기준 문서다.

이번 단계는 문서 산출물만 만든다. React Native 코드, Spring backend 코드, Dify API, Telegram API, 실제 API 연동, 로그인/JWT, 카메라/위치 권한, 외부 API Key는 추가하지 않는다.

## 3단계 구현에서 사용하는 방식

- `01_DESIGN_CONCEPT.md`: 전체 시각 방향과 브랜드 인상을 확인한다.
- `02_UX_FLOW.md`: 화면 이동과 성공/실패 상태를 구현 순서 기준으로 확인한다.
- `03_DESIGN_SYSTEM.md`: `colors.ts`, `typography.ts`, `spacing.ts`와 공통 컴포넌트 스타일을 만든다.
- `04_SCREEN_SPEC.md`: 화면별 정보 우선순위와 CTA를 구현한다.
- `05_COPY_GUIDE.md`: verdict, 제보, 데이터 부족 문구를 그대로 사용한다.
- `06_WIREFRAMES.md`: 작은 Android 화면에서 배치가 잘리지 않도록 레이아웃 골격을 따른다.
- `07_FRONTEND_IMPLEMENTATION_GUIDE.md`: 폴더 구조, mock API, Zustand, i18n, 완료 조건을 체크한다.

## 전체 디자인 원칙 5개

1. 가격을 가장 먼저 보여준다: `fairMid` 또는 입력 가격을 화면에서 가장 큰 숫자로 둔다.
2. 근거를 숨기지 않는다: `fairLow`, `fairMid`, `fairHigh`, `sampleCount`, `confidenceScore`, `sourceBreakdown`을 가격 주변에 함께 배치한다.
3. 중립적으로 말한다: 상인을 비난하지 않고 “좋은 가격”, “보통 범위”, “높은 편”처럼 판단 기준을 설명한다.
4. 현장 사용을 우선한다: 한 손 조작, 큰 버튼, 큰 입력창, 짧은 문장, 빠른 검색을 기준으로 설계한다.
5. 현지 맥락을 존중한다: Uzbek/Russian/English/Korean 전환을 고려하고 흥정 문화에 맞는 행동 제안을 제공한다.

## 이번 단계에서 결정한 것

- 디자인 컨셉: `Fair Bazaar Companion / 공정한 바자르 동행자`
- 핵심 키워드: `Trust`, `Local`, `Simple`, `Friendly`, `Data-driven`
- 핵심 flow 4개: 농산물 검색, 가격 확인, 가격 제보, 언어/시장 설정
- 핵심 화면 7개: Home, Search, Product Detail, Price Check, Report Price, Settings, Dev API Status
- 핵심 데이터 표시 원칙: 가격 범위, 신뢰도, 출처, 표본 수를 항상 노출
- 제보 결과 표현: 항상 `PENDING`으로 표시하고 “검토 후 반영”이라고 안내
- verdict 문구와 금지 표현
- 3단계 구현용 토큰 기본값과 공통 컴포넌트 목록

## 이번 단계에서 결정하지 않은 것

- 실제 브랜드 로고, 앱 아이콘, 일러스트레이션
- 최종 폰트 패밀리와 현지 언어별 폰트 fallback
- 실제 운영용 데이터 부족 기준값
- 오프라인 저장 정책과 네트워크 재시도 정책
- 실제 카메라/위치/파일 업로드 UX
- Dify AI bargaining coach의 최종 문장 생성 UX
- Telegram Bot 연동 UX
- 운영 전 인증이 필요한 Admin 기능의 모바일 노출 여부

## 3단계 구현 전 체크리스트

- `backend/docs/api/API_SPEC.md`의 Public API 타입과 `src/api/apiTypes.ts` 타입이 호환되는지 확인한다.
- mock data가 실제 가격처럼 보이지 않도록 “development mock data”를 표시한다.
- `TOMATO`, `TASHKENT_CHORSU`, `quotedPrice=22000` 기준 가격 판정이 구현되어 있는지 확인한다.
- `sourceBreakdown`, `confidenceScore`, `sampleCount`가 Product Detail과 Price Check 결과에 보이는지 확인한다.
- Report Price 결과가 `PENDING`으로만 표시되는지 확인한다.
- Uzbek/Russian 긴 문구가 작은 Android 화면에서 버튼 밖으로 넘치지 않는지 확인한다.
- Dify, Telegram, 실제 backend POST, 실제 권한 요청이 들어가지 않았는지 확인한다.

## PM 확인 질문

- MVP 기본 언어는 `ko`, `en`, `uz`, `ru` 중 무엇으로 둘 것인가?
- 기본 시장은 `TASHKENT_CHORSU`로 고정해도 되는가?
- `EXPENSIVE`와 `VERY_EXPENSIVE`의 색상 강도를 지금 기준보다 더 부드럽게 해야 하는가?
- 데이터 부족 상태는 `sampleCount` 몇 개 미만 또는 `confidenceScore` 몇 미만으로 볼 것인가?
- 3단계에서 오프라인/저속 네트워크 상태는 문구만 둘 것인가, retry UI까지 둘 것인가?
