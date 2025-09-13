import { X } from 'lucide-react';

interface QuestionModalProps {
  questions: string[];
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

function QuestionModal({ questions, onClose, onSelectQuestion }: QuestionModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-secondary rounded-2xl p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Customized Questions</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectQuestion(question);
                onClose();
              }}
              className="w-full text-left p-4 bg-secondary rounded-lg hover:bg-accent transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionModal;