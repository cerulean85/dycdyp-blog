import type { Metadata } from "next";

import { SectionTitle } from "@/components/section-title";

export const metadata: Metadata = {
  title: "DYCDYP",
  description:
    "DYCDYP 서비스 이용과 관련된 기본 조건, 책임 범위, 금지 행위를 안내합니다.",
  alternates: {
    canonical: "/terms",
  },
};

const termsSections = [
  {
    title: "서비스의 성격",
    body: [
      "DYCDYP는 투자, AI, 문화, 인문 분야의 글을 큐레이션하고 편집해 제공하는 콘텐츠 서비스입니다.",
      "서비스에 게시되는 콘텐츠는 정보 제공과 탐색 보조를 위한 것이며, 전문 자문이나 법적 효력을 갖는 고지로 해석되지 않습니다.",
    ],
  },
  {
    title: "이용자의 책임",
    body: [
      "이용자는 본 서비스에서 얻은 정보를 자신의 판단과 책임 아래 활용해야 합니다.",
      "특히 투자, 재무, 기술 도입과 관련된 의사결정은 개별 상황에 따라 달라질 수 있으므로, 필요할 경우 별도의 전문가 검토를 거쳐야 합니다.",
    ],
  },
  {
    title: "금지 행위",
    body: [
      "서비스 운영을 방해하거나, 자동화된 비정상 접근, 스팸성 활동, 타인에 대한 공격적 행위, 외부 시스템 악용을 시도하는 행위는 금지됩니다.",
      "댓글이나 외부 연동 기능을 사용할 때에도 타인의 권리를 침해하거나 불쾌감을 유발하는 표현은 제한될 수 있습니다.",
    ],
  },
  {
    title: "외부 서비스 연동",
    body: [
      "DYCDYP는 뉴스레터, 댓글, 이미지 저장 등 일부 기능에서 외부 서비스를 함께 사용할 수 있습니다.",
      "이 경우 해당 기능 이용에는 연동된 외부 서비스의 정책과 기술적 제약이 함께 적용될 수 있습니다.",
    ],
  },
  {
    title: "면책과 책임 제한",
    body: [
      "서비스 제공자는 게시된 콘텐츠의 정확성, 완전성, 최신성을 유지하기 위해 노력하지만, 모든 정보가 항상 완전하거나 오류가 없음을 보장하지는 않습니다.",
      "이용자가 서비스 정보를 활용하는 과정에서 발생한 손실이나 불이익에 대해, 관련 법령상 요구되는 범위를 제외하고 서비스 제공자는 책임을 지지 않습니다.",
    ],
  },
  {
    title: "약관 변경",
    body: [
      "서비스 구조와 운영 정책이 바뀌면 본 약관도 함께 수정될 수 있습니다.",
      "중요한 변경이 있는 경우 사이트 내 공지 또는 관련 페이지 갱신을 통해 반영합니다.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <SectionTitle
        eyebrow="Terms"
        title="DYCDYP 이용약관"
        description="이 페이지는 서비스 이용에 적용되는 기본 조건과 책임 범위를 간단하고 명확하게 안내하기 위한 공개 약관입니다."
      />

      <div className="mt-10 space-y-4">
        {termsSections.map((section) => (
          <section
            key={section.title}
            className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)]"
          >
            <h2 className="font-serif text-2xl text-stone-950">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-stone-700">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
