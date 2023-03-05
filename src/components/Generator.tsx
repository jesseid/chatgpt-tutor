import { createSignal, For, Show } from 'solid-js'
import MessageItem from './MessageItem'
import IconClear from './icons/Clear'
import type { ChatMessage } from '@/types'
import { useSpeechRecognition } from "react-speech-kit";
import RecordIcon from './icons/RecordIcon';
import StopIcon from './icons/StopIcon';
import { useState } from 'react';

export default () => {
  const [inputValue, setInputValue] = useState('');
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([])
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result: string) => {
      setInputValue(result);
    }
  });

  const handleButtonClick = async () => {
    if (!inputValue) {
      return
    }
    setLoading(true)
    // @ts-ignore
    if (window?.umami) umami.trackEvent('chat_generate')
    setMessageList([
      ...messageList(),
      {
        role: 'user',
        content: inputValue,
      },
    ])

    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        messages: messageList(),
      }),
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = response.body
    if (!data) {
      throw new Error('No data')
    }
    const reader = data.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      if (value) {
        let char = decoder.decode(value)
        if (char === '\n' && currentAssistantMessage().endsWith('\n')) {
          continue
        }
        if (char) {
          setCurrentAssistantMessage(currentAssistantMessage() + char)
        }
      }
      done = readerDone
    }
    setMessageList([
      ...messageList(),
      {
        role: 'assistant',
        content: currentAssistantMessage(),
      },
    ])
    setCurrentAssistantMessage('')
    setLoading(false)
  }

  const clear = () => {
    setInputValue('')
    setMessageList([])
    setCurrentAssistantMessage('')
  }
  const Show = ({ when, fallback, children }) => {
    return when ? children : fallback();
  };

  return (
    <div my-6>
      {/* <For each={messageList()}>{(message) => <MessageItem role={message.role} message={message.content} />}</For> */}
      {messageList().map((message) => <MessageItem role={message.role} message={message.content} />)}
      {currentAssistantMessage() && <MessageItem role="assistant" message={currentAssistantMessage} />}
      {/* <Show when={!loading()} fallback={() => <div className="h-12 my-4 flex items-center justify-center bg-slate bg-op-15 text-slate rounded-sm">AI is thinking...</div>}> */}
      <Show when={!loading()} fallback={() => <div className="h-12 my-4 flex items-center justify-center bg-slate bg-op-15 text-slate rounded-sm">AI is thinking...</div>}>
        <div className="my-4 flex items-center gap-2">
          <input
            value={inputValue}
            type="text"
            id="input"
            placeholder="Enter something..."
            autoComplete='off'
            autoFocus
            disabled={loading()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleButtonClick();
              }
            }}
            w-full
            px-4
            h-12
            text-slate
            rounded-sm
            bg-slate
            bg-op-15
            focus:bg-op-20
            focus:ring-0
            focus:outline-none
            placeholder:text-slate-400
            placeholder:op-30
          />
          <button title='listen' onClick={listen} disabled={loading()} h-12 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 text-slate rounded-sm>
            <RecordIcon />
          </button>
          <button title='stop' onClick={stop} disabled={loading()} h-12 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 text-slate rounded-sm>
            <StopIcon />
          </button>
          <button onClick={handleButtonClick} disabled={loading()} h-12 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 text-slate rounded-sm>
            Send
          </button>
          <button title='Clear' onClick={clear} disabled={loading()} h-12 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 text-slate rounded-sm>
            <IconClear />
          </button>
        </div>
      </Show>
    </div>
  )
}
