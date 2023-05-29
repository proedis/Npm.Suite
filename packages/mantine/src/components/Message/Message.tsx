import * as React from 'react';

import { RequestError } from '@proedis/client';

import { Alert, Box, Code, Divider, Text } from '@mantine/core';

import Icon from '../Icon';

import type { MessageProps } from './Message.types';


/* --------
 * Utilities
 * -------- */
const VIEW_REQUEST_ERROR_EXTRAS = process.env.NODE_ENV === 'development';

const requestErrorToMessageProps = (requestError: RequestError): MessageProps => ({
  appearance: 'danger',
  content   : (
    <div>
      <Text fz={'sm'} color={'danger.4'} fw={600}>
        {requestError.error}
      </Text>
      {VIEW_REQUEST_ERROR_EXTRAS && (
        <React.Fragment>
          <Divider
            color={'danger'}
            my={'sm'}
            label={(
              <Text component={'b'}>{requestError.statusCode}</Text>
            )}
            labelPosition={'center'}
          />

          {requestError.url && (
            <Box mt={'sm'} fz={'xs'}>
              <Text color={'danger'} component={'b'}>
                {(requestError.method || 'GET').toUpperCase()} @ {requestError.url}
              </Text>
            </Box>
          )}

          {requestError.response && (
            <Code block color={'danger'} style={{ whiteSpace: 'pre-wrap' }} fz={'xs'} mt={'sm'}>
              {JSON.stringify(requestError.response, null, 2)}
            </Code>
          )}

          {requestError.stack && (
            <Code block color={'danger'} style={{ whiteSpace: 'pre-wrap' }} fz={'xs'} mt={'sm'}>
              {requestError.stack}
            </Code>
          )}
        </React.Fragment>
      )}
    </div>
  ),
  header    : requestError.message
});


/* --------
 * Component Definition
 * -------- */
const Message: React.FunctionComponent<MessageProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    appearance,
    content,
    header,
    icon
  } = (
    props.requestError && props.requestError instanceof RequestError
      ? requestErrorToMessageProps(props.requestError)
      : props
  );


  // ----
  // Memoized Data
  // ----
  const iconElement = React.useMemo(
    () => {
      /** If a user defined icon exists, return it */
      if (icon) {
        return Icon.create(icon, { autoGenerateKey: false });
      }

      /** Build icon according to appearance */
      if (appearance === 'warning' || appearance === 'danger') {
        return Icon.create('exclamation-circle', { autoGenerateKey: false });
      }

      if (appearance === 'success') {
        return Icon.create('check', { autoGenerateKey: false });
      }

      return null;
    },
    [ appearance, icon ]
  );


  // ----
  // Component Render
  // ----
  return (
    <Alert icon={iconElement} title={header} color={appearance}>
      {content}
    </Alert>
  );

};

Message.displayName = 'Message';

export default Message;
