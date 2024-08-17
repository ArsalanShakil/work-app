import {object} from 'prop-types';
import {ReactMarkdown} from 'react-markdown/lib/react-markdown';

import logoUrl from '../assets/logo.png';
import {forceReload} from '../utils/misc.js';
import BlockingDialog from './ui/BlockingDialog.jsx';

// TODO: use some shared styles for things!
const h2Styles = 'text-xl md:text-2xl font-medium leading-6 text-base-content';

const styledMdComponents = {
  h2: ({node, ...props}) => <h2 className={h2Styles} {...props} />,
  h3: ({node, ...props}) => (
    <h3 className="my-4 text-lg font-medium leading-6 text-base-content md:text-xl" {...props} />
  ),
  ul: ({node, ordered, ...props}) => (
    <ul className="ml-6 list-outside list-disc text-xs" {...props} />
  ),
  p: ({node, ...props}) => <p className="mt-2 text-sm" {...props} />,
};

export default function ForceUpgrade({data}) {
  const {force, message, latestVersion} = data;

  const cleanedMessage = message.replace('\\n', '\n');

  return (
    <BlockingDialog noSideBar>
      <div className="flex h-full w-full justify-center">
        <div className="flex h-full w-full max-w-md flex-col p-4">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div>
              <img className="h-16 w-auto" src={logoUrl} alt="RP logo" />
              <h1 className="mt-3 text-3xl font-bold uppercase tracking-widest text-primary">
                Hypertrophy
              </h1>
            </div>

            <div className="mt-10 w-full space-y-4 pl-2 text-left">
              <h2 className={h2Styles}>{force ? 'Upgrade Required' : 'Please Upgrade'}</h2>
              <div>
                <ReactMarkdown components={styledMdComponents}>{cleanedMessage}</ReactMarkdown>
              </div>
              <div className="flex w-full flex-col space-y-4">
                <button
                  className="btn btn-primary btn-block mt-5"
                  onClick={() => forceReload(latestVersion)}
                  tabIndex={-1}
                >
                  Upgrade now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlockingDialog>
  );
}

ForceUpgrade.propTypes = {
  data: object.isRequired,
};
