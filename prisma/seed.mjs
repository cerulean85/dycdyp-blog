import {
  AdminRole,
  AuthorType,
  CategoryLeaf,
  CategoryRoot,
  PostStatus,
  PrismaClient,
  PublishEventType,
  RevisionSourceType,
} from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = "editor@dycdyp.com";

const seedPosts = [
  {
    slug: "semiconductor-upcycle-checkpoint",
    title: "반도체 업사이클의 진짜 체크포인트는 재고보다 설비투자다",
    excerpt:
      "실적 숫자보다 먼저 봐야 할 설비투자와 고객사 주문 흐름을 중심으로 업사이클의 강도를 해석한다.",
    categoryRoot: CategoryRoot.INVESTMENT,
    categoryLeaf: CategoryLeaf.STOCK,
    tags: ["반도체", "삼성전자", "사이클"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    publishedAt: new Date("2026-04-16T09:00:00.000Z"),
    readingTimeMinutes: 6,
    markdownBody: `## 들어가며

업사이클은 늘 숫자로 확인하고 싶어지지만, 실제 전환은 설비투자와 주문의 결이 먼저 보여줍니다.

## 무엇을 먼저 봐야 하나

재고는 결과이고, 설비투자는 기대입니다. 기업이 어떤 타이밍에 CAPEX를 다시 열기 시작하는지가 사이클 강도를 더 잘 드러냅니다.

## 마지막 10%

좋은 투자 글은 숫자를 나열하는 데서 끝나지 않고, 그 숫자를 움직이게 하는 심리와 결정의 순서를 읽어냅니다.`,
  },
  {
    slug: "ai-browser-agent-shift",
    title: "브라우저 에이전트가 제품 UX를 바꾸는 방식",
    excerpt:
      "최근 AI 제품군이 채팅창을 넘어 브라우저 실행 레이어로 이동하는 이유를 제품 관점에서 정리한다.",
    categoryRoot: CategoryRoot.AI,
    categoryLeaf: CategoryLeaf.NEWS,
    tags: ["에이전트", "브라우저", "UX"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    publishedAt: new Date("2026-04-15T09:00:00.000Z"),
    readingTimeMinutes: 5,
    markdownBody: `## 들어가며

에이전트는 더 이상 답변만 잘하는 도구가 아니라, 실제 웹을 조작하는 실행 계층으로 옮겨가고 있습니다.

## 왜 중요한가

사용자는 더 적게 설명하고 더 많이 위임하게 됩니다. 그 순간 UX의 중심은 채팅 인터페이스가 아니라 신뢰 가능한 실행 제어로 이동합니다.

## 마지막 10%

미래의 좋은 인터페이스는 더 예쁜 화면이 아니라, 사용자가 기꺼이 통제권 일부를 넘길 수 있는 화면일 가능성이 큽니다.`,
  },
  {
    slug: "why-we-reread-books",
    title: "좋은 책을 다시 읽는다는 것은 같은 문장을 다른 사람이 되어 만나는 일이다",
    excerpt:
      "재독이 주는 의미를 기억의 축적이 아니라 자아의 갱신이라는 관점에서 짚어본다.",
    categoryRoot: CategoryRoot.CULTURE,
    categoryLeaf: CategoryLeaf.BOOKS,
    tags: ["독서", "재독", "기억"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    publishedAt: new Date("2026-04-13T09:00:00.000Z"),
    readingTimeMinutes: 4,
    markdownBody: `## 들어가며

책이 변하지 않았는데 다르게 읽힌다면, 바뀐 것은 독자가 살아낸 시간입니다.

## 재독의 의미

좋은 문장은 매번 같은 의미를 반복하지 않습니다. 삶의 문맥이 달라질수록 같은 문장도 다른 얼굴로 돌아옵니다.

## 마지막 10%

다시 읽는다는 것은 기억력을 시험하는 일이 아니라, 지금의 내가 예전의 나와 얼마나 달라졌는지 확인하는 일입니다.`,
  },
  {
    slug: "attention-is-a-moral-habit",
    title: "집중은 생산성 기술이 아니라 도덕적 습관일지도 모른다",
    excerpt:
      "주의를 어디에 두는지가 결국 어떤 사람이 되는지를 결정한다는 관점에서 집중을 다시 본다.",
    categoryRoot: CategoryRoot.HUMANITIES,
    categoryLeaf: CategoryLeaf.ESSAY,
    tags: ["집중", "습관", "에세이"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    publishedAt: new Date("2026-04-10T09:00:00.000Z"),
    readingTimeMinutes: 7,
    markdownBody: `## 들어가며

우리는 보통 집중을 효율의 언어로만 말하지만, 사실 집중은 무엇을 중요하게 여기는지의 문제이기도 합니다.

## 주의의 방향

하루 동안 반복해서 바라보는 대상은 결국 성향이 되고, 성향은 조금씩 인격을 만듭니다.

## 마지막 10%

집중을 관리한다는 말은 시간을 관리한다는 뜻보다, 스스로 어떤 사람이 되기로 하는지 정한다는 뜻에 더 가깝습니다.`,
  },
  {
    slug: "internal-editor-draft",
    title: "공개되면 안 되는 내부 초안",
    excerpt: "status 필터링 검증용 내부 초안",
    categoryRoot: CategoryRoot.AI,
    categoryLeaf: CategoryLeaf.RESEARCH,
    tags: ["초안"],
    status: PostStatus.DRAFT,
    authorType: AuthorType.AI_DRAFT,
    publishedAt: null,
    readingTimeMinutes: 3,
    markdownBody: `## 초안

이 글은 공개 영역에 노출되면 안 되는 내부 검증용 초안입니다.`,
  },
];

const generatedPostBlueprints = [
  {
    slug: "macro-liquidity-turn",
    title: "유동성 전환 국면에서 먼저 움직이는 자산은 무엇인가",
    excerpt: "금리보다 자금 흐름의 방향을 먼저 읽어야 하는 이유를 정리한다.",
    categoryRoot: CategoryRoot.INVESTMENT,
    categoryLeaf: CategoryLeaf.ECONOMY,
    tags: ["거시경제", "유동성", "금리"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    readingTimeMinutes: 5,
  },
  {
    slug: "small-cap-repricing-window",
    title: "중소형주 리레이팅은 숫자보다 서사 전환에서 시작된다",
    excerpt: "멀티플 재평가의 출발점을 작은 기업 사례에 맞춰 살핀다.",
    categoryRoot: CategoryRoot.INVESTMENT,
    categoryLeaf: CategoryLeaf.STOCK,
    tags: ["밸류에이션", "중소형주", "리레이팅"],
    status: PostStatus.APPROVED,
    authorType: AuthorType.HUMAN_EDITED,
    readingTimeMinutes: 6,
  },
  {
    slug: "ai-model-routing-era",
    title: "모델 라우팅 시대에는 좋은 제품이 더 이상 한 모델에 머물지 않는다",
    excerpt: "단일 모델 중심 설계에서 멀티 모델 오케스트레이션으로 넘어가는 흐름을 다룬다.",
    categoryRoot: CategoryRoot.AI,
    categoryLeaf: CategoryLeaf.TOOLS,
    tags: ["모델 라우팅", "오케스트레이션", "제품"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    readingTimeMinutes: 5,
  },
  {
    slug: "open-model-moat-question",
    title: "오픈 모델 확산은 해자 없는 경쟁일까 다른 해자의 시작일까",
    excerpt: "모델 자체보다 배포와 데이터 루프의 중요성을 다시 본다.",
    categoryRoot: CategoryRoot.AI,
    categoryLeaf: CategoryLeaf.RESEARCH,
    tags: ["오픈소스", "LLM", "해자"],
    status: PostStatus.REVIEW,
    authorType: AuthorType.AI_DRAFT,
    readingTimeMinutes: 7,
  },
  {
    slug: "cinema-after-streaming-fatigue",
    title: "스트리밍 피로 이후 영화관은 어떤 이유로 다시 선택될까",
    excerpt: "집에서 보는 영상과 극장에서 보는 영화의 감각 차이를 정리한다.",
    categoryRoot: CategoryRoot.CULTURE,
    categoryLeaf: CategoryLeaf.FILM,
    tags: ["영화", "스트리밍", "극장"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    readingTimeMinutes: 4,
  },
  {
    slug: "travel-as-editing",
    title: "좋은 여행은 이동이 아니라 시선의 편집에 가깝다",
    excerpt: "여행 기록을 많이 남기는 것보다 무엇을 놓칠지 고르는 일이 중요하다.",
    categoryRoot: CategoryRoot.CULTURE,
    categoryLeaf: CategoryLeaf.TRAVEL,
    tags: ["여행", "기록", "시선"],
    status: PostStatus.DRAFT,
    authorType: AuthorType.AI_DRAFT,
    readingTimeMinutes: 4,
  },
  {
    slug: "philosophy-of-delay",
    title: "미루기의 철학은 게으름보다 판단 유예의 문제에 가깝다",
    excerpt: "결정을 미루는 심리를 도덕이 아닌 구조로 읽어본다.",
    categoryRoot: CategoryRoot.HUMANITIES,
    categoryLeaf: CategoryLeaf.PHILOSOPHY,
    tags: ["철학", "판단", "지연"],
    status: PostStatus.PUBLISHED,
    authorType: AuthorType.HUMAN_EDITED,
    readingTimeMinutes: 6,
  },
  {
    slug: "history-of-daily-tools",
    title: "일상의 도구를 보면 한 시대가 무엇을 당연하게 여겼는지 보인다",
    excerpt: "사소한 생활 도구의 변화로 사회 감각을 읽는 작은 역사 에세이.",
    categoryRoot: CategoryRoot.HUMANITIES,
    categoryLeaf: CategoryLeaf.HISTORY,
    tags: ["역사", "도구", "생활사"],
    status: PostStatus.APPROVED,
    authorType: AuthorType.HUMAN_EDITED,
    readingTimeMinutes: 5,
  },
];

const generatedPosts = Array.from({ length: 43 }, (_, index) => {
  const blueprint = generatedPostBlueprints[index % generatedPostBlueprints.length];
  const number = index + 1;
  const dayOffset = number + 2;
  const publishedAt = new Date(Date.UTC(2026, 3, Math.max(1, 30 - dayOffset), 9, 0, 0));
  const status = blueprint.status;
  const isPublished = status === PostStatus.PUBLISHED;
  const variant = number % 4;

  const variantSection =
    variant === 0
      ? `## 빠른 체크리스트

- 샘플 번호: ${number}
- 카테고리: ${String(blueprint.categoryRoot).toLowerCase()} / ${String(blueprint.categoryLeaf).toLowerCase()}
- 상태: ${String(status).toLowerCase()}

### 간단 메모

운영 리허설에서 필터, 정렬, 관련 글 추천이 자연스럽게 보이는지 확인합니다.`
      : variant === 1
        ? `## 비교 표

| 항목 | 값 |
| --- | --- |
| 샘플 번호 | ${number} |
| 읽기 시간 | ${blueprint.readingTimeMinutes + (number % 3)}분 |
| 상태 | ${String(status).toLowerCase()} |

### 한 줄 결론

표가 카드처럼 보이는지, 모바일에서 가로 스크롤이 과하지 않은지 점검합니다.`
        : variant === 2
          ? `## 코드 예시

\`\`\`ts
const samplePost = {
  id: ${number},
  category: "${String(blueprint.categoryRoot).toLowerCase()}",
  slug: "${blueprint.slug}-${String(number).padStart(2, "0")}",
};
\`\`\`

### 확인 포인트

코드블록 상단 언어 라벨과 복사 버튼이 잘 보이는지 확인합니다.`
          : `## 인용과 단락

> 좋은 시드 데이터는 기능만 검증하는 것이 아니라 화면의 리듬도 같이 검증합니다.

### 마지막 메모

인용문과 일반 단락이 서로 충분히 구분되는지 확인합니다.`;

  return {
    slug: `${blueprint.slug}-${String(number).padStart(2, "0")}`,
    title: `${blueprint.title} ${number}`,
    excerpt: blueprint.excerpt,
    categoryRoot: blueprint.categoryRoot,
    categoryLeaf: blueprint.categoryLeaf,
    tags: [...blueprint.tags, `seed-${number}`],
    status,
    authorType: blueprint.authorType,
    publishedAt: isPublished ? publishedAt : null,
    readingTimeMinutes: blueprint.readingTimeMinutes + (number % 3),
    markdownBody: `## 들어가며

${blueprint.excerpt}

## 핵심 포인트

- 샘플 번호: ${number}
- 카테고리: ${String(blueprint.categoryRoot).toLowerCase()} / ${String(blueprint.categoryLeaf).toLowerCase()}
- 상태: ${String(status).toLowerCase()}

${variantSection}

## 마지막 메모

이 문서는 관리자 목록, 상태 전환, 페이지네이션을 확인하기 위한 시드 데이터입니다.`,
  };
});

const allSeedPosts = [...seedPosts, ...generatedPosts];

async function main() {
  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      displayName: "DYCDYP Editor",
      role: AdminRole.ADMIN,
    },
    create: {
      email: adminEmail,
      displayName: "DYCDYP Editor",
      role: AdminRole.ADMIN,
    },
  });

  for (const post of allSeedPosts) {
    await prisma.post.deleteMany({
      where: {
        slug: post.slug,
      },
    });

    const createdPost = await prisma.post.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        categoryRoot: post.categoryRoot,
        categoryLeaf: post.categoryLeaf,
        status: post.status,
        authorType: post.authorType,
        readingTimeMinutes: post.readingTimeMinutes,
        createdById: admin.id,
        updatedById: admin.id,
        approvedById: post.status === PostStatus.PUBLISHED ? admin.id : null,
        approvedAt: post.status === PostStatus.PUBLISHED ? post.publishedAt : null,
        publishedAt: post.publishedAt,
      },
    });

    const revision = await prisma.postRevision.create({
      data: {
        postId: createdPost.id,
        title: post.title,
        excerpt: post.excerpt,
        markdownBody: post.markdownBody,
        sourceType:
          post.status === PostStatus.PUBLISHED
            ? RevisionSourceType.PUBLISH_SNAPSHOT
            : RevisionSourceType.AI_DRAFT,
        sourceModel: post.authorType === AuthorType.AI_DRAFT ? "internal-seed" : "human-seed",
        editorId: admin.id,
      },
    });

    await prisma.post.update({
      where: {
        id: createdPost.id,
      },
      data: {
        currentRevisionId: revision.id,
        publishedRevisionId:
          post.status === PostStatus.PUBLISHED ? revision.id : null,
      },
    });

    for (const tagName of post.tags) {
      const tag = await prisma.tag.upsert({
        where: {
          name: tagName,
        },
        update: {
          slug: tagName,
        },
        create: {
          name: tagName,
          slug: tagName,
        },
      });

      await prisma.postTag.create({
        data: {
          postId: createdPost.id,
          tagId: tag.id,
        },
      });
    }

    await prisma.publishEvent.create({
      data: {
        postId: createdPost.id,
        revisionId: revision.id,
        actorId: admin.id,
        eventType:
          post.status === PostStatus.PUBLISHED
            ? PublishEventType.PUBLISHED
            : PublishEventType.CREATED,
        payload: {
          source: "seed",
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
