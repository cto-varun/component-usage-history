"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Filter;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _reactCsv = require("react-csv");
var _icons = require("@ant-design/icons");
var _moment = _interopRequireDefault(require("moment"));
var _antTableExtensions = require("ant-table-extensions");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  RangePicker
} = _antd.DatePicker;
const {
  Option
} = _antd.Select;
function Filter(props) {
  const exportButton = (0, _react.useRef)(null);
  const {
    reportType = [],
    roaming = [],
    data = []
  } = props?.filterValues;
  const [hackValue, setHackValue] = (0, _react.useState)();
  const [value, setValue] = (0, _react.useState)([]);
  const [dates, setDates] = (0, _react.useState)([]);
  const [showInputFileName, setShowInputFileName] = (0, _react.useState)(false);
  const [fileName, setFileName] = (0, _react.useState)('');
  const {
    selectedFilters,
    setSelectedFilters,
    getUsageDetails,
    setPagination,
    pagination,
    usageDetailsResponse,
    CSVHeaders,
    showHistoryTable,
    lineDetails,
    setSelectedCtn,
    loading,
    setIsAppend
  } = props;
  const getButton = () => {
    if (!loading) {
      return /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "primary",
        className: "ml-2",
        onClick: () => {
          setIsAppend(true);
          getUsageDetails(false, true);
          setPagination({
            ...pagination,
            paginationInfo: {
              ...pagination?.paginationInfo,
              pageNumber: 1
            }
          });
        }
      }, "Show History");
    } else {
      return /*#__PURE__*/_react.default.createElement(_antd.Button, {
        type: "primary",
        className: "ml-2 spinner-container"
      }, /*#__PURE__*/_react.default.createElement(_antd.Spin, null));
    }
  };
  const disabledDate = current => {
    if (current > (0, _moment.default)().add(-1, 'days')) {
      return true;
    }
    if (!dates || dates.length === 0) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 30;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 30;
    return tooEarly || tooLate;
  };
  const onOpenChange = open => {
    if (open) {
      setHackValue([]);
      setDates([]);
      setValue([]);
    } else {
      setHackValue(undefined);
    }
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "bg-light"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "p-1 d-flex align-items-end"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    defaultValue: lineDetails[0]?.telephoneNumber,
    style: {
      width: 200
    },
    onChange: (value, record) => {
      setSelectedCtn(record?.key);
    }
  }, lineDetails.map((_ref, index) => {
    let {
      telephoneNumber
    } = _ref;
    return /*#__PURE__*/_react.default.createElement(Option, {
      value: telephoneNumber,
      key: index
    }, /*#__PURE__*/_react.default.createElement(_icons.MobileOutlined, null), " ", telephoneNumber);
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "ml-2"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "label-margin"
  }, "Select Date Range", /*#__PURE__*/_react.default.createElement("span", {
    style: {
      color: '#f00'
    }
  }, "*"), ":"), /*#__PURE__*/_react.default.createElement(RangePicker, {
    value: hackValue || value,
    disabledDate: disabledDate,
    onOpenChange: onOpenChange,
    onCalendarChange: val => {
      setDates(val);
    },
    onChange: val => {
      if (val === null || !val[0]) {
        if (selectedFilters.startDate) {
          let selectedFiltersCopy = Object.assign({}, selectedFilters);
          delete selectedFiltersCopy.startDate;
          delete selectedFiltersCopy.endDate;
          setSelectedFilters({
            ...selectedFiltersCopy
          });
        }
      } else {
        setValue(val);
        setSelectedFilters({
          ...selectedFilters,
          startDate: (0, _moment.default)(val[0]).format('YYYY-MM-DD'),
          endDate: (0, _moment.default)(val[1]).format('YYYY-MM-DD')
        });
      }
    }
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "ml-2"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "label-margin"
  }, "Report Type:"), /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select",
    style: {
      width: 200
    },
    onChange: value => {
      setSelectedFilters({
        ...selectedFilters,
        type: value
      });
    }
  }, reportType.map((filter, index) => {
    return /*#__PURE__*/_react.default.createElement(Option, {
      value: filter.value,
      key: index
    }, filter.title);
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "ml-2"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "label-margin"
  }, "Roaming:"), /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select",
    style: {
      width: 120
    },
    defaultValue: "BOTH",
    onChange: value => {
      setSelectedFilters({
        ...selectedFilters,
        roaming: value
      });
    }
  }, roaming.map((filter, index) => {
    return /*#__PURE__*/_react.default.createElement(Option, {
      value: filter.value,
      key: index
    }, filter.title);
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "ml-2"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "label-margin"
  }, "Data:"), /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select",
    style: {
      width: 120
    },
    defaultValue: "ALL",
    onChange: value => {
      setSelectedFilters({
        ...selectedFilters,
        dataUsageType: value
      });
    }
  }, data.map((filter, index) => {
    return /*#__PURE__*/_react.default.createElement(Option, {
      value: filter.value,
      key: index
    }, filter.title);
  }))), getButton(), showHistoryTable && usageDetailsResponse ?
  /*#__PURE__*/
  // <CSVLink
  //     data={usageDetailsResponse?.eventInfo || []}
  //     headers={CSVHeaders}
  //     target="_blank"
  //     filename={'Usage_Details.csv'}
  // >
  //     <Button
  //         icon={<ExportOutlined />}
  //         type="text"
  //         className="ml-2"
  //         className="text-green text-bold"
  //     >
  //         Export Data
  //     </Button>
  // </CSVLink>
  _react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Input File Name",
    required: true,
    className: `cm-file-input ${showInputFileName ? '' : 'd-none'}`,
    onChange: e => {
      setFileName(e.target.value);
    },
    value: fileName
  }), /*#__PURE__*/_react.default.createElement(_antTableExtensions.ExportTableButton, {
    dataSource: usageDetailsResponse?.eventInfo || [],
    columns: CSVHeaders,
    fileName: "usagedetails",
    btnProps: {
      type: 'primary',
      icon: /*#__PURE__*/_react.default.createElement(_icons.ExportOutlined, null),
      className: 'ml-2 d-none',
      ref: exportButton
    },
    showColumnPicker: true
  }, "Export to CSV"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    className: showInputFileName ? '' : 'd-none',
    icon: /*#__PURE__*/_react.default.createElement(_icons.FileExcelOutlined, null),
    onClick: () => {
      exportButton.current.click();
      setShowInputFileName(false);
    }
  }, "Go"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    className: showInputFileName ? 'd-none' : '',
    icon: /*#__PURE__*/_react.default.createElement(_icons.ExportOutlined, null),
    onClick: () => {
      setShowInputFileName(true);
    }
  }, "Export to CSV")) : null));
}
module.exports = exports.default;