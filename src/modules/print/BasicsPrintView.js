/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

/* eslint-disable lodash/prefer-lodash-method */

import _ from 'lodash';
import moment from 'moment';

import PrintView from './PrintView';

import {
  calculateBasalBolusStats,
  cgmStatusMessage,
  determineBgDistributionSource,
  reduceByDay,
  generateCalendarDayLabels,
} from '../../utils/basics/data';

import { calcBgPercentInCategories, generateBgRangeLabels } from '../../utils/bloodglucose';
import { formatPercentage, formatDecimalNumber } from '../../utils/format';

import { pie, arc } from 'd3-shape';
import parse from 'parse-svg-path';
import translate from 'translate-svg-path';
import serialize from 'serialize-svg-path';

class BasicsPrintView extends PrintView {
  constructor(doc, data, opts) {
    super(doc, data, opts);

    this.data = reduceByDay(this.data, this.bgPrefs);

    // Auto-bind callback methods
    this.renderStackedStat = this.renderStackedStat.bind(this);
    this.renderPieChart = this.renderPieChart.bind(this);
    this.renderCalendarCell = this.renderCalendarCell.bind(this);

    this.doc.addPage();
    this.initLayout();
  }

  initCalendar() {
    const columnWidth = this.getActiveColumnWidth();
    const calendar = {};

    calendar.labels = generateCalendarDayLabels(this.data.days);

    calendar.headerHeight = 15;

    calendar.columns = _.map(calendar.labels, label => ({
      id: label,
      header: label,
      width: columnWidth / 7,
      height: columnWidth / 7,
      cache: false,
      renderer: this.renderCalendarCell,
      headerBorder: '',
      headerPadding: [4, 2, 0, 2],
      padding: [3, 2, 3, 2],
    }));

    calendar.days = this.data.days;

    this.calendar = calendar;
  }

  initLayout() {
    this.setLayoutColumns({
      width: this.chartArea.width,
      gutter: 20,
      type: 'percentage',
      widths: [25, 50, 25],
    });
  }

  render() {
    console.log('data', this.data);
    console.log('doc', this.doc);
    // this.doc.addPage();
    this.renderLeftColumn();
    this.renderCenterColumn();
    this.renderRightColumn();
  }

  renderLeftColumn() {
    this.goToLayoutColumnPosition(0);

    this.renderBgDistribution();
    this.renderAggregatedStats();
  }

  renderCenterColumn() {
    this.goToLayoutColumnPosition(1);

    this.initCalendar();

    this.renderCalendarSection({
      title: this.data.sections.fingersticks.title,
      data: this.data.data.fingerstick.smbg.dataByDate,
      color: this.colors.smbg,
    });

    this.renderCalendarSection({
      title: this.data.sections.boluses.title,
      data: this.data.data.bolus.dataByDate,
      color: this.colors.bolus,
    });

    // this.renderCalendarSection({
    //   title: {
    //     text: this.data.sections.siteChanges.title,
    //     subText: 'from cannula fills', // reservoirChange | tubingPrime
    //   },
    //   data: this.data.data.cannulaPrime, // reservoirChange | tubingPrime
    // });

    this.renderCalendarSection({
      title: this.data.sections.basals.title,
      data: this.data.data.basal.dataByDate,
      color: this.colors.basal,
    });
  }

  renderRightColumn() {

  }

  renderBgDistribution() {
    const { source, cgmStatus } = determineBgDistributionSource(this.data);

    const columnWidth = this.getActiveColumnWidth();

    this.renderSectionHeading('BG Distribution', {
      width: columnWidth,
      fontSize: this.largeFontSize,
    });

    if (source) {
      const distribution = calcBgPercentInCategories(this.data.data[source].data, this.bgBounds);

      this.doc.text(cgmStatusMessage(cgmStatus), { width: columnWidth });

      const tableColumns = [
        {
          id: 'value',
          cache: false,
          renderer: this.renderCustomTextCell,
          width: columnWidth,
          height: 35,
          fontSize: this.largeFontSize,
          font: this.boldFont,
          noteFontSize: this.smallFontSize,
          align: 'center',
        },
      ];

      const bgRangeLabels = generateBgRangeLabels(this.bgPrefs);
      const bgRangeColors = _.mapValues(distribution, (value, key) => {
        switch (key) {
          case 'veryLow':
          case 'low':
            return this.colors.low;

          case 'high':
          case 'veryHigh':
            return this.colors.high;

          case 'target':
          default:
            return this.colors.target;
        }
      });

      const rows = _.map(_.keys(distribution), key => {
        const value = distribution[key];
        const stripePadding = 2;

        return {
          value: {
            text: formatPercentage(value),
            note: bgRangeLabels[key],
          },
          _fillStripe: {
            color: bgRangeColors[key],
            opacity: 0.75,
            width: (columnWidth - (2 * stripePadding)) * distribution[key],
            background: true,
            padding: stripePadding,
          },
        };
      }).reverse();

      this.renderTable(tableColumns, rows, {
        showHeaders: false,
        bottomMargin: 15,
      });
    } else {
      this.doc.text('No BG data available', { width: columnWidth });
    }
  }

  renderAggregatedStats() {
    const {
      averageDailyCarbs,
      averageDailyDose,
      basalBolusRatio,
      totalDailyDose,
    } = calculateBasalBolusStats(this.data);

    this.renderSimpleStat(
      this.data.sections.averageDailyCarbs.title,
      formatDecimalNumber(averageDailyCarbs),
      ' g'
    );

    this.renderBasalBolusRatio(averageDailyDose, basalBolusRatio);

    this.renderSimpleStat(this.data.sections.totalDailyDose.title,
      formatDecimalNumber(totalDailyDose, 1),
      ' U'
    );
  }

  renderBasalBolusRatio(averageDailyDose, basalBolusRatio) {
    const columnWidth = this.getActiveColumnWidth();

    const heading = {
      text: this.data.sections.basalBolusRatio.title,
    };

    this.renderTableHeading(heading, {
      font: this.font,
      fontSize: this.defaultFontSize,
      columnDefaults: {
        width: columnWidth,
        border: 'TLR',
      },
    });

    const tableColumns = [
      {
        id: 'basal',
        align: 'center',
        width: columnWidth * 0.33,
        height: 50,
        cache: false,
        renderer: this.renderStackedStat,
        border: 'LB',
      },
      {
        id: 'chart',
        align: 'center',
        width: columnWidth * 0.34,
        height: 50,
        cache: false,
        renderer: this.renderPieChart,
        padding: [0, 0, 0, 0],
        border: 'B',
      },
      {
        id: 'bolus',
        align: 'center',
        width: columnWidth * 0.33,
        height: 50,
        cache: false,
        renderer: this.renderStackedStat,
        border: 'RB',
      },
    ];

    const rows = [
      {
        basal: {
          stat: 'Basal',
          value: formatPercentage(basalBolusRatio.basal),
          summary: `${formatDecimalNumber(averageDailyDose.basal, 1)} U`,
        },
        chart: {
          data: [
            {
              value: basalBolusRatio.basal,
              color: this.colors.basal,
            },
            {
              value: basalBolusRatio.bolus,
              color: this.colors.bolus,
            },
          ],
        },
        bolus: {
          stat: 'Bolus',
          value: formatPercentage(basalBolusRatio.bolus),
          summary: `${formatDecimalNumber(averageDailyDose.bolus, 1)} U`,
        },
      },
    ];

    this.renderTable(tableColumns, rows, {
      showHeaders: false,
      bottomMargin: 15,
    });
  }

  renderStackedStat(tb, data, draw, column, pos, padding) {
    if (draw) {
      const {
        stat,
        value,
        summary,
      } = data[column.id];

      const xPos = pos.x + _.get(padding, 'left', 0);
      const yPos = pos.y + padding.top;

      const width = column.width - _.get(padding, 'left', 0) - _.get(padding, 'right', 0);
      const align = _.get(column, 'align', 'left');

      const textOpts = {
        align,
        width,
        paragraphGap: 5,
      };

      this.doc
        .font(this.boldFont)
        .fontSize(this.smallFontSize)
        .text(stat, xPos, yPos, textOpts);

      this.doc
        .font(this.boldFont)
        .fontSize(this.largeFontSize)
        .text(value, _.assign({}, textOpts, {
          paragraphGap: 0,
        }));

      this.doc
        .font(this.font)
        .fontSize(this.smallFontSize)
        .text(summary, textOpts);
    }

    return ' ';
  }

  renderPieChart(tb, data, draw, column, pos) {
    if (draw) {
      const {
        width,
        height,
      } = column;

      const radius = width > height ? height / 2 : width / 2;
      const xPos = pos.x + width / 2;
      const yPos = pos.y + height / 2;

      const {
        data: pieData,
      } = data[column.id];

      const arcData = pie()(_.map(pieData, datum => datum.value));

      const generateArcPath = (datum) => (
        arc()
          .innerRadius(0)
          .outerRadius(radius)(datum)
      );

      _.each(arcData, (segment, index) => {
        const path = generateArcPath(segment);
        const points = translate(parse(path), xPos, yPos);
        const adjustedPath = serialize(points);

        this.setFill(pieData[index].color, 1);

        this.doc
          .path(adjustedPath)
          .fill();
      });

      this.setFill();
    }

    return ' ';
  }

  renderSimpleStat(stat, value, units) {
    const columnWidth = this.getActiveColumnWidth();

    const tableColumns = [
      {
        id: 'stat',
        cache: false,
        renderer: this.renderCustomTextCell,
        width: columnWidth * 0.65,
        height: 35,
        fontSize: this.defaultFontSize,
        font: this.font,
        align: 'left',
        border: 'TBL',
        valign: 'center',
      },
      {
        id: 'value',
        cache: false,
        renderer: this.renderCustomTextCell,
        width: columnWidth * 0.35,
        height: 35,
        fontSize: this.defaultFontSize,
        font: this.boldFont,
        align: 'right',
        border: 'TBR',
        valign: 'center',
      },
    ];

    const rows = [
      {
        stat,
        value: `${value}${units}`,
      },
    ];

    this.renderTable(tableColumns, rows, {
      showHeaders: false,
      bottomMargin: 15,
    });
  }

  renderCalendarSection(opts) {
    const {
      title,
      data,
      color,
    } = opts;

    const columnWidth = this.getActiveColumnWidth();

    this.renderSectionHeading(title, {
      width: columnWidth,
      fontSize: this.largeFontSize,
    });

    const chunkedDayMap = _.chunk(_.map(this.calendar.days, (day, index) => {
      const date = moment.utc(day.date);
      const dateLabelMask = (index === 0 || date.date() === 1) ? 'MMM D' : 'D';

      return {
        dayOfWeek: date.format('ddd'),
        color,
        count: _.get(data, `${day.date}.total`, null),
        isFuture: day.type === 'future',
        label: date.format(dateLabelMask),
      };
    }), 7);

    const rows = _.map(chunkedDayMap, week => {
      const values = {};

      _.each(week, day => {
        values[day.dayOfWeek] = day;
      });

      return values;
    });

    this.doc.fontSize(this.smallFontSize);
    this.doc.y = this.doc.y - Math.round(this.doc.currentLineHeight()) + 5;

    this.renderTable(this.calendar.columns, rows, {

    });
  }

  renderCalendarCell(tb, data, draw, column, pos, padding) {
    if (draw) {
      const {
        color,
        count,
        isFuture,
        label,
      } = data[column.id];

      const xPos = pos.x + padding.left;
      const yPos = pos.y + padding.top;


      this.setFill(isFuture ? this.colors.grey : 'black', 1);

      this.doc
        .fontSize(this.extraSmallFontSize)
        .text(label, xPos, yPos);

      const width = column.width - _.get(padding, 'left', 0) - _.get(padding, 'right', 0);
      const height = column.height - _.get(padding, 'top', 0) - _.get(padding, 'bottom', 0);

      const gridHeight = height - (this.doc.y - yPos);
      const gridWidth = width > gridHeight ? gridHeight : width;

      if (count > 0) {
        const gridPos = {
          x: pos.x + (column.width - gridWidth) / 2,
          y: this.doc.y,
        };

        this.setFill(color);
        this.renderCountGrid(count, gridWidth, gridPos, color);
        this.setFill();
      }

      this.resetText();
    }

    return ' ';
  }

  renderCountGrid(count, width, pos, color) {
    const colCount = 3;
    const rowCount = 3;
    const gridSpaces = colCount * rowCount;
    const padding = width * 0.05;
    const maxCount = gridSpaces * gridSpaces;
    const renderCount = count > maxCount ? maxCount : count;

    const {
      x: xPos,
      y: yPos,
    } = pos;

    const diameter = (width - padding * (colCount - 1)) / colCount;
    const radius = diameter / 2;

    const grid = _.times(rowCount, (row) => _.times(colCount, (col) => ({
      x: xPos + (col * diameter) + (padding * col),
      y: yPos + (row * diameter) + (padding * row),
    })));

    const countArray = _.fill(Array(renderCount), 1);
    const extrasArray = _.map(
      _.chunk(countArray.splice(gridSpaces), gridSpaces - 1),
      chunk => chunk.length
    ).reverse();

    const gridValues = _.map(
      _.fill(Array(gridSpaces), 0),
      (space, index) => (_.get(countArray, index, 0) + _.get(extrasArray, index, 0)),
    );

    if (extrasArray.length) {
      gridValues.reverse();
    }

    const chunkedGridValues = _.chunk(gridValues, colCount);

    const renderColumn = rowIndex => (col, colIndex) => {
      const gridPos = grid[rowIndex][colIndex];
      const dot = chunkedGridValues[rowIndex][colIndex];

      if (dot > 1) {
        this.renderCountGrid(dot, diameter, gridPos, color);
      } else if (dot === 1) {
        this.doc
          .circle(gridPos.x + radius, gridPos.y + radius, radius)
          .fill();
      }
    };

    const renderRow = (row, rowIndex) => {
      _.each(row, renderColumn(rowIndex));
    };

    _.each(chunkedGridValues, renderRow);
  }
}

export default BasicsPrintView;
