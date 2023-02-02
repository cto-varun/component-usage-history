"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = UsageHistory;
var _react = _interopRequireWildcard(require("react"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _antd = require("antd");
var Icons = _interopRequireWildcard(require("@ant-design/icons"));
var _bizcharts = require("bizcharts");
var _Filter = _interopRequireDefault(require("./components/Filter"));
var _HistoryTable = _interopRequireDefault(require("./components/HistoryTable"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//antd components

// import SearchBar from './components/SearchBar';

//components

//styles

function UsageHistory(_ref) {
  let {
    data,
    properties,
    parentProps
  } = _ref;
  const {
    lineDetails,
    accountDetails,
    usageHistory
  } = data?.data;
  const {
    mandatoryFieldsError: {
      message = '',
      description = ''
    }
  } = properties;
  let {
    statusActvCode,
    statusActvRsnCode
  } = accountDetails;
  let {
    dueDaysLeft
  } = accountDetails;
  // Hotline suspended
  if (statusActvCode === 'SUS' && statusActvRsnCode === 'CO') {
    dueDaysLeft = 0;
  }
  let ctns = [];
  lineDetails?.map(_ref2 => {
    let {
      telephoneNumber
    } = _ref2;
    let newValue = usageHistory?.find(_ref3 => {
      let {
        phoneNumber
      } = _ref3;
      return phoneNumber === telephoneNumber;
    });
    if (newValue) {
      ctns.push(newValue);
    }
  });
  let {
    chartParams,
    containerLayout,
    emptyDataMessage,
    filters,
    errorOnApiHit,
    CSVHeaders
  } = properties;
  const {
    workflow,
    datasource,
    successStates,
    errorStates,
    responseMapping
  } = properties.workflow;
  const initialPagination = {
    paginationInfo: {
      pageNumber: 1
    }
  };
  //const declaractions
  const sliceNumber = chartParams.sliceNumber;

  //states
  const [showHistoryTable, setShowHistoryTable] = (0, _react.useState)(false);
  const [loading, setLoading] = (0, _react.useState)(false);
  const [selectedFilters, setSelectedFilters] = (0, _react.useState)({
    roaming: 'BOTH',
    dataUsageType: 'ALL',
    type: ''
  });
  const [pagination, setPagination] = (0, _react.useState)({
    ...initialPagination
  });
  const [pageSize, setPageSize] = (0, _react.useState)(10);
  const [usageDetailsResponse, setUsageDetailsResponse] = (0, _react.useState)({});
  const [eventData, setEventData] = (0, _react.useState)({});
  const [isAppend, setIsAppend] = (0, _react.useState)(false);
  const [selectedCtn, setSelectedCtn] = (0, _react.useState)(0);
  (0, _react.useEffect)(() => {
    setIsAppend(false);
  }, [selectedFilters, selectedCtn]);
  (0, _bizcharts.registerShape)('interval', 'sliceShape', {
    draw(cfg, container) {
      const points = cfg.points;
      let path = [];
      path.push(['M', points[0].x, points[0].y]);
      path.push(['L', points[1].x, points[1].y - sliceNumber]);
      path.push(['L', points[2].x, points[2].y - sliceNumber]);
      path.push(['L', points[3].x, points[3].y]);
      path.push('Z');
      path = this.parsePath(path);
      return container.addShape('path', {
        attrs: {
          fill: cfg.data.color,
          path: path
        }
      });
    }
  });

  /**
   * Get the icon based on the service type flag
   * @param {String} serviceTypeFlag
   * @retutns {Function} Icon component
   */
  function getIcon(serviceTypeFlag) {
    const text = () => {
      switch (serviceTypeFlag) {
        case 'D':
        case 'T':
          return 'GlobalOutlined';
        case 'S':
        case 'M':
          return 'MessageOutlined';
        default:
          return 'ShakeOutlined';
      }
    };
    const Icon = Icons[text(serviceTypeFlag)];
    return /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(Icon, null));
  }

  /**
   * Get color by service type flag
   * @param {String} serviceTypeFlag
   * @retutns {String} color
   */
  function getColorByFlag(serviceTypeFlag) {
    switch (serviceTypeFlag) {
      case 'D':
      case 'T':
        return '#1890FF';
      case 'S':
      case 'M':
        return '#FBD437';
      default:
        return '#4ECB73';
    }
  }
  const handleResponse = (subscriptionId, topic, eventData, closure, isReset) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        // console.log()
        // const newUsageResponse = eventData?.event?.data?.data;
        // const newEventInfo = newUsageResponse?.eventInfo;
        if (isAppend && !isReset) {
          let newUsageDetails = {
            ...eventData?.event?.data?.data
          };
          newUsageDetails.eventInfo = [...usageDetailsResponse?.eventInfo, ...newUsageDetails?.eventInfo];
          setUsageDetailsResponse(newUsageDetails || false);
        } else setUsageDetailsResponse(eventData?.event?.data?.data || false);
      }
      if (isFailure) {
        setUsageDetailsResponse(false);
        setEventData(eventData);
        console.log(`Error while fetching `, eventData?.event?.data?.message);
      }
      setLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  function getUsageDetails(isPaginationChanged, isReset) {
    console.log('selectedFilters ', selectedFilters);
    if (selectedFilters?.hasOwnProperty('startDate') && selectedFilters?.hasOwnProperty('endDate')) {
      const submitEvent = 'SUBMIT';
      setShowHistoryTable(true);
      setLoading(true);
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleResponse, {}, isReset);
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
        header: {
          registrationId: workflow,
          workflow,
          eventType: submitEvent
        },
        body: {
          datasource: parentProps.datasources[datasource],
          request: {
            params: {
              phoneNumber: ctns[selectedCtn]?.phoneNumber
            },
            body: {
              ...selectedFilters,
              ...(isPaginationChanged ? pagination : initialPagination),
              subscriberContext: ctns[selectedCtn]?.phoneNumber
            }
          },
          responseMapping
        }
      });
    } else {
      // notify agent that start date and end date is required.
      _antd.notification.error({
        message: message,
        description: description
      });
    }
  }
  (0, _react.useEffect)(() => {
    setShowHistoryTable(false);
  }, [selectedCtn]);
  const [usageSummary, setUsageSummary] = (0, _react.useState)([]);
  return ctns && ctns.length > 0 ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Filter.default, {
    setIsAppend: setIsAppend,
    filterValues: filters,
    usageDetailsResponse: usageDetailsResponse,
    selectedFilters: selectedFilters,
    pagination: pagination,
    CSVHeaders: CSVHeaders,
    setPagination: setPagination,
    getUsageDetails: getUsageDetails,
    setSelectedFilters: setSelectedFilters,
    showHistoryTable: showHistoryTable,
    lineDetails: lineDetails,
    setSelectedCtn: setSelectedCtn,
    loading: loading
  }), showHistoryTable ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "mt-2"
  }, ctns[selectedCtn].usageSummary.map((_ref4, recordIndex) => {
    let {
      usedUsageInfo,
      remainingUsageInfo,
      serviceTypeFlag,
      title,
      monthlyQuota
    } = _ref4;
    return /*#__PURE__*/_react.default.createElement(_antd.Col, {
      key: `col-${recordIndex}`,
      sm: {
        span: containerLayout.sm
      },
      xl: {
        span: containerLayout.xl
      },
      xxl: {
        span: containerLayout.xxl
      },
      className: "p-1"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "chart-container p-1 br-clr mb-1",
      style: {
        minHeight: 215
      }
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: {
        span: 8
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "chart-image"
    }, getIcon(serviceTypeFlag)), /*#__PURE__*/_react.default.createElement(_bizcharts.Chart, {
      data: [{
        type: 'spent',
        value: usedUsageInfo.usedQuota && Number(usedUsageInfo.usedQuota),
        color: usedUsageInfo?.usedPercentage === '100' ? '#f5222d' : getColorByFlag(serviceTypeFlag)
      }, {
        type: 'left',
        color: 'rgb(240,240,240)',
        value: remainingUsageInfo.remainingQuota ? Number(remainingUsageInfo.remainingQuota) : Number(monthlyQuota) - Number(usedUsageInfo.usedQuota)
      }],
      height: chartParams.height,
      autoFit: true,
      pure: true
    }, /*#__PURE__*/_react.default.createElement(_bizcharts.Coordinate, {
      type: "theta",
      radius: 0.8,
      innerRadius: 0.75
    }), /*#__PURE__*/_react.default.createElement(_bizcharts.Axis, {
      visible: false
    }), /*#__PURE__*/_react.default.createElement(_bizcharts.Tooltip, {
      showTitle: false
    }), /*#__PURE__*/_react.default.createElement(_bizcharts.Interval, {
      adjust: "stack",
      position: "value",
      color: "type",
      shape: "sliceShape"
    }), /*#__PURE__*/_react.default.createElement(_bizcharts.Interaction, {
      type: "element-single-selected"
    }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: {
        span: 16
      }
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: {
        span: 24
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "days-left"
    }, (dueDaysLeft || dueDaysLeft === 0) && dueDaysLeft + ' Days Left')), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      xs: {
        span: 24
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "graph-title"
    }, "Monthly ", title, " :", ' ', monthlyQuota, ' ')), /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "flex-row"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "dot",
      style: {
        backgroundColor: usedUsageInfo?.usedPercentage === '100' ? '#f5222d' : getColorByFlag(serviceTypeFlag)
      }
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "detail-text ml-2"
    }, usedUsageInfo?.usedTitle)), /*#__PURE__*/_react.default.createElement("div", {
      className: "flex-row"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "dot",
      style: {
        backgroundColor: 'rgb(240,240,240)'
      }
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "detail-text ml-2"
    }, remainingUsageInfo?.remainingTitle))))));
  })), /*#__PURE__*/_react.default.createElement(_HistoryTable.default, {
    errorOnApiHit: errorOnApiHit,
    showHistoryTable: showHistoryTable,
    usageDetailsResponse: usageDetailsResponse,
    pagination: pagination,
    setPagination: setPagination,
    eventData: eventData,
    loading: loading,
    getUsageDetails: getUsageDetails,
    setPageSize: setPageSize
  })) : null) : /*#__PURE__*/_react.default.createElement(_antd.Empty, {
    className: "empty-data-message-margin",
    description: emptyDataMessage
  });
}
module.exports = exports.default;