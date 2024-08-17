import {CheckCircle, Info, Warning, XCircle} from '@phosphor-icons/react';
import {func, node, string} from 'prop-types';
import {twJoin} from 'tailwind-merge';

const messageAlertBaseStyles = 'flex items-center justify-start gap-2 p-1.5';

const messageStyles = {
  success: {
    classes: 'alert alert-success',
    icon: <CheckCircle className="shrink-0" size={18} />,
  },
  info: {
    classes: 'alert alert-info',
    icon: <Info className="shrink-0" size={18} />,
  },
  warning: {
    classes: 'alert alert-warning',
    icon: <Warning className="shrink-0" size={18} />,
  },
  error: {
    classes: 'alert alert-error',
    icon: <XCircle className="shrink-0" size={18} />,
  },
  ping: {
    classes: 'alert alert-info',
    icon: (
      <div className="relative flex h-4 w-5 items-center justify-center">
        <span className="absolute h-3 w-3 rounded-full">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info-content opacity-90"></span>
          <span className="relative mb-3 inline-flex h-3 w-3 rounded-full bg-info-content"></span>
        </span>
      </div>
    ),
  },
};

export default function Message({variant = 'info', children, onClick, className}) {
  const actionClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={twJoin(
        className,
        actionClasses,
        messageStyles[variant]?.classes,
        messageAlertBaseStyles
      )}
      onClick={onClick}
    >
      {messageStyles[variant]?.icon}
      <div className="w-full text-left text-xs">{children}</div>
    </div>
  );
}

Message.propTypes = {
  children: node.isRequired,
  className: string,
  onClick: func,
  variant: string,
};
