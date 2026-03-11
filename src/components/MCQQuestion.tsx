import type { MCQQuestion as MCQQuestionModel } from '../models';

export interface MCQQuestionProps {
  question: MCQQuestionModel;
  selectedChoiceIds: string[];
  onToggleChoice: (choiceId: string) => void;
}

const MCQQuestion = ({ question, selectedChoiceIds, onToggleChoice }: MCQQuestionProps): JSX.Element => {
  const isMulti = question.type === 'mcq_multi';

  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">{question.stem}</h2>
      </header>
      <div className="space-y-2" role="group" aria-label="Answer choices">
        {question.choices.map((choice, index) => {
          const inputId = `${question.id}-${choice.id}`;
          const checked = selectedChoiceIds.includes(choice.id);
          return (
            <label
              key={choice.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition ${
                checked ? 'border-primary bg-primary/20' : 'border-slate-700 hover:bg-slate-800'
              }`}
              htmlFor={inputId}
            >
              <input
                id={inputId}
                type={isMulti ? 'checkbox' : 'radio'}
                name={question.id}
                value={choice.id}
                checked={checked}
                onChange={() => onToggleChoice(choice.id)}
                className="mt-1"
              />
              <div>
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                <span>{choice.text}</span>
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Keyboard: 1–9 to toggle options, Enter to submit, N to move next, R to mark for review.
      </p>
    </div>
  );
};

export default MCQQuestion;
