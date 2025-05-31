
import React from 'react';
import { useParams } from 'react-router-dom';
import NaturalDisastersArticle from '@/components/articles/NaturalDisastersArticle';
import EarthquakeThreeCountriesArticle from '@/components/articles/EarthquakeThreeCountriesArticle';
import DisasterTwentyYearsArticle from '@/components/articles/DisasterTwentyYearsArticle';
import PM25vsPM10Article from '@/components/articles/PM25vsPM10Article';
import ArticleNotFound from '@/components/articles/ArticleNotFound';

const ArticleDetail: React.FC = () => {
  const { id } = useParams();

  switch (id) {
    case 'natural-disasters':
      return <NaturalDisastersArticle />;
    case 'earthquake-3countries':
      return <EarthquakeThreeCountriesArticle />;
    case 'disaster-20years':
      return <DisasterTwentyYearsArticle />;
    case 'pm25-vs-pm10':
      return <PM25vsPM10Article />;
    default:
      return <ArticleNotFound />;
  }
};

export default ArticleDetail;
