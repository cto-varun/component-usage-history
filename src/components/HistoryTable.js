import React, { useState } from 'react';
import { Table, Row, Button, Col } from 'antd';

export default function HistoryTable({
    usageDetailsResponse,
    errorOnApiHit,
    pagination,
    setPagination,
    eventData,
    loading,
    setPageSize,
    getUsageDetails,
}) {
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const columns = [
        {
            title: 'DATE AND TIME',
            dataIndex: 'dateTime',
            key: 'dateTime',
        },
        {
            title: 'TYPE',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'QUANTITY/DURATION',
            dataIndex: 'duration',
            key: 'duration',
            render: (data, record) => (
                <div>{`${data} ${record.unitOfMeasurement}`}</div>
            ),
        },
        {
            title: 'CALLED NUMBER',
            dataIndex: 'calledNumber',
            key: 'calledNumber',
        },
        {
            title: 'Direction',
            dataIndex: 'direction',
            key: 'direction',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Roaming',
            dataIndex: 'roamingIndicator',
            key: 'roamingIndicator',
            render: (data, record) => <div>{`${data.toString()}`}</div>,
        },
        {
            title: 'Data',
            dataIndex: 'dataUsageType',
            key: 'dataUsageType',
        },
    ];

    const onShowSizeChange = (current, pageSize) => {
        setCurrentPageSize(pageSize);
    };

    function onPaginationChange(currentPagination) {
        setPageSize(currentPagination.pageSize);
    }

    return (
        <>
            {!usageDetailsResponse ? (
                <div className="history-table-error">
                    {eventData?.event?.data?.message || errorOnApiHit}
                </div>
            ) : !loading ? (
                <>
                    <Row className="usage-history-table-container">
                        <Table
                            columns={columns}
                            dataSource={usageDetailsResponse?.eventInfo || []}
                            rowClassName="bg-transparent"
                            className="bg-transparent"
                            pagination={{
                                total:
                                    usageDetailsResponse?.eventInfo?.length ||
                                    1,
                                pageSize: currentPageSize,
                                onShowSizeChange: onShowSizeChange,
                            }}
                            onChange={(currentPagination) => {
                                onPaginationChange(currentPagination);
                            }}
                        />
                    </Row>
                    {usageDetailsResponse?.moreRows ? (
                        <Row span={24}>
                            <Col span={24} className="more-row-container">
                                <Button
                                    style={{ marginBottom: 16 }}
                                    type="primary"
                                    onClick={() => {
                                        setPagination({
                                            ...pagination,
                                            paginationInfo: {
                                                ...pagination?.paginationInfo,
                                                pageNumber:
                                                    pagination?.paginationInfo
                                                        ?.pageNumber + 1,
                                            },
                                        });
                                        getUsageDetails(true);
                                    }}
                                >
                                    More Rows
                                </Button>
                            </Col>
                        </Row>
                    ) : null}
                </>
            ) : (
                ''
            )}
        </>
    );
}
