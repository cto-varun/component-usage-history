import React, { useState, useRef } from 'react';
import { DatePicker, Button, Select, Spin, Input } from 'antd';
import { CSVLink } from 'react-csv';
import { ExportOutlined, MobileOutlined, FileExcelOutlined } from '@ant-design/icons';
import moment from 'moment';
import { ExportTableButton } from 'ant-table-extensions';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Filter(props) {

    const exportButton = useRef(null);

    const { reportType = [], roaming = [], data = [] } = props?.filterValues;
    const [hackValue, setHackValue] = useState();
    const [value, setValue] = useState([]);
    const [dates, setDates] = useState([]);
    const [showInputFileName, setShowInputFileName] = useState(false);
    const [fileName, setFileName] = useState('');

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
        setIsAppend,
    } = props;
    const getButton = () => {
        if (!loading) {
            return (
                <Button
                    type="primary"
                    className="ml-2"
                    onClick={() => {
                        setIsAppend(true);
                        getUsageDetails(false, true);
                        setPagination({
                            ...pagination,
                            paginationInfo: {
                                ...pagination?.paginationInfo,
                                pageNumber: 1,
                            },
                        });
                    }}
                >
                    Show History
                </Button>
            );
        } else {
            return (
                <Button type="primary" className="ml-2 spinner-container">
                    <Spin />
                </Button>
            );
        }
    };

    const disabledDate = (current) => {
        if (current > moment().add(-1, 'days')) {
            return true;
        }

        if (!dates || dates.length === 0) {
            return false;
        }

        const tooLate = dates[0] && current.diff(dates[0], 'days') > 30;
        const tooEarly = dates[1] && dates[1].diff(current, 'days') > 30;
        return tooEarly || tooLate;
    };
    const onOpenChange = (open) => {
        if (open) {
            setHackValue([]);
            setDates([]);
            setValue([]);
        } else {
            setHackValue(undefined);
        }
    };
    return (
        <div className="bg-light">
            <div className="p-1 d-flex align-items-end">
                <Select
                    defaultValue={lineDetails[0]?.telephoneNumber}
                    style={{ width: 200 }}
                    onChange={(value, record) => {
                        setSelectedCtn(record?.key);
                    }}
                >
                    {lineDetails.map(({ telephoneNumber }, index) => {
                        return (
                            <Option value={telephoneNumber} key={index}>
                                <MobileOutlined /> {telephoneNumber}
                            </Option>
                        );
                    })}
                </Select>
                <div className="ml-2">
                    <div className="label-margin">Select Date Range<span style={{color:'#f00'}}>*</span>:</div>
                    <RangePicker
                        value={hackValue || value}
                        disabledDate={disabledDate}
                        onOpenChange={onOpenChange}
                        onCalendarChange={(val) => {
                            setDates(val);
                        }}
                        onChange={(val) => {
                            if (val === null || !val[0]) {
                                if (selectedFilters.startDate) {
                                    let selectedFiltersCopy = Object.assign(
                                        {},
                                        selectedFilters
                                    );
                                    delete selectedFiltersCopy.startDate;
                                    delete selectedFiltersCopy.endDate;
                                    setSelectedFilters({
                                        ...selectedFiltersCopy,
                                    });
                                }
                            } else {
                                setValue(val);
                                setSelectedFilters({
                                    ...selectedFilters,
                                    startDate: moment(val[0]).format(
                                        'YYYY-MM-DD'
                                    ),
                                    endDate: moment(val[1]).format(
                                        'YYYY-MM-DD'
                                    ),
                                });
                            }
                        }}
                    />
                </div>
                <div className="ml-2">
                    <div className="label-margin">Report Type:</div>
                    <Select
                        placeholder="Select"
                        style={{ width: 200 }}
                        onChange={(value) => {
                            setSelectedFilters({
                                ...selectedFilters,
                                type: value,
                            });
                        }}
                    >
                        {reportType.map((filter, index) => {
                            return (
                                <Option value={filter.value} key={index}>
                                    {filter.title}
                                </Option>
                            );
                        })}
                    </Select>
                </div>
                <div className="ml-2">
                    <div className="label-margin">Roaming:</div>
                    <Select
                        placeholder="Select"
                        style={{ width: 120 }}
                        defaultValue="BOTH"
                        onChange={(value) => {
                            setSelectedFilters({
                                ...selectedFilters,
                                roaming: value,
                            });
                        }}
                    >
                        {roaming.map((filter, index) => {
                            return (
                                <Option value={filter.value} key={index}>
                                    {filter.title}
                                </Option>
                            );
                        })}
                    </Select>
                </div>
                <div className="ml-2">
                    <div className="label-margin">Data:</div>
                    <Select
                        placeholder="Select"
                        style={{ width: 120 }}
                        defaultValue="ALL"
                        onChange={(value) => {
                            setSelectedFilters({
                                ...selectedFilters,
                                dataUsageType: value,
                            });
                        }}
                    >
                        {data.map((filter, index) => {
                            return (
                                <Option value={filter.value} key={index}>
                                    {filter.title}
                                </Option>
                            );
                        })}
                    </Select>
                </div>
                {getButton()}
                {showHistoryTable && usageDetailsResponse ? (
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
                    <>
                        <Input
                            placeholder="Input File Name"
                            required
                            className={`cm-file-input ${showInputFileName ? '' : 'd-none'}`}
                            onChange={(e) => { setFileName(e.target.value) }}
                            value={fileName}
                        />
                        <ExportTableButton
                            dataSource={usageDetailsResponse?.eventInfo || []}
                            columns={CSVHeaders}
                            fileName="usagedetails"
                            btnProps={{
                                type: 'primary',
                                icon: <ExportOutlined />,
                                className: 'ml-2 d-none',
                                ref: exportButton
                            }}
                            showColumnPicker
                        >
                            Export to CSV
                    </ExportTableButton>
                        <Button
                            type="primary"
                            className={showInputFileName ? '' : 'd-none'}
                            icon={<FileExcelOutlined />}
                            onClick={() => {
                                exportButton.current.click();
                                setShowInputFileName(false);
                            }}
                        >
                            Go
                    </Button>

                        <Button
                            type="primary"
                            className={showInputFileName ? 'd-none' : ''}
                            icon={<ExportOutlined />}
                            onClick={() => {
                                setShowInputFileName(true);
                            }}
                        >
                            Export to CSV
                    </Button>
                    </>

                ) : null
                }
            </div>
        </div>
    );
}
