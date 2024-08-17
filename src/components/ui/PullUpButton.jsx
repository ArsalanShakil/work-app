import {Menu, Transition} from '@headlessui/react';
import {CaretUp} from '@phosphor-icons/react';
import {array} from 'prop-types';
import {Fragment} from 'react';
import {Link} from 'react-router-dom';

export default function PullUpButton({actions}) {
  return (
    <div className="relative flex w-full">
      <div className="w-full bg-accent text-center font-medium uppercase text-primary-content">
        {actions[0].to ? (
          <Link
            to={actions[0].to}
            onClick={actions[0].onClick}
            className="flex h-full w-full items-center justify-center outline-none"
          >
            {actions[0].label}
          </Link>
        ) : (
          <button className="h-full w-full uppercase" onClick={actions[0].onClick}>
            {actions[0].label}
          </button>
        )}
      </div>

      <Menu as="div" className="">
        <Menu.Button className="inline-flex h-full items-center border-l border-base-100 bg-accent p-3 px-4 text-primary-content">
          <CaretUp size={20} weight="bold" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute inset-x-0 bottom-full z-10 mb-3 border border-base-300/40 bg-base-100 shadow outline-none dark:border-base-300/60">
            <div className="divide-y divide-base-200 dark:divide-base-300/40">
              {actions
                .slice(1)
                .filter(a => !a.disabled)
                .map(action =>
                  action.to ? (
                    <Menu.Item key={action.to} className="block px-4 py-3">
                      <Link
                        to={action.to}
                        onClick={action.onClick}
                        state={action.state}
                        className="flex items-center gap-3"
                      >
                        {action.icon}
                        {action.label}
                      </Link>
                    </Menu.Item>
                  ) : (
                    <Menu.Item key={action.label} className="block px-4 py-3">
                      <button onClick={action.onClick} className="flex w-full items-center gap-3">
                        {action.icon}
                        {action.label}
                      </button>
                    </Menu.Item>
                  )
                )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

PullUpButton.propTypes = {
  actions: array,
};
