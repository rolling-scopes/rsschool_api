import { Alert } from 'antd';
import { Alert as AlertType } from 'domain/alerts';
import React from 'react';

type Props = {
  alerts: AlertType[];
};

export function SystemAlerts({ alerts }: Props) {
  return (
    <>
      {alerts.map(({ text, type }) => {
        const alertType = type === 'warn' ? 'warning' : type;
        return <Alert key={text} style={{ margin: '8px 0' }} type={alertType} showIcon message={text} />;
      })}
    </>
  );
}
