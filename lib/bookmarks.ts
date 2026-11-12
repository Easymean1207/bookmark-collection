export type LinkItem = { title: string; description: string; url: string; category: string };

export const folders = [
  { id: "development", name: "개발" },
  { id: "design", name: "디자인" },
  { id: "news", name: "뉴스" },
  { id: "youtube", name: "유튜브" },
];

export const links: LinkItem[] = [
  { title: "Next.js 공식 문서", description: "Next.js의 공식 문서 페이지입니다. App Router, 라우팅, 데이터 패칭 등 다양한 내용을 다룹니다.", url: "https://nextjs.org/docs", category: "개발" },
  { title: "Tailwind CSS", description: "유틸리티 퍼스트 CSS 프레임워크로 빠르게 UI를 구성할 수 있습니다.", url: "https://tailwindcss.com", category: "개발" },
  { title: "Figma", description: "협업 기반의 UI/UX 디자인 툴. 프로토타이핑과 디자인 시스템 구성에 적합합니다.", url: "https://figma.com", category: "디자인" },
  { title: "Hacker News", description: "기술, 스타트업, 개발 관련 최신 뉴스와 토론을 볼 수 있는 커뮤니티입니다.", url: "https://news.ycombinator.com", category: "뉴스" },
  { title: "Fireship - YouTube", description: "웹 개발 관련 짧고 명확한 영상을 제공하는 인기 개발 유튜브 채널입니다.", url: "https://youtube.com/@Fireship", category: "유튜브" },
  { title: "TypeScript Handbook", description: "TypeScript 공식 핸드북. 타입 시스템의 기초부터 고급 기능까지 다룹니다.", url: "https://www.typescriptlang.org/docs/handbook/intro.html", category: "개발" },
];
