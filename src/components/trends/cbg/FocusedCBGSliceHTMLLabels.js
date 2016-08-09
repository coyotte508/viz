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

import _ from 'lodash';
import cx from 'classnames';
import React, { PropTypes } from 'react';

import { displayBgValue } from '../../../utils/format';

import styles from './FocusedCBGSliceHTMLLabels.css';

const FocusedCBGSliceHTMLLabels = (props) => {
  const { focusedSlice } = props;
  if (!focusedSlice) {
    return null;
  }
  const { bgUnits, focusedKeys: keys, focusedSlice: { slice, position } } = props;
  const medPos = { left: position.left, top: position.topOptions.median };
  if (_.isEqual(keys, ['median'])) {
    const explainerClasses = cx({
      [styles.container]: true,
      [styles.medianExplainer]: !position.tooltipLeft,
      [styles.medianExplainerLeft]: position.tooltipLeft,
    });
    return (
      <div>
        <div className={`${styles.container} ${styles.medianValue}`} style={medPos}>
          <span className={styles.number}>{displayBgValue(slice.median, bgUnits)}</span>
        </div>
        <div className={explainerClasses} style={medPos}>
          <span className={styles.explainerText}>{props.explainers.median}</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className={`${styles.container} ${styles.medianUnfocused}`} style={medPos}>
        <span className={styles.plainNumber}>{displayBgValue(slice.median, bgUnits)}</span>
      </div>
      {_.map(keys, (key) => {
        const absPos = { left: position.left, top: position.topOptions[key] };
        const valueClasses = cx({
          [styles.container]: true,
          [styles.bottomNumber]: props.bottomNumbers[key] || false,
          [styles.topNumber]: props.topNumbers[key] || false,
        });
        return (
          <div className={valueClasses} key={key} style={absPos}>
            <span className={styles.number}>{displayBgValue(slice[key], bgUnits)}</span>
          </div>
        );
      })}
      {_.map(keys, (key) => {
        if (!props.explainers[key]) {
          return null;
        }
        const absPos = { left: position.left, top: position.topOptions[key] };
        const explainerClasses = cx({
          [styles.container]: true,
          [styles[`${key}Explainer`]]: !position.tooltipLeft,
          [styles[`${key}ExplainerLeft`]]: position.tooltipLeft,
        });
        return (
          <div className={explainerClasses} key={key} style={absPos}>
            <span className={styles.explainerText}>{props.explainers[key]}</span>
          </div>
        );
      })}
    </div>
  );
};

FocusedCBGSliceHTMLLabels.defaultProps = {
  bottomNumbers: {
    min: true,
    tenthQuantile: true,
    firstQuartile: true,
  },
  explainers: {
    max: 'top 10% of readings',
    median: 'middle (median)',
    min: 'bottom 10% of readings',
    ninetiethQuantile: 'most, 80%, of readings',
    thirdQuartile: 'half of readings',
  },
  topNumbers: {
    max: true,
    ninetiethQuantile: true,
    thirdQuartile: true,
  },
};

FocusedCBGSliceHTMLLabels.propTypes = {
  bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
  bottomNumbers: PropTypes.object.isRequired,
  explainers: PropTypes.object.isRequired,
  focusedKeys: PropTypes.array,
  focusedSlice: PropTypes.shape({
    slice: PropTypes.shape({
      firstQuartile: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      median: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
      ninetiethQuantile: PropTypes.number.isRequired,
      tenthQuantile: PropTypes.number.isRequired,
      thirdQuartile: PropTypes.number.isRequired,
    }).isRequired,
    position: PropTypes.shape({
      left: PropTypes.number.isRequired,
      tooltipLeft: PropTypes.bool.isRequired,
      topOptions: PropTypes.shape({
        firstQuartile: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
        median: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        ninetiethQuantile: PropTypes.number.isRequired,
        tenthQuantile: PropTypes.number.isRequired,
        thirdQuartile: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }),
  topNumbers: PropTypes.object.isRequired,
};

export default FocusedCBGSliceHTMLLabels;