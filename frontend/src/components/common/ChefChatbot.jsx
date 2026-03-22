// frontend/src/components/common/ChefChatbot.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import { FiSend, FiX, FiMessageCircle, FiTrash2 } from 'react-icons/fi'

const SUGGESTED_QUESTIONS = [
  'How do I fix a salty curry?',
  'What can I cook in 15 minutes?',
  'How to make food less spicy?',
  'Best substitute for cream?',
]

const WELCOME = {
  role: 'assistant',
  content: "👨‍🍳 Hi! I'm your AI Chef Assistant. Ask me anything about cooking — recipes, techniques, substitutions, or tips!",
  id: 'welcome'
}

export default function ChefChatbot() {
  const { user } = useSelector(s => s.auth)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg, id: Date.now() }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const { data } = await api.post('/ai/chat', {
        messages: history.filter(m => m.id !== 'welcome').map(m => ({
          role: m.role,
          content: m.content
        }))
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        id: Date.now() + 1
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again!",
        id: Date.now() + 1
      }])
    }
    setLoading(false)
  }

  const clearChat = () => setMessages([WELCOME])

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-orange-600 text-white shadow-lg flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><FiX size={22} /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
                <FiMessageCircle size={22} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px] flex flex-col card shadow-2xl overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-orange-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👨‍🍳</span>
                <div>
                  <p className="font-bold text-white text-sm">Chef AI</p>
                  <p className="text-orange-100 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
                    Always here to help
                  </p>
                </div>
              </div>
              <button onClick={clearChat} className="text-orange-200 hover:text-white transition-colors" title="Clear chat">
                <FiTrash2 size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <span className="text-xl mr-2 flex-shrink-0 mt-1">👨‍🍳</span>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <span className="text-xl mr-2">👨‍🍳</span>
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors border border-primary-100 dark:border-primary-800">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Chef AI anything..."
                className="input-field flex-1 text-sm py-2"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="btn-primary px-3 py-2 disabled:opacity-40"
              >
                <FiSend size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}