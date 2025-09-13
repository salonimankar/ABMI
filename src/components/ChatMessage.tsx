interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp?: Date;
}

export default function ChatMessage({ message, isAI, timestamp }: ChatMessageProps) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          isAI ? 'bg-indigo-100' : 'bg-gray-100'
        }`}>
          <span className={`font-medium ${isAI ? 'text-indigo-600' : 'text-gray-600'}`}>
            {isAI ? 'AI' : 'You'}
          </span>
        </div>
      </div>
      <div className="ml-3">
        <div className={`rounded-lg px-4 py-2 ${
          isAI ? 'bg-gray-100' : 'bg-indigo-100'
        }`}>
          <p className="text-sm text-gray-900">{message}</p>
          {timestamp && (
            <p className="text-xs text-gray-500 mt-1">
              {timestamp.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 