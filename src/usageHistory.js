import React, { useState, useEffect } from 'react';
import { MessageBus } from '@ivoyant/component-message-bus';

//antd components
import { Row, Col, Empty, notification } from 'antd';
import * as Icons from '@ant-design/icons';
import {
    Chart,
    registerShape,
    Axis,
    Tooltip,
    Interval,
    Interaction,
    Coordinate,
} from 'bizcharts';
import Filter from './components/Filter';
// import SearchBar from './components/SearchBar';

//components
import HistoryTable from './components/HistoryTable';

//styles
import './styles.css';

export default function UsageHistory({ data, properties, parentProps }) {
    const { lineDetails, accountDetails, usageHistory } = data?.data;

    const {
        mandatoryFieldsError: { message = '', description = '' },
    } = properties;

    let { statusActvCode, statusActvRsnCode } = accountDetails;
    let { dueDaysLeft } = accountDetails;
    // Hotline suspended
    if (statusActvCode === 'SUS' && statusActvRsnCode === 'CO') {
        dueDaysLeft = 0;
    }

    let ctns = [];
    lineDetails?.map(({ telephoneNumber }) => {
        let newValue = usageHistory?.find(
            ({ phoneNumber }) => phoneNumber === telephoneNumber
        );
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
        CSVHeaders,
    } = properties;

    const {
        workflow,
        datasource,
        successStates,
        errorStates,
        responseMapping,
    } = properties.workflow;

    const initialPagination = {
        paginationInfo: {
            pageNumber: 1,
        },
    };
    //const declaractions
    const sliceNumber = chartParams.sliceNumber;

    //states
    const [showHistoryTable, setShowHistoryTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        roaming: 'BOTH',
        dataUsageType: 'ALL',
        type: '',
    });
    const [pagination, setPagination] = useState({ ...initialPagination });
    const [pageSize, setPageSize] = useState(10);
    const [usageDetailsResponse, setUsageDetailsResponse] = useState({});
    const [eventData, setEventData] = useState({});
    const [isAppend, setIsAppend] = useState(false);
    const [selectedCtn, setSelectedCtn] = useState(0);

    useEffect(() => {
        setIsAppend(false);
    }, [selectedFilters, selectedCtn]);

    registerShape('interval', 'sliceShape', {
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
                    path: path,
                },
            });
        },
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

        return (
            <span>
                <Icon />
            </span>
        );
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
    const handleResponse = (
        subscriptionId,
        topic,
        eventData,
        closure,
        isReset
    ) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                // console.log()
                // const newUsageResponse = eventData?.event?.data?.data;
                // const newEventInfo = newUsageResponse?.eventInfo;
                if (isAppend && !isReset) {
                    let newUsageDetails = { ...eventData?.event?.data?.data };
                    newUsageDetails.eventInfo = [
                        ...usageDetailsResponse?.eventInfo,
                        ...newUsageDetails?.eventInfo,
                    ];
                    setUsageDetailsResponse(newUsageDetails || false);
                } else
                    setUsageDetailsResponse(
                        eventData?.event?.data?.data || false
                    );
            }
            if (isFailure) {
                setUsageDetailsResponse(false);
                setEventData(eventData);
                console.log(
                    `Error while fetching `,
                    eventData?.event?.data?.message
                );
            }
            setLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };
    function getUsageDetails(isPaginationChanged, isReset) {
        console.log('selectedFilters ', selectedFilters);
        if (
            selectedFilters?.hasOwnProperty('startDate') &&
            selectedFilters?.hasOwnProperty('endDate')
        ) {
            const submitEvent = 'SUBMIT';
            setShowHistoryTable(true);
            setLoading(true);
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: workflow,
                    workflow,
                    eventType: 'INIT',
                },
            });
            MessageBus.subscribe(
                workflow,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleResponse,
                {},
                isReset
            );
            MessageBus.send(
                'WF.'.concat(workflow).concat('.').concat(submitEvent),
                {
                    header: {
                        registrationId: workflow,
                        workflow,
                        eventType: submitEvent,
                    },
                    body: {
                        datasource: parentProps.datasources[datasource],
                        request: {
                            params: {
                                phoneNumber: ctns[selectedCtn]?.phoneNumber,
                            },
                            body: {
                                ...selectedFilters,
                                ...(isPaginationChanged
                                    ? pagination
                                    : initialPagination),
                                subscriberContext:
                                    ctns[selectedCtn]?.phoneNumber,
                            },
                        },
                        responseMapping,
                    },
                }
            );
        } else {
            // notify agent that start date and end date is required.
            notification.error({
                message: message,
                description: description,
            });
        }
    }

    useEffect(() => {
        setShowHistoryTable(false);
    }, [selectedCtn]);

    const [usageSummary, setUsageSummary] = useState([]);

    return ctns && ctns.length > 0 ? (
        <>
            <Filter
                setIsAppend={setIsAppend}
                filterValues={filters}
                usageDetailsResponse={usageDetailsResponse}
                selectedFilters={selectedFilters}
                pagination={pagination}
                CSVHeaders={CSVHeaders}
                setPagination={setPagination}
                getUsageDetails={getUsageDetails}
                setSelectedFilters={setSelectedFilters}
                showHistoryTable={showHistoryTable}
                lineDetails={lineDetails}
                setSelectedCtn={setSelectedCtn}
                loading={loading}
            />
            {showHistoryTable ? (
                <>
                    <Row className="mt-2">
                        {ctns[selectedCtn].usageSummary.map(
                            (
                                {
                                    usedUsageInfo,
                                    remainingUsageInfo,
                                    serviceTypeFlag,
                                    title,
                                    monthlyQuota,
                                },
                                recordIndex
                            ) => {
                                return (
                                    <Col
                                        key={`col-${recordIndex}`}
                                        sm={{
                                            span: containerLayout.sm,
                                        }}
                                        xl={{
                                            span: containerLayout.xl,
                                        }}
                                        xxl={{
                                            span: containerLayout.xxl,
                                        }}
                                        className="p-1"
                                    >
                                        <div
                                            className="chart-container p-1 br-clr mb-1"
                                            style={{
                                                minHeight: 215,
                                            }}
                                        >
                                            <Col xs={{ span: 8 }}>
                                                <div className="chart-image">
                                                    {getIcon(serviceTypeFlag)}
                                                </div>
                                                <Chart
                                                    data={[
                                                        {
                                                            type: 'spent',
                                                            value:
                                                                usedUsageInfo.usedQuota &&
                                                                Number(
                                                                    usedUsageInfo.usedQuota
                                                                ),
                                                            color:
                                                                usedUsageInfo?.usedPercentage ===
                                                                '100'
                                                                    ? '#f5222d'
                                                                    : getColorByFlag(
                                                                          serviceTypeFlag
                                                                      ),
                                                        },
                                                        {
                                                            type: 'left',
                                                            color:
                                                                'rgb(240,240,240)',
                                                            value: remainingUsageInfo.remainingQuota
                                                                ? Number(
                                                                      remainingUsageInfo.remainingQuota
                                                                  )
                                                                : Number(
                                                                      monthlyQuota
                                                                  ) -
                                                                  Number(
                                                                      usedUsageInfo.usedQuota
                                                                  ),
                                                        },
                                                    ]}
                                                    height={chartParams.height}
                                                    autoFit
                                                    pure
                                                >
                                                    <Coordinate
                                                        type="theta"
                                                        radius={0.8}
                                                        innerRadius={0.75}
                                                    />
                                                    <Axis visible={false} />
                                                    <Tooltip
                                                        showTitle={false}
                                                    />
                                                    <Interval
                                                        adjust="stack"
                                                        position="value"
                                                        color="type"
                                                        shape="sliceShape"
                                                    />
                                                    <Interaction type="element-single-selected" />
                                                </Chart>
                                            </Col>
                                            <Col xs={{ span: 16 }}>
                                                <Col
                                                    xs={{
                                                        span: 24,
                                                    }}
                                                >
                                                    <span className="days-left">
                                                        {(dueDaysLeft ||
                                                            dueDaysLeft ===
                                                                0) &&
                                                            dueDaysLeft +
                                                                ' Days Left'}
                                                    </span>
                                                </Col>
                                                <Col
                                                    xs={{
                                                        span: 24,
                                                    }}
                                                >
                                                    <span className="graph-title">
                                                        Monthly {title} :{' '}
                                                        {monthlyQuota}{' '}
                                                    </span>
                                                </Col>
                                                <Row>
                                                    <div className="flex-row">
                                                        <span
                                                            className="dot"
                                                            style={{
                                                                backgroundColor:
                                                                    usedUsageInfo?.usedPercentage ===
                                                                    '100'
                                                                        ? '#f5222d'
                                                                        : getColorByFlag(
                                                                              serviceTypeFlag
                                                                          ),
                                                            }}
                                                        />
                                                        <div className="detail-text ml-2">
                                                            {
                                                                usedUsageInfo?.usedTitle
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex-row">
                                                        <span
                                                            className="dot"
                                                            style={{
                                                                backgroundColor:
                                                                    'rgb(240,240,240)',
                                                            }}
                                                        />
                                                        <div className="detail-text ml-2">
                                                            {
                                                                remainingUsageInfo?.remainingTitle
                                                            }
                                                        </div>
                                                    </div>
                                                </Row>
                                            </Col>
                                        </div>
                                    </Col>
                                );
                            }
                        )}
                    </Row>
                    <HistoryTable
                        errorOnApiHit={errorOnApiHit}
                        showHistoryTable={showHistoryTable}
                        usageDetailsResponse={usageDetailsResponse}
                        pagination={pagination}
                        setPagination={setPagination}
                        eventData={eventData}
                        loading={loading}
                        getUsageDetails={getUsageDetails}
                        setPageSize={setPageSize}
                    />
                </>
            ) : null}
        </>
    ) : (
        <Empty
            className="empty-data-message-margin"
            description={emptyDataMessage}
        />
    );
}
