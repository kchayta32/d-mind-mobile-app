
export interface Article {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  content: string;
  created_at: string;
}

export interface ArticleManagerProps {
  onBack: () => void;
  type: 'article' | 'guide';
}
