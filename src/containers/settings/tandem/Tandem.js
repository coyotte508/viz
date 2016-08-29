/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import React, { PropTypes } from 'react';

import styles from './Tandem.css';

import Table from '../../../components/common/Table';
import CollapsibleContainer from '../../common/CollapsibleContainer';
import Header from '../header/Header';

import * as utilities from '../data/utilities';
import * as processing from '../data/processing';

const Tandem = (props) => {
  const { bgUnits, pumpSettings } = props;
  const schedules = utilities.getTimedSchedules(pumpSettings.basalSchedules);

  const COLUMNS = [
    { key: 'start',
      label: 'Start time',
      className: '' },
    { key: 'rate',
      label: 'Basal Rates (U/hr)',
      className: styles.basalSchedulesHeader },
    { key: 'bgTarget',
      label: `BG Target (${bgUnits})`,
      className: styles.bolusSettingsHeader },
    { key: 'carbRatio',
      label: 'I:C Ratio (g/U)',
      className: styles.bolusSettingsHeader },
    { key: 'insulinSensitivity',
      label: `ISF (${bgUnits}/U)`,
      className: styles.bolusSettingsHeader },
  ];

  const tables = schedules.map((schedule) => (
    <div key={schedule.name}>
      <CollapsibleContainer
        styledLabel={{
          label: utilities.getScheduleLabel(schedule.name, pumpSettings.activeSchedule),
          className: styles.collapsibleHeader,
        }}
        openByDefault={schedule.name === pumpSettings.activeSchedule}
        openedStyle={styles.collapsibleOpened}
        closedStyle={styles.collapsibleClosed}
      >
        <Table
          rows={processing.processTimedSettings(pumpSettings, schedule, bgUnits)}
          columns={COLUMNS}
          tableStyle={styles.basalTable}
        />
      </CollapsibleContainer>
    </div>
  ));
  return (
    <div>
      <Header
        deviceType="Tandem"
        deviceMeta={utilities.getDeviceMeta(pumpSettings)}
      />
      {tables}
    </div>
  );
};

Tandem.propTypes = {
  bgUnits: PropTypes.oneOf([utilities.MMOLL_UNITS, utilities.MGDL_UNITS]).isRequired,
  pumpSettings: processing.timedSettingsShape.isRequired,
};

export default Tandem;
