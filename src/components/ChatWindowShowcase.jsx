import { Link } from 'react-router-dom';
import './ChatWindowShowcase.css';

const featureBadges = [
  'Message bubbles',
  'Timestamps',
  'Feedback controls',
  'Typing indicator',
  'Scrollable history',
];

const promptChips = [
  'Upcoming indoor events',
  'Registration details',
  'Winner details',
  'Results and points table',
];

const ChatWindowShowcase = () => {
  return (
    <section className="section-shell chat-window-showcase" aria-labelledby="chat-window-showcase-title">
      <div className="chat-window-showcase__panel">
        <div className="chat-window-showcase__content">
          <p className="chat-window-showcase__eyebrow">AI Support Preview</p>
          <h2 id="chat-window-showcase-title">Chat Window Interface</h2>
          <p className="chat-window-showcase__description">
            The primary chatbot interaction area displays visitor messages, assistant replies,
            timestamps, feedback actions, typing state, and a scrollable conversation history.
          </p>

          <div className="chat-window-showcase__badges" aria-label="Chat interface features">
            {featureBadges.map((badge) => (
              <span key={badge} className="chat-window-showcase__badge">
                {badge}
              </span>
            ))}
          </div>

          <div className="chat-window-showcase__prompts" aria-label="Sample chatbot topics">
            {promptChips.map((chip) => (
              <span key={chip} className="chat-window-showcase__prompt">
                {chip}
              </span>
            ))}
          </div>

          <div className="chat-window-showcase__actions">
            <Link to="/sports-celebration" className="chat-window-showcase__action chat-window-showcase__action--primary">
              Explore Sports Celebration
            </Link>
            <Link to="/events" className="chat-window-showcase__action chat-window-showcase__action--secondary">
              Browse Events
            </Link>
          </div>
        </div>

        <div className="chat-window-showcase__visual">
          <div className="chat-window-showcase__visual-frame">
            <img
              src="/assets/chat-window-interface.svg"
              alt="Chat window interface showing user and assistant message bubbles"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatWindowShowcase;
