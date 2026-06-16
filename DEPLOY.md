# 배포 가이드

## 1. Supabase 설정

1. https://supabase.com 에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 전체 내용을 실행
3. Project Settings → API에서 아래 두 값을 복사:
   - `Project URL`
   - `anon public` key

## 2. 로컬 개발

```bash
cp .env.local.example .env.local
# .env.local 에 위 값들 입력

npm install
npm run dev
```

## 3. Vercel 배포

```bash
npm i -g vercel
vercel
```

또는 GitHub에 push 후 Vercel 대시보드에서 Import:

1. https://vercel.com → New Project → GitHub 저장소 선택
2. Environment Variables에 아래 두 항목 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

## 파일 구조

```
├── app/
│   ├── api/
│   │   ├── leads/          GET(전체조회) POST(등록)
│   │   │   └── [id]/       DELETE(삭제)
│   │   ├── categories/
│   │   │   └── [id]/       PATCH(신호등 변경)
│   │   └── items/          POST(세부항목 추가)
│   │       └── [id]/       PATCH(내용수정) DELETE(삭제)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Dashboard.tsx       최상위 상태 관리
│   ├── Sidebar.tsx         리드 목록 + 등록 폼
│   ├── LeadSnapshot.tsx    리드 상세 대시보드
│   ├── CategoryCard.tsx    4×2 그리드 카드 (신호등 + 세부항목)
│   └── utils.ts            신호등 색상/레이블 상수
├── lib/
│   └── supabase.ts         Supabase 클라이언트 + 타입
└── supabase/
    └── schema.sql          DB 스키마
```
