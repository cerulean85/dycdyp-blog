import type { Metadata } from "next";

import { SectionTitle } from "@/components/section-title";

export const metadata: Metadata = {
  title: "DYCDYP",
  description:
    "DYCDYP의 콘텐츠 운영 원칙, 이용자 상호작용 기준, 뉴스레터와 외부 서비스 사용 범위를 안내합니다.",
  alternates: {
    canonical: "/policy",
  },
};

const policySections = [
  {
    title: "콘텐츠 운영 원칙",
    body: [
      "DYCDYP는 투자, AI, 문화, 인문 영역의 글을 큐레이션하고 편집하는 블로그입니다. 자동 생성 초안을 그대로 공개하지 않고, 사람이 검토하고 정리한 뒤 발행하는 것을 기본 원칙으로 삼습니다.",
      "다만 일부 글에는 해석, 요약, 의견이 함께 포함될 수 있으며, 모든 글이 절대적 사실이나 공식 입장을 의미하지는 않습니다.",
    ],
  },
  {
    title: "투자 및 정보성 콘텐츠 면책",
    body: [
      "투자 관련 글은 학습과 정보 탐색을 돕기 위한 참고 자료입니다. 특정 종목, 자산, 전략에 대한 매수·매도 권유나 투자 자문을 의미하지 않습니다.",
      "서비스 이용자는 자신의 판단과 책임 아래 의사결정을 내려야 하며, DYCDYP는 게시된 정보 활용으로 발생한 직접적·간접적 손실에 대해 책임지지 않습니다.",
    ],
  },
  {
    title: "댓글과 외부 상호작용",
    body: [
      "일부 글에는 외부 댓글 시스템이 연결될 수 있습니다. 해당 상호작용은 연동된 외부 플랫폼의 정책과 운영 방식에 영향을 받습니다.",
      "타인을 공격하거나 혐오를 조장하거나, 광고성·스팸성 목적이 명확한 내용은 예고 없이 숨김 또는 제한될 수 있습니다.",
    ],
  },
  {
    title: "뉴스레터와 연락",
    body: [
      "뉴스레터는 새로운 글이나 중요 업데이트를 전달하기 위한 수단입니다. 이용자가 직접 구독한 경우에만 발송 대상으로 관리합니다.",
      "서비스 운영상 필요하다고 판단될 경우 발송 빈도와 형식은 조정될 수 있으며, 구독자는 언제든 수신을 중단할 수 있습니다.",
    ],
  },
  {
    title: "정책 변경",
    body: [
      "서비스 구조와 운영 방식은 프로젝트 진행에 따라 바뀔 수 있습니다. 중요한 변경이 생기면 본 페이지의 내용을 갱신해 반영합니다.",
      "별도 공지가 필요한 수준의 정책 변경이 있는 경우, 사이트 내 안내 또는 관련 채널을 통해 함께 고지할 수 있습니다.",
    ],
  },
];

export default function PolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <SectionTitle
        eyebrow="Policy"
        title="DYCDYP 서비스 방침"
        description="이 페이지는 콘텐츠 운영 원칙과 이용자 상호작용 기준을 간단하고 분명하게 안내하기 위한 공개 방침입니다."
      />

      <div className="mt-10 space-y-4">
        {policySections.map((section) => (
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
