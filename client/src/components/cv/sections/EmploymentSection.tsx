import * as React from 'react';
import { Row, Col, Typography, List } from 'antd';
import SectionCV from '../SectionCV';
import { UserOutlined } from '@ant-design/icons';
import { EmploymentRecord } from '../../../../../common/models/cv';

const { Text } = Typography;
const { Item } = List;

type Props = {
  employmentHistory: EmploymentRecord[];
};

function EmploymentSection(props: Props) {
  const { employmentHistory } = props;

  const sectionContent = (
    <List
      dataSource={employmentHistory}
      renderItem={(record: EmploymentRecord) => {
        const { startYear, finishYear, position, organization, isCurrent } = record;

        const areYearsDifferent = startYear !== finishYear;

        let finishYearView;

        if (isCurrent) {
          finishYearView = (
            <>
              <br />
              <Text>Currently</Text>
            </>
          );
        } else if (areYearsDifferent) {
          finishYearView = (
            <>
              <br />
              <Text>{finishYear}</Text>
            </>
          );
        } else {
          finishYearView = null;
        }

        return (
          <Item style={{ fontSize: '16px' }}>
            <Row justify="space-between" style={{ width: '100%' }}>
              <Col span={12}>
                {organization ? (
                  <>
                    <Text strong>{organization}</Text>
                    <br />
                    <Text>{position}</Text>
                  </>
                ) : (
                    <Text strong>{position}</Text>
                  )}
              </Col>
              <Col span={3} offset={9}>
                <Text>{startYear}</Text>
                {finishYearView}
              </Col>
            </Row>
          </Item>
        );
      }}
    />
  );

  const icon = <UserOutlined />;

  return <SectionCV content={sectionContent} title="Employment history" icon={icon} />;
}

export default EmploymentSection;
