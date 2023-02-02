"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HistoryTable;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function HistoryTable(_ref) {
  let {
    usageDetailsResponse,
    errorOnApiHit,
    pagination,
    setPagination,
    eventData,
    loading,
    setPageSize,
    getUsageDetails
  } = _ref;
  const [currentPageSize, setCurrentPageSize] = (0, _react.useState)(10);
  const columns = [{
    title: 'DATE AND TIME',
    dataIndex: 'dateTime',
    key: 'dateTime'
  }, {
    title: 'TYPE',
    dataIndex: 'type',
    key: 'type'
  }, {
    title: 'QUANTITY/DURATION',
    dataIndex: 'duration',
    key: 'duration',
    render: (data, record) => /*#__PURE__*/_react.default.createElement("div", null, `${data} ${record.unitOfMeasurement}`)
  }, {
    title: 'CALLED NUMBER',
    dataIndex: 'calledNumber',
    key: 'calledNumber'
  }, {
    title: 'Direction',
    dataIndex: 'direction',
    key: 'direction'
  }, {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount'
  }, {
    title: 'Roaming',
    dataIndex: 'roamingIndicator',
    key: 'roamingIndicator',
    render: (data, record) => /*#__PURE__*/_react.default.createElement("div", null, `${data.toString()}`)
  }, {
    title: 'Data',
    dataIndex: 'dataUsageType',
    key: 'dataUsageType'
  }];
  const onShowSizeChange = (current, pageSize) => {
    setCurrentPageSize(pageSize);
  };
  function onPaginationChange(currentPagination) {
    setPageSize(currentPagination.pageSize);
  }
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, !usageDetailsResponse ? /*#__PURE__*/_react.default.createElement("div", {
    className: "history-table-error"
  }, eventData?.event?.data?.message || errorOnApiHit) : !loading ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    className: "usage-history-table-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
    columns: columns,
    dataSource: usageDetailsResponse?.eventInfo || [],
    rowClassName: "bg-transparent",
    className: "bg-transparent",
    pagination: {
      total: usageDetailsResponse?.eventInfo?.length || 1,
      pageSize: currentPageSize,
      onShowSizeChange: onShowSizeChange
    },
    onChange: currentPagination => {
      onPaginationChange(currentPagination);
    }
  })), usageDetailsResponse?.moreRows ? /*#__PURE__*/_react.default.createElement(_antd.Row, {
    span: 24
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24,
    className: "more-row-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      marginBottom: 16
    },
    type: "primary",
    onClick: () => {
      setPagination({
        ...pagination,
        paginationInfo: {
          ...pagination?.paginationInfo,
          pageNumber: pagination?.paginationInfo?.pageNumber + 1
        }
      });
      getUsageDetails(true);
    }
  }, "More Rows"))) : null) : '');
}
module.exports = exports.default;