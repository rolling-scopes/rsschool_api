import * as React from 'react';
import { Alert, Button, AlertProps } from 'antd';

export function RegistryBanner(props: Partial<AlertProps>) {
  return (
    <Alert
      type="info"
      showIcon
      message="New RS School Course is starting and we are looking for mentors!"
      description={
        <Button type="primary" href="/registry/mentor">
          Register as Mentor
        </Button>
      }
      {...props}
    />
  );
}
