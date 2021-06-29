/**
 * 백엔드 API를 통해 CCTV 데이터 관리
 */

import axios from "axios";

const CCTVS_DATA_LOADING = "cctvs/CCTVS_DATA_LOADING";
const CCTVS_DATA_FETCH = "cctvs/CCTVS_DATA_FETCH";
const CCTVS_DATA_CREATE = "cctvs/CCTVS_DATA_CREATE";
const CCTVS_DATA_UPDATE = "cctvs/CCTVS_DATA_UPDATE";
const CCTVS_DATA_DELETE = "cctvs/CCTVS_DATA_DELETE";
const CCTVS_DATA_ERROR = "cctvs/CCTVS_DATA_ERROR";

// MAC 주소 Formatting
const macFormat = (macString) => {
  let macAddress = [];

  for (let i = 0; i < macString.length; i += 2) {
    macAddress.push(macString.substr(i, 2));
  }
  return macAddress.join("-");
};
// 날짜 Formatting
const dateFormat = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month < 10 ? "0" + String(month) : month}-${
    day < 10 ? "0" + String(day) : day
  }`;
};

// 모든 CCTV Data 가져오기 (GET)
export const fetchCctvsData = () => async (dispatch) => {
  try {
    dispatch({ type: CCTVS_DATA_LOADING });

    const cctvsData = await axios.get(
      `${process.env.REACT_APP_API_SERVER}/api/cctvs`
    );
    const formatData = cctvsData.data.map((cctvData) => {
      const installDate = new Date(cctvData.install_date);
      const uninstallDate = new Date(cctvData.uninstall_date);

      return {
        ...cctvData,
        cctv_mac: macFormat(cctvData.cctv_mac),
        install_date: dateFormat(installDate),
        uninstall_date: dateFormat(uninstallDate),
      };
    });

    dispatch({ type: CCTVS_DATA_FETCH, payload: formatData });
  } catch (e) {
    dispatch({ type: CCTVS_DATA_ERROR, payload: e });
  }
};
export const createCctvsData = (cctvData) => async (dispatch) => {};
export const updateCctvsData = (cctvData) => async (dispatch) => {};

// CCTV Data 삭제하기 (DELETE)
export const deleteCctvsData = (deleteData) => async (dispatch) => {
  try {
    dispatch({ type: CCTVS_DATA_LOADING });

    for (const data of deleteData) {
      await axios.delete(
        `${process.env.REACT_APP_API_SERVER}/api/cctvs/${data.cctv_mac}`
      );
    }

    dispatch({ type: CCTVS_DATA_DELETE, payload: deleteData });
  } catch (e) {
    dispatch({ type: CCTVS_DATA_ERROR, payload: e });
  }
};

const initialState = {
  loading: false,
  cctvsData: [],
  error: null,
};

export default function cctvsReducer(state = initialState, action) {
  switch (action.type) {
    case CCTVS_DATA_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CCTVS_DATA_FETCH:
      return {
        ...state,
        loading: false,
        cctvsData: action.payload,
        error: null,
      };
    case CCTVS_DATA_CREATE:
      return;
    case CCTVS_DATA_UPDATE:
      return;
    case CCTVS_DATA_DELETE:
      return {
        ...state,
        loading: false,
        cctvsData: state.cctvsData.filter(
          (data) =>
            !action.payload.find(
              (deleteData) => deleteData.cctv_mac === data.cctv_mac
            )
        ),
        error: null,
      };
    case CCTVS_DATA_ERROR:
      return {
        ...state,
        loading: false,
        cctvsData: [],
        error: action.payload,
      };
    default:
      return state;
  }
}
