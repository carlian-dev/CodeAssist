import React, { useState } from 'react';
import Blink from './Blink';

// Drop-in example: Blink reacts to your app's request state.
const MOOD_BY_STATUS = { idle: 'happy', loading: 'thinking', success: 'celebrate', error: 'oops' };
const LINES = {
  idle: 'Hi! Ask me anything about your code.',
  loading: 'Thinking…',
  success: 'Done! Your build passes.',
  error: 'Oops, something broke. Want me to take a look?',
};

export default function BlinkDemo() {
  const [status, setStatus] = useState('idle');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24, background: '#080F2B', color: '#F5F7FA', borderRadius: 24, fontFamily: 'system-ui, sans-serif' }}>
      <Blink mood={MOOD_BY_STATUS[status]} size={160} />
      <div>
        <p style={{ margin: '0 0 12px', fontSize: 18 }}>{LINES[status]}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.keys(MOOD_BY_STATUS).map((s) => (
            <button key={s} onClick={() => setStatus(s)} aria-pressed={status === s}>
              {s}
            </button>
          ))}
        </div>
        {/* small avatar variant, e.g. next to chat messages */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Blink variant="face" size={36} mood={MOOD_BY_STATUS[status]} />
          <span>Avatar size</span>
        </div>
      </div>
    </div>
  );
}
