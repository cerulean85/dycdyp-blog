# 하네스 엔지니어링 명령

- 아래의 명령을 넣어 하네스 엔지니어링을 Codex가 실행하도록 할 것

docs/ 폴더에 있는 모든 기존 설계 문서를 철저히 분석한 뒤, 
프로젝트 루트에 AGENTS.md를 생성(또는 업데이트)해줘.

AGENTS.md는 다음과 같은 역할을 해야 해:
1. 에이전트가 프로젝트를 처음 열었을 때 가장 먼저 읽는 '지도(테이블 오브 컨텐츠)' 역할
2. docs/를 'System of Record(기록 시스템)'로 삼아 모든 중요한 정보는 docs/에 있다고 명시
3. Progressive Disclosure 원칙으로 AGENTS.md 자체는 80~150줄 정도로 짧게 유지
4. docs/의 핵심 내용(설계 원칙, 아키텍처, 제품 요구사항, 실행 계획 등)을 카테고리별로 요약하고 링크 걸기
5. 하네스 엔지니어링 규칙(에이전트가 어떻게 일해야 하는지, doc-gardening, quality score 등)도 포함

그 후, AGENTS.md에 정의된 구조에 맞춰 부족한 docs/ 하위 폴더나 파일이 있으면 자동으로 스캐폴딩해줘.


# 개발 시작 명령

AGENTS.md와 docs/ 전체를 System of Record로 삼고, 
현재 active한 실행 계획(docs/exec-plans/active/)을 따라 개발을 시작해줘.

1. 가장 우선순위가 높은 태스크(또는 가장 먼저 구현해야 할 기능)부터 순서대로 진행
2. DESIGN.md, product-specs/, ARCHITECTURE.md를 철저히 준수하면서 코드 작성
3. 각 작업 완료 후 QUALITY_SCORE.md 기준으로 self-review하고, 필요하면 doc-gardening도 수행
4. 작업 단위는 작게(한 번에 하나의 atomic task) 유지하고, 완료 시 "✅ Task 완료"라고 명확히 표시

지금 바로 첫 번째 태스크부터 시작해.