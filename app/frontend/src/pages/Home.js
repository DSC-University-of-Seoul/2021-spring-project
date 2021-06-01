import ChartContainer from "../containers/ChartContainer";
import React from "react";
import SideBar from "../components/SideBar";

/**
 * `/` 페이지 렌더링
 *
 * @return {JSX.Element} `/` 페이지를 구성하는 컴포넌트
 */
function Home() {
  return (
    <>
      <SideBar />
      <section className="section">
        <ChartContainer />
      </section>
    </>
  );
}

export default Home;
