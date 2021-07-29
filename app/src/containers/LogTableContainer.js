import Loading from "../components/Loading";
import React from "react";
import Table from "../components/Table";

/**
 * 로그 데이터에 기반한 표 구성
 *
 * @returns {JSX.Element} 로그 데이터 기반 표 컴포넌트
 */

function LogTableContainer({ loading, logsData }) {
  // 로그 카테고리
  const categories = {
    center_name: "어린이집 명",
    anomaly_type: "의심 유형",
    record_date: "발생 시간",
    address: "상세주소",
  };

  if (loading) return <Loading />;

  return <Table data={logsData} categories={categories} checkOpt={false} />;
}
export default LogTableContainer;
