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

export const BG_HIGH = 'High';
export const BG_LOW = 'Low';

const STIFFNESS = 180;
const DAMPING = 40;
const PRECISION = 0.1;

export const springConfig = { stiffness: STIFFNESS, damping: DAMPING, precision: PRECISION };

export const MGDL_CLAMP_TOP = 400;
export const MMOLL_CLAMP_TOP = 22.5;

export const MGDL_UNITS = 'mg/dL';
export const MMOLL_UNITS = 'mmol/L';
export const MGDL_PER_MMOLL = 18.01559;

const ONE_WEEK = 7;
const TWO_WEEKS = 14;
const FOUR_WEEKS = 28;

export const trends = { extentSizes: { ONE_WEEK, TWO_WEEKS, FOUR_WEEKS } };

export const MS_IN_DAY = 864e5;
export const MS_IN_HOUR = 864e5 / 24;
export const MS_IN_MIN = MS_IN_HOUR / 60;

export const CGM_READINGS_ONE_DAY = 288;
export const CGM_DATA_KEY = 'cbg';
export const BGM_DATA_KEY = 'smbg';
export const NO_CGM = 'noCGM';
export const CGM_CALCULATED = 'calculatedCGM';
export const NOT_ENOUGH_CGM = 'notEnoughCGM';

export const NO_SITE_CHANGE = 'noSiteChange';
export const SITE_CHANGE = 'siteChange';
export const SITE_CHANGE_RESERVOIR = 'reservoirChange';
export const SITE_CHANGE_TUBING = 'tubingPrime';
export const SITE_CHANGE_CANNULA = 'cannulaPrime';

export const SECTION_TYPE_UNDECLARED = 'undeclared';

export const INSULET = 'Insulet';
export const TANDEM = 'Tandem';
export const ANIMAS = 'Animas';
export const MEDTRONIC = 'Medtronic';

export const pumpVocabulary = {
  [ANIMAS]: {
    [SITE_CHANGE_RESERVOIR]: 'Go Rewind',
    [SITE_CHANGE_TUBING]: 'Go Prime',
    [SITE_CHANGE_CANNULA]: 'Fill Cannula',
  },
  [INSULET]: {
    [SITE_CHANGE_RESERVOIR]: 'Change Pod',
    [SITE_CHANGE_TUBING]: 'Activate Pod',
    [SITE_CHANGE_CANNULA]: 'Prime',
  },
  [MEDTRONIC]: {
    [SITE_CHANGE_RESERVOIR]: 'Rewind',
    [SITE_CHANGE_TUBING]: 'Prime',
    [SITE_CHANGE_CANNULA]: 'Prime Cannula',
  },
  [TANDEM]: {
    [SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
    [SITE_CHANGE_TUBING]: 'Fill Tubing',
    [SITE_CHANGE_CANNULA]: 'Fill Cannula',
  },
  default: {
    [SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
    [SITE_CHANGE_TUBING]: 'Fill Tubing',
    [SITE_CHANGE_CANNULA]: 'Fill Cannula',
  },
};

