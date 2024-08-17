import {X} from '@phosphor-icons/react';
import {arrayOf, func, object} from 'prop-types';
import ReactMarkdown from 'react-markdown';

import Dialog from './ui/Dialog.jsx';

// TODO: use some shared styles for things!
const styledMdComponents = {
  h2: ({node, ...props}) => (
    <h2 className="text-xl font-medium leading-6 text-base-content md:text-2xl" {...props} />
  ),
  h3: ({node, ...props}) => (
    <h3 className="my-4 text-lg font-medium leading-6 text-base-content md:text-xl" {...props} />
  ),
  ul: ({node, ordered, ...props}) => (
    <ul className="ml-6 list-outside list-disc text-xs" {...props} />
  ),
  p: ({node, ...props}) => <p className="mt-2 text-sm" {...props} />,
};

export default function WhatsNewPussycat({messages, onClose}) {
  const cleanMessages = messages.map(message => ({
    ...message,
    features: message.features.replace('\\n', '\n'),
  }));

  return (
    <Dialog isOpen={!!messages.length} onClose={onClose}>
      <button className="absolute right-2 top-2 focus:outline-none" onClick={onClose}>
        <X size={22} />
      </button>
      <div className="grid gap-6">
        {cleanMessages.map(message => (
          <div
            key={message.id}
            className="last:pb-2 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-6"
          >
            <ReactMarkdown components={styledMdComponents}>{message.features}</ReactMarkdown>
          </div>
        ))}
      </div>
    </Dialog>
  );
}

WhatsNewPussycat.propTypes = {
  messages: arrayOf(object).isRequired,
  onClose: func.isRequired,
};
