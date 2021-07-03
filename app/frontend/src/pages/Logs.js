import DetailLogTableContainer from "../containers/DetailLogTableContainer";
import React from "react";

/**
 * `/logs` 페이지 렌더링
 *
 * @return {JSX.Element} `/logs` 페이지를 구성하는 컴포넌트
 */
function Logs() {
  return (
    <>
      <section className="section logs">
        <div className="container logs-section">
          <DetailLogTableContainer />
        </div>
      </section>
    </>
  );
}
export default Logs;
