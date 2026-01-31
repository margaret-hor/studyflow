import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CloseIcon, SendIcon, SparklesIcon } from '../../components/icons';
import styles from './AIAssistant.module.scss';

export default function AIAssistant({ book, isOpen, onClose, currentPage }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI reading assistant. I can help you understand **"${book.title}"** better. Ask me anything!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);

    setLoading(true);

    try {
      const systemPrompt = `You are a helpful reading assistant. Help the user understand the book "${book.title}" by ${book.authors.join(', ')}. 

Book description: ${book.description}

Current page: ${currentPage} / ${book.pageCount}

Provide clear, simple explanations. Be encouraging and patient.`;

      const apiMessages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
          .filter(m => m.content !== messages[0].content)
          .map(m => ({
            role: m.role,
            content: m.content
          })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const requestBody = {
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024
      };

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.choices[0].message.content
        }]);
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const quickPrompts = [
    "Summarize this chapter",
    "Explain in simple terms",
    "What are the key points?",
    "Help me understand this"
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <SparklesIcon />
            <h2>AI Reading Assistant</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
              {msg.role === 'assistant' && (
                <div className={styles.avatar}>
                  <SparklesIcon />
                </div>
              )}
              <div className={styles.messageContent}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.avatar}>
                <SparklesIcon />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typing}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className={styles.quickPrompts}>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInput(prompt)}
                className={styles.promptButton}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about this book..."
            disabled={loading}
            rows={2}
          />
          <button
            type='submit'
            disabled={!input.trim() || loading}
            className={styles.sendButton}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}