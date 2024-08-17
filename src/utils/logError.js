import Bugsnag from '@bugsnag/js';

import getSanitizedPathname from './getSanitizedPathname.js';

// Copied from https://github.com/One-com/node-httperrors/blob/master/lib/HttpError.js
// Copied from /lib/_http_server.js (node.js@7c9a691):
const httpErrorNameByStatusCode = {
  400: 'BadRequest',
  401: 'Unauthorized',
  402: 'PaymentRequired',
  403: 'Forbidden',
  404: 'NotFound',
  405: 'MethodNotAllowed',
  406: 'NotAcceptable',
  407: 'ProxyAuthenticationRequired',
  408: 'RequestTimeOut',
  409: 'Conflict',
  410: 'Gone',
  411: 'LengthRequired',
  412: 'PreconditionFailed',
  413: 'PayloadTooLarge',
  414: 'URITooLong',
  415: 'UnsupportedMediaType',
  416: 'RangeNotSatisfiable',
  417: 'ExpectationFailed',
  418: 'ImATeapot', // RFC 2324
  420: 'AnybodyNeedATowel',
  421: 'MisdirectedRequest',
  422: 'UnprocessableEntity', // RFC 4918
  423: 'Locked', // RFC 4918
  424: 'FailedDependency', // RFC 4918
  425: 'UnorderedCollection', // RFC 4918
  426: 'UpgradeRequired', // RFC 2817
  428: 'PreconditionRequired', // RFC 6585
  429: 'TooManyRequests', // RFC 6585
  431: 'RequestHeaderFieldsTooLarge', // RFC 6585
  451: 'UnavailableForLegalReasons',
  500: 'InternalServerError',
  501: 'NotImplemented',
  502: 'BadGateway',
  503: 'ServiceUnavailable',
  504: 'GatewayTimeout',
  505: 'HTTPVersionNotSupported',
  506: 'VariantAlsoNegotiates', // RFC 2295
  507: 'InsufficientStorage', // RFC 4918
  508: 'LoopDetected',
  509: 'BandwidthLimitExceeded',
  510: 'NotExtended', // RFC 2774
  511: 'NetworkAuthenticationRequired', // RFC 6585
};

export default function logError(err, {extraData = {}, context = []} = {}) {
  const httpErrorName = httpErrorNameByStatusCode[err.statusCode];
  if (httpErrorName) {
    err.name = httpErrorName;
  }

  if (err instanceof TypeError) {
    if (err.message?.includes('Load failed')) {
      err.name = 'LoadFailedError';
    }

    if (err.message?.includes('Failed to fetch')) {
      err.name = 'FailedToFetchError';
    }
  }

  Bugsnag.notify(err, event => {
    event.severity = 'error';

    const normalizedPathname = getSanitizedPathname();
    let eventContext = normalizedPathname;

    const localContext = context.filter(Boolean);
    if (localContext.length) {
      eventContext = localContext.join(' ') + ' ' + eventContext;
    }

    event.context = eventContext;

    if (extraData || err.extraData) {
      event.addMetadata('extraData', {
        ...err.extraData,
        ...extraData,
      });
    }
  });
}
