import {
  AiOutlineMinusSquare,
  AiOutlinePlusSquare,
  AiOutlineRetweet,
} from "react-icons/ai";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@material-ui/core/Button";
import CctvModalContainer from "../containers/CctvModalContainer";
import CctvTableContainer from "../containers/CctvTableContainer";
import Loading from "../components/Loading";
import { clickCctvData } from "../modules/cctvsTableEvent";
import { fetchCctvsData } from "../modules/cctvs";
import { openModal } from "../modules/cctvsModal";

/**
 * `/cctvs` 페이지 렌더링
 *
 * @return {JSX.Element} `/cctvs` 페이지를 구성하는 컴포넌트
 */

function Cctvs() {
  const { loading, cctvsData } = useSelector((state) => state.cctvsReducer);
  const { selectedData, clickedData } = useSelector(
    (state) => state.cctvsTableEventReducer
  );
  const dispatch = useDispatch();

  // /cctvs 페이지 렌더링 시 CCTV 데이터 Fetch (READ)
  useEffect(() => {
    dispatch(fetchCctvsData());
  }, [dispatch]);

  // 생성 버튼 이벤트
  const createHandler = () => {
    dispatch(clickCctvData(null));
    dispatch(openModal("createData"));
  };
  // 변경 버튼 이벤트
  const updateHandler = () => {
    dispatch(openModal("updateData"));
  };
  // 삭제 버튼 이벤트
  const deleteHandler = () => {
    dispatch(openModal("deleteData"));
  };

  return (
    <>
      {/* CCTV 모달창 */}
      <CctvModalContainer
        selectedData={selectedData}
        clickedData={clickedData}
      />
      <section className="section cctvs">
        {/* CCTV 기능 버튼 셋*/}
        <div className="cctvs-menu">
          <Button
            data-id="create"
            variant="outlined"
            startIcon={<AiOutlinePlusSquare />}
            onClick={createHandler}
          >
            추가
          </Button>
          <Button
            data-id="update"
            variant="outlined"
            color="primary"
            startIcon={<AiOutlineRetweet />}
            onClick={updateHandler}
          >
            변경
          </Button>
          <Button
            data-id="delete"
            variant="outlined"
            color="secondary"
            startIcon={<AiOutlineMinusSquare />}
            onClick={deleteHandler}
          >
            삭제
          </Button>
        </div>
        {/* CCTV 데이터 표 */}
        <div className="container cctvs-section">
          {loading ? (
            <Loading />
          ) : (
            cctvsData && <CctvTableContainer cctvsData={cctvsData} />
          )}
        </div>
      </section>
    </>
  );
}

export default Cctvs;
