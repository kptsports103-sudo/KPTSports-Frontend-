import { useEffect, useMemo, useState } from 'react';
import OptimizedImage from '../components/OptimizedImage';
import api from '../services/api';
import './About.css';

const EMPTY_BOXES = ['', '', ''];

const normalizeStorySegments = (text) => {
  const cleaned = String(text || '').trim();
  if (!cleaned) return [];

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((segment) => segment.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs;
  }

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (sentences.length <= 2) {
    return [cleaned];
  }

  const grouped = [];
  for (let index = 0; index < sentences.length; index += 2) {
    grouped.push(sentences.slice(index, index + 2).join(' ').trim());
  }

  return grouped.filter(Boolean);
};

const About = () => {
  const [content, setContent] = useState({
    bannerImages: [],
    boxes: EMPTY_BOXES,
    bigHeader: '',
    bigText: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (content.bannerImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % content.bannerImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [content.bannerImages.length]);

  const storySegments = useMemo(
    () =>
      normalizeStorySegments(content.bigText).map((segment, index) => ({
        id: index,
        label: `Part ${String(index + 1).padStart(2, '0')}`,
        body: segment
      })),
    [content.bigText]
  );

  const loadContent = async () => {
    try {
      const { data } = await api.get('/home');
      setContent({
        bannerImages: Array.isArray(data.bannerImages) ? data.bannerImages : [],
        boxes: Array.isArray(data.boxes) && data.boxes.length ? data.boxes : EMPTY_BOXES,
        bigHeader: data.bigHeader || '',
        bigText: data.bigText || ''
      });
    } catch (err) {
      console.error('Failed to load about content:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="about-page about-page--loading">
        <div className="about-page__loader">Loading...</div>
      </div>
    );
  }

  const storyTitle = content.bigHeader || 'Our Story';

  return (
    <div className="about-page">
      <section className="about-page__hero">
        <p className="about-page__eyebrow">About KPT Sports</p>
        <h1 className="about-page__title">KPT Sports About</h1>
        <p className="about-page__intro">
          Competition, discipline, and shared progress across Karnataka polytechnics.
        </p>
      </section>

      {content.bannerImages.length > 0 && (
        <section className="about-page__banner-wrap">
          <div className="about-page__banner">
            <div
              className="about-page__slides"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {content.bannerImages.map((banner, index) => (
                <OptimizedImage
                  key={index}
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  width={1600}
                  height={900}
                  sizes="100vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  className="about-page__banner-image"
                />
              ))}
            </div>

            <div className="about-page__banner-year">
              {content.bannerImages[currentSlide]?.year || 'KPT Sports'}
            </div>
          </div>
        </section>
      )}

      <section className="about-page__highlights">
        {content.boxes.map((box, index) => (
          <article className="about-page__highlight-card" key={index}>
            <span className="about-page__highlight-index">
              Focus {String(index + 1).padStart(2, '0')}
            </span>
            <p>{box || 'Content coming soon...'}</p>
          </article>
        ))}
      </section>

      <section className="about-page__story">
        <div className="about-page__story-heading">
          <div>
            <p className="about-page__eyebrow">Our Story</p>
            <h2>{storyTitle}</h2>
          </div>
          <p className="about-page__story-summary">
            The journey is split into clear parts so visitors can scan the story instead of reading one long wall of text.
          </p>
        </div>

        {storySegments.length > 0 ? (
          <div className="about-page__story-grid">
            {storySegments.map((segment) => (
              <article className="about-page__story-card" key={segment.id}>
                <div className="about-page__story-card-top">
                  <span className="about-page__story-label">{segment.label}</span>
                  <span className="about-page__story-line" />
                </div>
                <p className="about-page__story-body">{segment.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="about-page__story-empty">Story content coming soon.</div>
        )}
      </section>
    </div>
  );
};

export default About;
