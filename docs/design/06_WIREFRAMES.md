# Wireframes

텍스트 기반 와이어프레임이다. 실제 구현에서는 작은 Android 화면 기준으로 세로 스크롤을 기본으로 한다.

## Home

```text
[SafeArea]
  [Header]
    BozorCheck AI
    [Badge: Mock API]

  [Market Compact Card]
    Current market
    Tashkent Chorsu

  [Today Price Cards]
    [PriceSummaryCard Compact]
      Tomato
      16,500 UZS              <- fairMid 크게
      [ConfidenceBadge 82%]
      sampleCount: 22

    [PriceSummaryCard Compact]
      Cucumber
      10,000 UZS
      [ConfidenceBadge 78%]
      sampleCount: 18

  [Primary CTA] 가격 확인하기
  [Secondary CTA] 가격 제보하기

  [Higher Confidence]
    Tomato, Apple

  [Needs More Data]
    Melon, Bell pepper

  [Recent Searches]
    pomidor, potato

  [Footer Note]
    development mock data only
```

가격 위치: Today Price Cards 중앙.  
신뢰도 위치: 각 가격 카드 우측 또는 가격 아래.  
출처 위치: Home compact 카드에서는 숨길 수 있으나 Product Detail에서는 필수 표시.  
sample count 위치: 각 compact 카드 하단.

## Search

```text
[SafeArea]
  [Title] Search

  [Search Input]
    Search tomato, pomidor, potato...

  [Recent Search Chips]
    pomidor  potato  olma

  [ProductCard]
    Tomato
    Pomidor · Pomidor
    TOMATO
    >

  [ProductCard]
    Potato
    Kartoshka · Kartofel
    POTATO
    >

  [EmptyState if no result]
    검색 결과가 없습니다.
```

가격 위치: 없음.  
신뢰도/출처/sample count 위치: 없음. 검색은 진입 화면이므로 Product Detail에서 표시.

## Product Detail

```text
[SafeArea]
  [Header]
    Tomato
    Pomidor · Pomidor

  [ProductPriceSummaryCard]
    Chorsu Bazaar
    16,500 UZS                 <- fairMid 가장 크게
    [ConfidenceBadge 82%]

    [PriceRangeBar]
      fairLow 14,000 | fairMid 16,500 | fairHigh 18,500

    sampleCount: 22
    summaryDate: 2026-05-30

    [SourceBreakdown]
      FIELD_SURVEY   12
      USER_REPORT     8
      STAT_UZ         1
      KORZINKA        1

  [PriceHistoryChart]
    14 day fairMid line

  [Primary CTA] 이 가격 괜찮나요?
  [Secondary CTA] 가격 제보하기
```

가격 위치: 첫 카드 최상단.  
신뢰도 위치: 가격 우측.  
출처 위치: 같은 카드 하단.  
sample count 위치: PriceRangeBar 아래.

## Price Check

```text
[SafeArea]
  [Title] 가격 확인하기

  [Product Selector]
    Tomato | Cucumber | Potato | ...

  [Market Selector]
    Chorsu | Alay | Korzinka | ...

  [Price Input]
    Quoted price
    [ 22000 ] [KG]

  [Primary CTA]
    확인하기

  [Result Card]
    Quoted price
    22,000 UZS                 <- 입력 가격 가장 크게
    [VerdictBadge: 높은 편]

    조금 높은 편입니다.
    중앙값 근처로 흥정해 보세요.

    Target fairMid: 16,500 UZS
    Over fairHigh: 18.92%

    [PriceRangeBar with marker]
      fairLow 14,000 | fairMid 16,500 | fairHigh 18,500

    [ConfidenceBadge 82%]
    sampleCount: 22

    [SourceBreakdown]
      FIELD_SURVEY 12
      USER_REPORT   8
      STAT_UZ       1

  [Placeholder]
    AI bargaining coach coming later
```

가격 위치: Result Card 상단.  
신뢰도 위치: Result Card 하단 전.  
출처 위치: Result Card 하단.  
sample count 위치: 신뢰도 근처.

## Report Price

```text
[SafeArea]
  [Title] 가격 제보하기

  [Product Selector]
    Tomato | Cucumber | 직접 입력

  [Optional Input]
    Product name if not listed
    [ local name ]

  [Market Selector]
    Chorsu | Alay | Korzinka | ...

  [Price Input]
    Submitted price
    [ 16000 ] [KG]

  [Disabled Button]
    사진 첨부 예정

  [Optional Placeholder]
    위치 입력은 다음 단계에서 지원 예정

  [Primary CTA]
    제보 제출하기

  [ReportStatusCard]
    [Badge: PENDING]
    16,000 UZS
    제보가 접수되었습니다.
    검토 후 시세에 반영됩니다.
```

가격 위치: input과 ReportStatusCard.  
신뢰도/출처/sample count 위치: 제보는 검토 전 데이터이므로 표시하지 않는다.  
상태 위치: 결과 카드 최상단 `PENDING`.

## Settings

```text
[SafeArea]
  [Title] Settings

  [Language Card]
    ko | en | uz | ru

  [Default Market Card]
    Chorsu Bazaar
    Alay Bazaar
    Korzinka online
    Makro online
    Uzbekistan national average

  [API Card]
    Mock API: true
    API Base URL: http://localhost:8080

  [Secondary CTA]
    최근 검색어 초기화

  [Primary CTA]
    API Status 보기
```

가격/신뢰도/출처/sample count 위치: 없음. 설정 화면에서는 상태 정보만 표시.

## Dev API Status

```text
[SafeArea]
  [Title] API Status

  [Status Card]
    API mode        mock
    API Base URL    http://localhost:8080
    Mock products   10
    Mock markets    5

  [Phase Card]
    4단계에서 실제 Spring API 연결 예정

  [External Services Card]
    Dify: not connected
    Telegram: not connected
```

가격/신뢰도/출처/sample count 위치: 없음. 개발용 연결 상태만 표시.
